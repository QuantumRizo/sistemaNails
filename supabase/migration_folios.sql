-- =============================================================
-- MIGRACIÓN: Folios secuenciales de tickets por sucursal
-- y constraint de un solo turno de caja abierto
-- =============================================================

-- ─── TABLA DE FOLIOS ──────────────────────────────────────────
-- Mantiene un contador por sucursal para generar folios únicos
CREATE TABLE IF NOT EXISTS folios_ticket (
  sucursal_id   UUID PRIMARY KEY REFERENCES sucursales(id) ON DELETE CASCADE,
  ultimo_numero  INT NOT NULL DEFAULT 0
);

-- Pre-poblar una fila por sucursal existente
INSERT INTO folios_ticket (sucursal_id, ultimo_numero)
SELECT id, 0 FROM sucursales
ON CONFLICT (sucursal_id) DO NOTHING;

-- ─── FUNCIÓN RPC: siguiente folio ─────────────────────────────
-- Devuelve el siguiente número de ticket de forma atómica
-- usando un UPDATE ... RETURNING para evitar condiciones de carrera.
CREATE OR REPLACE FUNCTION siguiente_folio_ticket(p_sucursal_id UUID)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_nuevo INT;
BEGIN
  -- Si no existe fila para esta sucursal, crearla
  INSERT INTO folios_ticket (sucursal_id, ultimo_numero)
  VALUES (p_sucursal_id, 0)
  ON CONFLICT (sucursal_id) DO NOTHING;

  -- Incrementar y obtener el nuevo número atómicamente
  UPDATE folios_ticket
  SET ultimo_numero = ultimo_numero + 1
  WHERE sucursal_id = p_sucursal_id
  RETURNING ultimo_numero INTO v_nuevo;

  RETURN v_nuevo;
END;
$$;

-- ─── RLS PARA folios_ticket ───────────────────────────────────
ALTER TABLE folios_ticket ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON folios_ticket FOR ALL USING (true) WITH CHECK (true);

-- ─── CONSTRAINT: máximo 1 turno abierto por sucursal ─────────
-- Partial unique index: solo aplica cuando estado = 'Abierta'
CREATE UNIQUE INDEX IF NOT EXISTS idx_un_turno_abierto_por_sucursal
  ON turnos_caja (sucursal_id)
  WHERE estado = 'Abierta';

-- NOTA: Para ejecutar esta migración en Supabase:
-- 1. Ir al SQL Editor de Supabase
-- 2. Pegar y ejecutar este script
-- 3. Verificar que las tablas folios_ticket y la función existen
