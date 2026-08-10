-- Security and booking hardening.
-- 1. Removes public execution from privileged functions.
-- 2. Makes client self-service derive ownership from auth.uid().
-- 3. Adds a server-side availability RPC.
-- 4. Serializes public bookings per branch/day and rejects invalid hours.

REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM PUBLIC;
REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM anon;
REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM authenticated;

CREATE OR REPLACE FUNCTION public.verificar_cliente_por_telefono(p_telefono text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_telefono !~ '^[0-9]{10}$' THEN
    RETURN json_build_object('existe', false);
  END IF;

  RETURN json_build_object(
    'existe', EXISTS (
      SELECT 1 FROM public.clientes WHERE telefono_cel = p_telefono
    )
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.obtener_perfil_cliente(p_cliente_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_cliente record;
BEGIN
  SELECT id, nombre_completo, telefono_cel, email, created_at, num_cliente
  INTO v_cliente
  FROM public.clientes
  WHERE id = p_cliente_id
    AND auth_user_id = auth.uid();

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;
  RETURN row_to_json(v_cliente);
END;
$$;

CREATE OR REPLACE FUNCTION public.actualizar_perfil_cliente(
  p_cliente_id uuid,
  p_nombre_completo text,
  p_email text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN json_build_object('error', 'Usuario no autenticado');
  END IF;
  IF p_nombre_completo IS NULL OR length(trim(p_nombre_completo)) NOT BETWEEN 1 AND 150 THEN
    RETURN json_build_object('error', 'Nombre inválido');
  END IF;
  IF p_email IS NOT NULL AND length(trim(p_email)) > 254 THEN
    RETURN json_build_object('error', 'Correo inválido');
  END IF;

  UPDATE public.clientes
  SET nombre_completo = trim(p_nombre_completo),
      email = NULLIF(trim(p_email), '')
  WHERE id = p_cliente_id
    AND auth_user_id = auth.uid();

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Cliente no encontrado');
  END IF;
  RETURN json_build_object('ok', true);
END;
$$;

CREATE OR REPLACE FUNCTION public.cancelar_cita_cliente(
  p_cita_id uuid,
  p_cliente_id uuid
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN json_build_object('error', 'Usuario no autenticado');
  END IF;

  UPDATE public.citas c
  SET estado = 'Cancelada'
  FROM public.clientes cl
  WHERE c.id = p_cita_id
    AND c.cliente_id = p_cliente_id
    AND cl.id = c.cliente_id
    AND cl.auth_user_id = auth.uid()
    AND c.estado = 'Programada';

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Cita no encontrada o no cancelable');
  END IF;
  RETURN json_build_object('ok', true);
END;
$$;

ALTER TABLE public.perfiles_empleadas
  ADD COLUMN IF NOT EXISTS pin_failed_attempts integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS pin_locked_until timestamptz;

CREATE OR REPLACE FUNCTION public.asignar_pin_empleada(p_empleada_id uuid, p_pin text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.perfiles_usuario
    WHERE id = auth.uid() AND rol IN ('admin', 'superadmin')
  ) THEN
    RAISE EXCEPTION 'Permisos insuficientes';
  END IF;
  IF p_pin !~ '^[0-9]{4}$' THEN
    RAISE EXCEPTION 'El PIN debe contener exactamente 4 dígitos';
  END IF;

  UPDATE public.perfiles_empleadas
  SET pin_hash = extensions.crypt(p_pin, extensions.gen_salt('bf')),
      pin_failed_attempts = 0,
      pin_locked_until = NULL
  WHERE id = p_empleada_id AND activo = true;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Empleada no encontrada';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.verificar_pin_empleada(p_empleada_id uuid, p_pin text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_emp public.perfiles_empleadas%rowtype;
  v_valid boolean;
  v_attempts integer;
BEGIN
  IF auth.uid() IS NULL OR p_pin !~ '^[0-9]{4}$' THEN
    RETURN false;
  END IF;

  SELECT * INTO v_emp
  FROM public.perfiles_empleadas
  WHERE id = p_empleada_id AND activo = true
  FOR UPDATE;

  IF NOT FOUND OR v_emp.pin_hash IS NULL THEN
    RETURN false;
  END IF;
  IF v_emp.pin_locked_until IS NOT NULL AND v_emp.pin_locked_until > now() THEN
    RETURN false;
  END IF;

  v_valid := v_emp.pin_hash = extensions.crypt(p_pin, v_emp.pin_hash);
  IF v_valid THEN
    UPDATE public.perfiles_empleadas
    SET pin_failed_attempts = 0, pin_locked_until = NULL
    WHERE id = p_empleada_id;
    RETURN true;
  END IF;

  v_attempts := v_emp.pin_failed_attempts + 1;
  UPDATE public.perfiles_empleadas
  SET pin_failed_attempts = CASE WHEN v_attempts >= 5 THEN 0 ELSE v_attempts END,
      pin_locked_until = CASE WHEN v_attempts >= 5 THEN now() + interval '5 minutes' ELSE NULL END
  WHERE id = p_empleada_id;
  RETURN false;
END;
$$;

CREATE OR REPLACE FUNCTION public.aprobar_vacaciones(
  p_solicitud_id uuid,
  p_admin_id uuid,
  p_notas text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_sol public.solicitudes_vacaciones%rowtype;
  v_suc public.sucursales%rowtype;
  v_dia date;
  v_config jsonb;
  v_open time;
  v_close time;
BEGIN
  IF p_admin_id IS DISTINCT FROM auth.uid() OR NOT EXISTS (
    SELECT 1 FROM public.perfiles_usuario
    WHERE id = auth.uid() AND rol IN ('admin', 'superadmin')
  ) THEN
    RAISE EXCEPTION 'Permisos insuficientes';
  END IF;

  SELECT * INTO v_sol
  FROM public.solicitudes_vacaciones
  WHERE id = p_solicitud_id
  FOR UPDATE;
  IF NOT FOUND OR v_sol.estado <> 'pendiente' THEN
    RAISE EXCEPTION 'Solicitud no encontrada o ya procesada';
  END IF;
  SELECT * INTO v_suc FROM public.sucursales WHERE id = v_sol.sucursal_id;

  UPDATE public.solicitudes_vacaciones
  SET estado = 'aprobada', notas_admin = p_notas,
      reviewed_by = auth.uid(), reviewed_at = now()
  WHERE id = p_solicitud_id;

  v_dia := v_sol.fecha_inicio;
  WHILE v_dia <= v_sol.fecha_fin LOOP
    v_config := v_suc.horarios_por_dia -> extract(dow FROM v_dia)::integer::text;
    IF NOT coalesce((v_config->>'cerrado')::boolean, false) THEN
      v_open := coalesce((v_config->>'apertura')::time, v_suc.hora_apertura);
      v_close := coalesce((v_config->>'cierre')::time, v_suc.hora_cierre);
      INSERT INTO public.bloqueos_agenda (empleada_id, fecha, hora_inicio, hora_fin, motivo, origen)
      VALUES (v_sol.empleada_id, v_dia, v_open, v_close, 'Vacaciones aprobadas', 'vacaciones')
      ON CONFLICT DO NOTHING;
    END IF;
    v_dia := v_dia + 1;
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION public.rechazar_vacaciones(
  p_solicitud_id uuid,
  p_admin_id uuid,
  p_notas text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF p_admin_id IS DISTINCT FROM auth.uid() OR NOT EXISTS (
    SELECT 1 FROM public.perfiles_usuario
    WHERE id = auth.uid() AND rol IN ('admin', 'superadmin')
  ) THEN
    RAISE EXCEPTION 'Permisos insuficientes';
  END IF;

  UPDATE public.solicitudes_vacaciones
  SET estado = 'rechazada', notas_admin = p_notas,
      reviewed_by = auth.uid(), reviewed_at = now()
  WHERE id = p_solicitud_id AND estado = 'pendiente';
  IF NOT FOUND THEN RAISE EXCEPTION 'Solicitud no encontrada o ya procesada'; END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.obtener_horarios_disponibles(
  p_sucursal_id uuid,
  p_fecha date,
  p_servicio_ids uuid[],
  p_empleada_id uuid DEFAULT NULL
)
RETURNS text[]
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_suc public.sucursales%rowtype;
  v_emp uuid;
  v_duration integer;
  v_dow integer;
  v_config jsonb;
  v_open time;
  v_close time;
  v_open_slot integer;
  v_close_slot integer;
  v_service_count integer;
  v_slots text[] := ARRAY[]::text[];
  v_label text;
BEGIN
  IF p_fecha < (now() AT TIME ZONE 'America/Mexico_City')::date
     OR p_servicio_ids IS NULL
     OR array_length(p_servicio_ids, 1) NOT BETWEEN 1 AND 5 THEN
    RETURN v_slots;
  END IF;

  SELECT * INTO v_suc FROM public.sucursales WHERE id = p_sucursal_id;
  IF NOT FOUND THEN RETURN v_slots; END IF;

  SELECT sum(duracion_slots), count(*)
  INTO v_duration, v_service_count
  FROM public.servicios
  WHERE id = ANY(p_servicio_ids) AND activo = true;
  IF v_service_count <> array_length(p_servicio_ids, 1) OR v_duration IS NULL THEN
    RETURN v_slots;
  END IF;

  v_dow := extract(dow FROM p_fecha)::integer;
  v_config := v_suc.horarios_por_dia -> v_dow::text;
  IF v_config IS NOT NULL THEN
    IF coalesce((v_config->>'cerrado')::boolean, false) THEN RETURN v_slots; END IF;
    v_open := (v_config->>'apertura')::time;
    v_close := (v_config->>'cierre')::time;
  ELSIF v_dow IN (0, 6) THEN
    v_open := coalesce(v_suc.hora_apertura_finde, v_suc.hora_apertura);
    v_close := coalesce(v_suc.hora_cierre_finde, v_suc.hora_cierre);
  ELSE
    v_open := v_suc.hora_apertura;
    v_close := v_suc.hora_cierre;
  END IF;

  v_open_slot := extract(hour FROM v_open)::integer * 4 + extract(minute FROM v_open)::integer / 15;
  v_close_slot := extract(hour FROM v_close)::integer * 4 + extract(minute FROM v_close)::integer / 15;

  FOR v_emp IN
    SELECT id FROM public.perfiles_empleadas
    WHERE activo = true
      AND sucursal_id = p_sucursal_id
      AND (p_empleada_id IS NULL OR id = p_empleada_id)
  LOOP
    FOR v_start IN v_open_slot..(v_close_slot - v_duration) LOOP
      CONTINUE WHEN EXISTS (
        SELECT 1 FROM public.citas c
        WHERE c.empleada_id = v_emp
          AND c.fecha = p_fecha
          AND c.estado <> 'Cancelada'
          AND v_start < (
            extract(hour FROM c.bloque_inicio)::integer * 4
            + extract(minute FROM c.bloque_inicio)::integer / 15
            + coalesce(c.duracion_manual_slots, 4)
          )
          AND v_start + v_duration > (
            extract(hour FROM c.bloque_inicio)::integer * 4
            + extract(minute FROM c.bloque_inicio)::integer / 15
          )
      );
      CONTINUE WHEN EXISTS (
        SELECT 1 FROM public.bloqueos_agenda b
        WHERE b.empleada_id = v_emp
          AND b.fecha = p_fecha
          AND v_start < (extract(hour FROM b.hora_fin)::integer * 4 + extract(minute FROM b.hora_fin)::integer / 15)
          AND v_start + v_duration > (extract(hour FROM b.hora_inicio)::integer * 4 + extract(minute FROM b.hora_inicio)::integer / 15)
      );

      v_label := lpad((v_start / 4)::text, 2, '0') || ':' || lpad(((v_start % 4) * 15)::text, 2, '0');
      IF NOT v_label = ANY(v_slots) THEN v_slots := array_append(v_slots, v_label); END IF;
    END LOOP;
  END LOOP;

  SELECT coalesce(array_agg(slot ORDER BY slot), ARRAY[]::text[])
  INTO v_slots FROM unnest(v_slots) AS slot;
  RETURN v_slots;
END;
$$;

-- Fixed-window limiter for the anonymous booking RPC. Identifiers are hashed so
-- the limiter never stores customer phone numbers in plaintext.
CREATE TABLE IF NOT EXISTS public.public_booking_rate_limits (
  identifier_hash text PRIMARY KEY,
  window_started_at timestamptz NOT NULL,
  attempts integer NOT NULL CHECK (attempts > 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS public_booking_rate_limits_updated_at_idx
  ON public.public_booking_rate_limits (updated_at);

ALTER TABLE public.public_booking_rate_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL PRIVILEGES ON public.public_booking_rate_limits FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.consume_public_booking_rate_limit(
  p_identifier text,
  p_limit integer DEFAULT 5,
  p_window interval DEFAULT interval '15 minutes'
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_now timestamptz := clock_timestamp();
  v_attempts integer;
BEGIN
  IF p_identifier IS NULL OR p_limit < 1 OR p_window <= interval '0 seconds' THEN
    RETURN false;
  END IF;

  INSERT INTO public.public_booking_rate_limits (
    identifier_hash, window_started_at, attempts, updated_at
  ) VALUES (
    encode(extensions.digest('public-booking:' || p_identifier, 'sha256'), 'hex'),
    v_now, 1, v_now
  )
  ON CONFLICT (identifier_hash) DO UPDATE
  SET attempts = CASE
        WHEN public.public_booking_rate_limits.window_started_at <= v_now - p_window THEN 1
        ELSE public.public_booking_rate_limits.attempts + 1
      END,
      window_started_at = CASE
        WHEN public.public_booking_rate_limits.window_started_at <= v_now - p_window THEN v_now
        ELSE public.public_booking_rate_limits.window_started_at
      END,
      updated_at = v_now
  RETURNING attempts INTO v_attempts;

  RETURN v_attempts <= p_limit;
END;
$$;

REVOKE ALL ON FUNCTION public.consume_public_booking_rate_limit(text, integer, interval)
  FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.crear_reserva_publica(
  p_telefono text,
  p_nombre text,
  p_email text,
  p_sucursal_id uuid,
  p_fecha date,
  p_bloque_inicio text,
  p_servicio_ids uuid[],
  p_notas text DEFAULT NULL,
  p_empleada_id uuid DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cliente_id uuid;
  v_empleada_id uuid;
  v_cita_id uuid;
  v_duration integer;
  v_valid_count integer;
  v_start_time time;
  v_available text[];
  v_service_id uuid;
BEGIN
  IF p_telefono !~ '^[0-9]{10}$' THEN RETURN json_build_object('error', 'Teléfono inválido'); END IF;
  IF p_nombre IS NULL OR length(trim(p_nombre)) NOT BETWEEN 1 AND 150 THEN RETURN json_build_object('error', 'Nombre inválido'); END IF;
  IF p_email IS NOT NULL AND length(trim(p_email)) > 254 THEN RETURN json_build_object('error', 'Correo inválido'); END IF;
  IF p_notas IS NOT NULL AND length(p_notas) > 1000 THEN RETURN json_build_object('error', 'La nota es demasiado larga'); END IF;
  IF p_fecha < (now() AT TIME ZONE 'America/Mexico_City')::date THEN RETURN json_build_object('error', 'Fecha inválida'); END IF;
  IF p_servicio_ids IS NULL OR array_length(p_servicio_ids, 1) NOT BETWEEN 1 AND 5 THEN RETURN json_build_object('error', 'Selecciona entre 1 y 5 servicios'); END IF;
  IF p_bloque_inicio !~ '^(?:[01][0-9]|2[0-3]):(?:00|15|30|45)$' THEN RETURN json_build_object('error', 'Horario inválido'); END IF;
  v_start_time := p_bloque_inicio::time;

  SELECT count(*), sum(duracion_slots)
  INTO v_valid_count, v_duration
  FROM public.servicios
  WHERE id = ANY(p_servicio_ids) AND activo = true;
  IF v_valid_count <> array_length(p_servicio_ids, 1) OR v_duration IS NULL THEN
    RETURN json_build_object('error', 'Uno o más servicios no están disponibles');
  END IF;

  IF NOT public.consume_public_booking_rate_limit(p_telefono) THEN
    RETURN json_build_object('error', 'Demasiados intentos. Intenta de nuevo en 15 minutos');
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended(p_sucursal_id::text || ':' || p_fecha::text, 0));
  v_available := public.obtener_horarios_disponibles(p_sucursal_id, p_fecha, p_servicio_ids, p_empleada_id);
  IF NOT p_bloque_inicio = ANY(v_available) THEN
    RETURN json_build_object('error', 'El horario ya no está disponible');
  END IF;

  IF p_empleada_id IS NOT NULL THEN
    v_empleada_id := p_empleada_id;
  ELSE
    SELECT pe.id INTO v_empleada_id
    FROM public.perfiles_empleadas pe
    WHERE pe.activo = true AND pe.sucursal_id = p_sucursal_id
      AND NOT EXISTS (
        SELECT 1 FROM public.citas c
        WHERE c.empleada_id = pe.id AND c.fecha = p_fecha AND c.estado <> 'Cancelada'
          AND v_start_time < c.bloque_inicio + coalesce(c.duracion_manual_slots, 4) * interval '15 minutes'
          AND v_start_time + v_duration * interval '15 minutes' > c.bloque_inicio
      )
      AND NOT EXISTS (
        SELECT 1 FROM public.bloqueos_agenda b
        WHERE b.empleada_id = pe.id AND b.fecha = p_fecha
          AND v_start_time < b.hora_fin
          AND v_start_time + v_duration * interval '15 minutes' > b.hora_inicio
      )
    ORDER BY pe.id
    LIMIT 1;
  END IF;
  IF v_empleada_id IS NULL THEN RETURN json_build_object('error', 'No hay profesionales disponibles'); END IF;

  SELECT id INTO v_cliente_id FROM public.clientes WHERE telefono_cel = p_telefono LIMIT 1;
  IF v_cliente_id IS NULL THEN
    INSERT INTO public.clientes (nombre_completo, telefono_cel, email, sucursal_id, datos_extra)
    VALUES (trim(p_nombre), p_telefono, NULLIF(trim(p_email), ''), p_sucursal_id, '{}'::jsonb)
    RETURNING id INTO v_cliente_id;
  END IF;

  INSERT INTO public.citas (
    cliente_id, sucursal_id, empleada_id, fecha, bloque_inicio,
    estado, duracion_manual_slots, notas_cliente
  ) VALUES (
    v_cliente_id, p_sucursal_id, v_empleada_id, p_fecha, v_start_time,
    'Programada', v_duration, p_notas
  ) RETURNING id INTO v_cita_id;

  FOREACH v_service_id IN ARRAY p_servicio_ids LOOP
    INSERT INTO public.cita_servicios (cita_id, servicio_id) VALUES (v_cita_id, v_service_id);
  END LOOP;
  RETURN json_build_object('ok', true, 'cita_id', v_cita_id);
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'crear_reserva_publica failed: %', SQLERRM;
  RETURN json_build_object('error', 'No se pudo crear la reservación');
END;
$$;

-- Public surface: only non-sensitive catalog/booking functions.
GRANT EXECUTE ON FUNCTION public.verificar_cliente_por_telefono(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.obtener_horarios_disponibles(uuid, date, uuid[], uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.crear_reserva_publica(text, text, text, uuid, date, text, uuid[], text, uuid) TO anon, authenticated;

-- Authenticated self-service and staff functions.
GRANT EXECUTE ON FUNCTION public.obtener_perfil_cliente(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.actualizar_perfil_cliente(uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cancelar_cita_cliente(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.asignar_pin_empleada(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.verificar_pin_empleada(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.tiene_pin_empleada(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.vincular_cliente_auth(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.aprobar_vacaciones(uuid, uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rechazar_vacaciones(uuid, uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.decrementar_stock_producto(uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.siguiente_folio_ticket(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_primeras_sesiones(date, date, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_primeras_compras(date, date, uuid) TO authenticated;

-- These operations do not need owner privileges; RLS remains authoritative.
ALTER FUNCTION public.decrementar_stock_producto(uuid, integer) SECURITY INVOKER;
ALTER FUNCTION public.siguiente_folio_ticket(uuid) SECURITY INVOKER;
ALTER FUNCTION public.validar_disponibilidad_cita(uuid, date, time, time, uuid) SECURITY INVOKER;
ALTER FUNCTION public.get_primeras_sesiones(date, date, uuid) SECURITY INVOKER;
ALTER FUNCTION public.get_primeras_compras(date, date, uuid) SECURITY INVOKER;
GRANT EXECUTE ON FUNCTION public.validar_disponibilidad_cita(uuid, date, time, time, uuid) TO authenticated;

GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Anonymous clients only need the public catalog. Remove legacy table grants
-- even where RLS already hides rows, so forbidden requests fail explicitly.
REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon;
GRANT SELECT ON public.servicios, public.sucursales, public.categorias_servicio TO anon;

-- Do not expose PIN hashes through the anonymous employee catalog.
GRANT SELECT (id, nombre, activo, sucursal_id) ON public.perfiles_empleadas TO anon;
