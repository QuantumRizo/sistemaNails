-- Tabla para registrar si cada empleada cumplió sus metas mensuales ("la hoja")
CREATE TABLE IF NOT EXISTS evaluaciones_hoja (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empleada_id     UUID NOT NULL REFERENCES perfiles_empleadas(id) ON DELETE CASCADE,
  sucursal_id     UUID NOT NULL REFERENCES sucursales(id) ON DELETE CASCADE,
  mes             SMALLINT NOT NULL CHECK (mes BETWEEN 1 AND 12),
  anio            SMALLINT NOT NULL,
  cumplio_hoja    BOOLEAN NOT NULL DEFAULT FALSE,
  notas           TEXT,
  evaluado_en     TIMESTAMPTZ DEFAULT now(),
  UNIQUE (empleada_id, mes, anio)
);

ALTER TABLE evaluaciones_hoja ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON evaluaciones_hoja FOR ALL USING (true) WITH CHECK (true);

-- Índice para consultas por mes/año y sucursal
CREATE INDEX IF NOT EXISTS idx_evaluaciones_hoja_periodo
  ON evaluaciones_hoja (anio, mes, sucursal_id);
