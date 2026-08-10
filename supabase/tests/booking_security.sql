BEGIN;

CREATE EXTENSION IF NOT EXISTS pgtap WITH SCHEMA extensions;
SET search_path = public, extensions;

SELECT plan(16);

SELECT ok(
  has_function_privilege('anon', 'public.crear_reserva_publica(text,text,text,uuid,date,text,uuid[],text,uuid)', 'EXECUTE'),
  'anon can execute the public booking RPC'
);
SELECT ok(
  NOT has_function_privilege('anon', 'public.asignar_pin_empleada(uuid,text)', 'EXECUTE'),
  'anon cannot assign employee PINs'
);
SELECT ok(
  NOT has_function_privilege('anon', 'public.consume_public_booking_rate_limit(text,integer,interval)', 'EXECUTE'),
  'anon cannot call the internal rate limiter directly'
);
SELECT ok(
  NOT has_table_privilege('anon', 'public.citas', 'SELECT'),
  'anon cannot read appointments directly'
);
SELECT ok(
  has_column_privilege('anon', 'public.perfiles_empleadas', 'nombre', 'SELECT'),
  'anon can read the public employee name'
);
SELECT ok(
  NOT has_column_privilege('anon', 'public.perfiles_empleadas', 'pin_hash', 'SELECT'),
  'anon cannot read employee PIN hashes'
);

INSERT INTO public.clientes (nombre_completo, telefono_cel, email, sucursal_id)
VALUES (
  'Cliente Seguridad',
  '5559999999',
  'privado@example.com',
  'c0fef048-89eb-47c7-b480-92f14312d7c3'
);

SELECT is(
  public.verificar_cliente_por_telefono('5559999999')::jsonb,
  '{"existe": true}'::jsonb,
  'phone lookup reveals only whether a client exists'
);
SELECT is(
  public.verificar_cliente_por_telefono('not-a-phone')::jsonb,
  '{"existe": false}'::jsonb,
  'invalid phone lookup reveals no client data'
);

CREATE TEMP TABLE test_context AS
SELECT (
  (now() AT TIME ZONE 'America/Mexico_City')::date
  + CASE
      WHEN extract(isodow FROM (now() AT TIME ZONE 'America/Mexico_City')::date)::integer = 1 THEN 7
      ELSE 8 - extract(isodow FROM (now() AT TIME ZONE 'America/Mexico_City')::date)::integer
    END
)::date AS booking_date;
GRANT SELECT ON test_context TO anon;

SELECT ok(
  '19:30' = ANY(public.obtener_horarios_disponibles(
    'c0fef048-89eb-47c7-b480-92f14312d7c3',
    (SELECT booking_date FROM test_context),
    ARRAY['adaa7a68-5e03-4174-b6b3-05cb5472b518'::uuid],
    '47e7971b-c54f-4550-826c-20f9a02fd99c'
  )),
  'a service may start when it finishes exactly at closing time'
);
SELECT ok(
  NOT ('19:45' = ANY(public.obtener_horarios_disponibles(
    'c0fef048-89eb-47c7-b480-92f14312d7c3',
    (SELECT booking_date FROM test_context),
    ARRAY['adaa7a68-5e03-4174-b6b3-05cb5472b518'::uuid],
    '47e7971b-c54f-4550-826c-20f9a02fd99c'
  ))),
  'a service cannot run past closing time'
);

SET LOCAL ROLE anon;

SELECT ok(
  (public.crear_reserva_publica(
    '5559999999', 'Nombre ignorado', 'otro@example.com',
    'c0fef048-89eb-47c7-b480-92f14312d7c3',
    (SELECT booking_date FROM test_context), '19:30',
    ARRAY['adaa7a68-5e03-4174-b6b3-05cb5472b518'::uuid],
    NULL, '47e7971b-c54f-4550-826c-20f9a02fd99c'
  )::jsonb ->> 'ok')::boolean,
  'anon can create a valid reservation'
);
SELECT is(
  public.crear_reserva_publica(
    '5559999998', 'Segundo cliente', NULL,
    'c0fef048-89eb-47c7-b480-92f14312d7c3',
    (SELECT booking_date FROM test_context), '19:30',
    ARRAY['adaa7a68-5e03-4174-b6b3-05cb5472b518'::uuid],
    NULL, '47e7971b-c54f-4550-826c-20f9a02fd99c'
  )::jsonb ->> 'error',
  'El horario ya no está disponible',
  'the same employee cannot be double-booked'
);
SELECT is(
  public.crear_reserva_publica(
    '5559999997', 'Fuera de horario', NULL,
    'c0fef048-89eb-47c7-b480-92f14312d7c3',
    (SELECT booking_date FROM test_context), '19:45',
    ARRAY['adaa7a68-5e03-4174-b6b3-05cb5472b518'::uuid],
    NULL, '47e7971b-c54f-4550-826c-20f9a02fd99c'
  )::jsonb ->> 'error',
  'El horario ya no está disponible',
  'booking rejects a service that would run past closing'
);

DO $rate_limit_attempts$
BEGIN
  FOR i IN 1..5 LOOP
    PERFORM public.crear_reserva_publica(
      '5559999996', 'Intento limitado', NULL,
      'c0fef048-89eb-47c7-b480-92f14312d7c3',
      (SELECT booking_date FROM test_context), '19:30',
      ARRAY['adaa7a68-5e03-4174-b6b3-05cb5472b518'::uuid],
      NULL, '47e7971b-c54f-4550-826c-20f9a02fd99c'
    );
  END LOOP;
END;
$rate_limit_attempts$;
SELECT is(
  public.crear_reserva_publica(
    '5559999996', 'Intento limitado', NULL,
    'c0fef048-89eb-47c7-b480-92f14312d7c3',
    (SELECT booking_date FROM test_context), '19:30',
    ARRAY['adaa7a68-5e03-4174-b6b3-05cb5472b518'::uuid],
    NULL, '47e7971b-c54f-4550-826c-20f9a02fd99c'
  )::jsonb ->> 'error',
  'Demasiados intentos. Intenta de nuevo en 15 minutos',
  'the sixth well-formed booking attempt is rate-limited'
);
SELECT ok(
  NOT has_function_privilege('anon', 'public.verificar_pin_empleada(uuid,text)', 'EXECUTE'),
  'anonymous users cannot verify employee PINs'
);
SELECT throws_ok(
  $$SELECT public.asignar_pin_empleada('47e7971b-c54f-4550-826c-20f9a02fd99c', '1234')$$,
  '42501',
  'permission denied for function asignar_pin_empleada',
  'anonymous users cannot call PIN assignment'
);

RESET ROLE;
SELECT * FROM finish();
ROLLBACK;
