-- Añadir campos de contratación y sueldos a perfiles_empleadas
ALTER TABLE perfiles_empleadas 
ADD COLUMN IF NOT EXISTS fecha_contratacion DATE,
ADD COLUMN IF NOT EXISTS sueldo_diario      NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS dias_descanso      TEXT[] DEFAULT '{}';

-- Comentario para documentación
COMMENT ON COLUMN perfiles_empleadas.dias_descanso IS 'Días de descanso semanales (ej: ["Lunes", "Domingo"])';
