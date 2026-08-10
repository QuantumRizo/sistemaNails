-- Migración para crear la tabla dinámica de categorías de servicios

-- 1. Crear tabla categorias_servicio
CREATE TABLE IF NOT EXISTS public.categorias_servicio (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    descripcion TEXT,
    imagen_url TEXT,
    orden INTEGER DEFAULT 0,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Añadir políticas de lectura pública a las categorías
ALTER TABLE public.categorias_servicio ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura pública de categorias" 
ON public.categorias_servicio FOR SELECT TO anon USING (true);

CREATE POLICY "Lectura autenticada de categorias" 
ON public.categorias_servicio FOR SELECT TO authenticated USING (true);

-- 3. Modificar la tabla 'servicios' para enlazarla con la categoría
ALTER TABLE public.servicios ADD COLUMN categoria_id UUID REFERENCES public.categorias_servicio(id) ON DELETE SET NULL;

-- 4. Crear el bucket de Storage para las imágenes de las categorías
INSERT INTO storage.buckets (id, name, public) 
VALUES ('categorias', 'categorias', true)
ON CONFLICT (id) DO NOTHING;

-- 5. Crear políticas públicas para el bucket 'categorias'
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'categorias');

CREATE POLICY "Admin Insert Access" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'categorias' AND (auth.role() = 'authenticated'));

-- 6. Insertar categorías con IDs estables. Migraciones de catálogo posteriores
-- referencian estos IDs, por lo que no deben depender de gen_random_uuid().
INSERT INTO public.categorias_servicio (id, nombre, descripcion, orden) VALUES
('a1eabd89-96d7-43f5-a443-0baeffe70129', 'Esmaltado Permanente', 'La novedosa técnica que ha revolucionado el mundo de las uñas: el único esmaltado permanente de larga duración y 20Free.', 1),
('c0000000-0000-4000-8000-000000000002', 'Uñas Esculpidas', 'Uñas esculpidas con las mejores técnicas del mercado: uñas de gel, uñas en acrílico... ¡Ponte en buenas manos!', 2),
('82bf9ef7-ee2b-4b02-accd-f937ac15c100', 'Manicura & Spa', '¡Tus manos hablan de ti! Cuídalas con nuestros servicios de manicura: limar y esmaltar, manicura básica, spa, etc.', 3),
('c0000000-0000-4000-8000-000000000004', 'Cuidado Facial', 'Protocolos de higiene profunda y tratamientos personalizados para una piel luminosa, sana y revitalizada.', 4),
('c0000000-0000-4000-8000-000000000005', 'Masajes Terapéuticos', 'Un refugio para el estrés. Sesiones de relajación profunda y reflexología para restaurar tu equilibrio corporal y mental.', 5),
('95ef0958-5fd3-4735-8a60-a2bf8d5a56ef', 'Pedicura Avanzada', 'Salud y estética integral para tus pies. Desde relajantes sesiones spa hasta pedicuras técnicas especializadas.', 6),
('a4d34ee1-80c5-4a7c-9197-9c845fc4ab35', 'Eyes & Brows', 'Realzamos tu mirada. Diseños de cejas y elevación de pestañas que enmarcan tu rostro con elegancia y naturalidad.', 7),
('7750ee93-274a-4421-a572-feefaeef8bf3', 'Depilación Premium', 'Suavidad duradera con técnicas delicadas y efectivas. Una experiencia de depilación profesional en un ambiente de confort.', 8),
('bb2219d8-518a-40f3-9c52-2ba1b3f4e402', 'Nail Art & Diseño', 'El toque artístico final. Decoraciones exclusivas y diseños personalizados para que tus uñas sean una obra de arte.', 9);
