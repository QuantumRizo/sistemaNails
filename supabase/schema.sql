-- =============================================================
-- SISTEMA sistemaNails — Gestión de Agenda de Uñas (Multi-sucursal)
-- Ejecutar en el SQL Editor de Supabase
-- =============================================================

-- ─── ENUMS ────────────────────────────────────────────────────
CREATE TYPE sexo_type AS ENUM ('Mujer', 'Hombre', 'Otro');
CREATE TYPE cita_status AS ENUM ('Programada', 'En curso', 'Finalizada', 'Cancelada', 'No asistió');

-- ─── SUCURSALES ───────────────────────────────────────────────
CREATE TABLE sucursales (
  id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL
);

INSERT INTO sucursales (nombre) VALUES
  ('Campos Eliseos'),
  ('Newton'),
  ('Euler'),
  ('Homero');

-- ─── PERFILES DE EMPLEADAS ────────────────────────────────────
-- Las empleadas son globales: trabajan en cualquier sucursal
CREATE TABLE perfiles_empleadas (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre        TEXT NOT NULL,
  nombre_corto  TEXT, -- Ej: Dan, Itz (para agenda)
  activo        BOOLEAN NOT NULL DEFAULT TRUE
);


-- ─── CLIENTES ─────────────────────────────────────────────────
CREATE TABLE clientes (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  num_cliente      SERIAL UNIQUE,
  nombre_completo  TEXT NOT NULL,
  telefono_cel     TEXT,
  email            TEXT,
  datos_extra      JSONB DEFAULT '{}'::jsonb,
  -- datos_extra keys: rfc, procedencia, sexo, fecha_nacimiento, pais, notas
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ─── SERVICIOS ────────────────────────────────────────────────
CREATE TABLE servicios (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre          TEXT NOT NULL,
  duracion_slots  INT NOT NULL DEFAULT 4,  -- bloques de 15 min (4 = 1 hora)
  precio          NUMERIC(10,2) NOT NULL DEFAULT 0,
  familia         TEXT,                    -- Esculpidas, Pedicura, Manicura, etc.
  activo          BOOLEAN DEFAULT TRUE
);

-- Servicios seed data
INSERT INTO servicios (nombre, duracion_slots, precio, familia) VALUES
  ('Manicura SPA',         4,  350, 'Manicura'),
  ('Manicura Express',     2,  200, 'Manicura'),
  ('Pedicura SPA',         6,  500, 'Pedicura'),
  ('Uñas Esculpidas',      8,  700, 'Esculpidas'),
  ('Uñas Acrílicas',       8,  650, 'Esculpidas'),
  ('Relleno',              6,  450, 'Esculpidas'),
  ('Esmaltado Permanente', 4,  300, 'Manicura'),
  ('Pedicura Express',     4,  350, 'Pedicura');

-- ─── CITAS ────────────────────────────────────────────────────
CREATE TABLE citas (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id     UUID REFERENCES clientes(id) ON DELETE CASCADE,
  empleada_id    UUID REFERENCES perfiles_empleadas(id) ON DELETE SET NULL,
  sucursal_id    UUID REFERENCES sucursales(id) ON DELETE CASCADE,
  fecha          DATE NOT NULL,
  bloque_inicio  TIME NOT NULL,
  estado         cita_status NOT NULL DEFAULT 'Programada',
  duracion_manual_slots INT, -- Override service-based duration
  comentarios    TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ─── CITA ↔ SERVICIOS (junction) ─────────────────────────────
CREATE TABLE cita_servicios (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cita_id     UUID REFERENCES citas(id) ON DELETE CASCADE,
  servicio_id UUID REFERENCES servicios(id) ON DELETE CASCADE
);

-- ─── BLOQUEOS DE AGENDA ───────────────────────────────────────
CREATE TABLE bloqueos_agenda (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empleada_id UUID REFERENCES perfiles_empleadas(id) ON DELETE CASCADE,
  fecha       DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin    TIME NOT NULL,
  motivo      TEXT DEFAULT 'Comida'  -- Comida / Descanso / Otro
);

-- ─── ÍNDICES ──────────────────────────────────────────────────
CREATE INDEX idx_citas_fecha        ON citas(fecha);
CREATE INDEX idx_citas_empleada     ON citas(empleada_id);
CREATE INDEX idx_citas_sucursal     ON citas(sucursal_id);
CREATE INDEX idx_clientes_telefono  ON clientes(telefono_cel);
CREATE INDEX idx_bloqueos_fecha     ON bloqueos_agenda(fecha);

-- ─── RLS (Row Level Security) ─────────────────────────────────
ALTER TABLE sucursales        ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfiles_empleadas ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes          ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicios         ENABLE ROW LEVEL SECURITY;
ALTER TABLE citas             ENABLE ROW LEVEL SECURITY;
ALTER TABLE cita_servicios    ENABLE ROW LEVEL SECURITY;
ALTER TABLE bloqueos_agenda   ENABLE ROW LEVEL SECURITY;

-- Por ahora: acceso total a anon key (ajustar según auth)
CREATE POLICY "Allow all" ON sucursales         FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON perfiles_empleadas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON clientes           FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON servicios          FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON citas              FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON cita_servicios     FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON bloqueos_agenda    FOR ALL USING (true) WITH CHECK (true);
