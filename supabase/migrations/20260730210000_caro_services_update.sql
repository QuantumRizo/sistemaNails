-- =============================================================================
-- Migration: Services & Staff Updates from Caro's Feedback (2026-07-30)
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Corrección ortográfica: PEDROSA → PEDROZA
-- ─────────────────────────────────────────────────────────────────────────────
UPDATE perfiles_empleadas
SET nombre = 'VALERIA PEDROZA CARDOSO'
WHERE nombre = 'VALERIA PEDROSA CARDOSO';

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Actualizar duraciones de servicios existentes
-- ─────────────────────────────────────────────────────────────────────────────
UPDATE servicios SET duracion_slots = 4 WHERE id = 'f98a8ce3-81b3-45e7-a3e6-3d8166fd872f'; -- PEDICURA SPA: 3→4
UPDATE servicios SET duracion_slots = 1 WHERE id = '8f3b1f48-71fb-435b-a661-dcdd4a719226'; -- SUPLEMENTO MANICURA RUSA: 2→1
UPDATE servicios SET duracion_slots = 5 WHERE id = 'b8bf8fe9-9c8b-4aba-b620-368cf90ff61a'; -- LIFTING DE PESTAÑAS: 4→5
UPDATE servicios SET duracion_slots = 3 WHERE id = 'c259328c-22f4-4159-bb52-7b0642cc14cc'; -- PLANCHADO DE CEJAS: 2→3
UPDATE servicios SET duracion_slots = 2 WHERE id = '8c180e1e-62d1-43f7-9e56-656d5c5966b2'; -- TINTE DE PESTAÑAS: 3→2
UPDATE servicios SET duracion_slots = 1 WHERE id = '7ec80b22-b020-461c-b4a8-32e69a8b2dfb'; -- DEPILACION CEJA SIN DISEÑO: 3→1

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Actualizar precio de Guante de Keratina: $120 → $100
-- ─────────────────────────────────────────────────────────────────────────────
UPDATE servicios SET precio = 100 WHERE id = 'b7237197-11fc-4ca5-b1b5-eb0398b8d840'; -- SUPLEMENTO GUANTE DE KERATINA

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Esmaltado en Gel → renombrar a GEL EN MANOS + agregar GEL EN PIES
-- ─────────────────────────────────────────────────────────────────────────────
UPDATE servicios
SET nombre = 'GEL EN MANOS'
WHERE id = 'adaa7a68-5e03-4174-b6b3-05cb5472b518';

INSERT INTO servicios (nombre, duracion_slots, precio, activo, categoria_id)
VALUES ('GEL EN PIES', 2, 280, true, 'a1eabd89-96d7-43f5-a443-0baeffe70129')
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. Nuevos servicios
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO servicios (nombre, duracion_slots, precio, activo, categoria_id) VALUES
  -- Esmaltado
  ('SOLO RETIRO',                                                     2,  120, true, 'a1eabd89-96d7-43f5-a443-0baeffe70129'),
  -- Manicura & Spa
  ('LIMADO Y ESMALTADO',                                              1,  130, true, '82bf9ef7-ee2b-4b02-accd-f937ac15c100'),
  ('CORTE DE UÑAS',                                                   1,   80, true, '82bf9ef7-ee2b-4b02-accd-f937ac15c100'),
  ('REPONER UNA UÑA',                                                 1,   60, true, '82bf9ef7-ee2b-4b02-accd-f937ac15c100'),
  -- Pedicura Avanzada
  ('PEDICURA RUSA',                                                   1,  120, true, '95ef0958-5fd3-4735-8a60-a2bf8d5a56ef'),
  -- Eyes & Brows
  ('HENNA',                                                           2,  500, true, 'a4d34ee1-80c5-4a7c-9197-9c845fc4ab35'),
  ('PESTAÑAS HOLLYWOOD',                                              8, 1500, true, 'a4d34ee1-80c5-4a7c-9197-9c845fc4ab35'),
  ('MANTENIMIENTO PESTAÑAS HOLLYWOOD',                                5,  700, true, 'a4d34ee1-80c5-4a7c-9197-9c845fc4ab35'),
  ('PESTAÑAS MEGAVOLUMEN',                                           10, 2000, true, 'a4d34ee1-80c5-4a7c-9197-9c845fc4ab35'),
  ('MANTENIMIENTO PESTAÑAS MEGAVOLUMEN',                              6, 1000, true, 'a4d34ee1-80c5-4a7c-9197-9c845fc4ab35'),
  ('PESTAÑAS VOLUMEN / HIBRIDAS',                                     2, 1800, true, 'a4d34ee1-80c5-4a7c-9197-9c845fc4ab35'),
  ('MANTENIMIENTO PESTAÑAS VOLUMEN / HIBRIDAS',                       6,  900, true, 'a4d34ee1-80c5-4a7c-9197-9c845fc4ab35'),
  ('RETIRO DE PESTAÑAS',                                              2,  220, true, 'a4d34ee1-80c5-4a7c-9197-9c845fc4ab35'),
  -- Depilación Premium
  ('DEPILACION BIGOTE / MENTON / PATILLA / FRENTE / NARIZ / POMULOS',1,  130, true, '7750ee93-274a-4421-a572-feefaeef8bf3'),
  ('DEPILACION MEDIA CARA SIN CEJAS',                                 3,  440, true, '7750ee93-274a-4421-a572-feefaeef8bf3'),
  ('DEPILACION BIKINI BASICO',                                        2,  500, true, '7750ee93-274a-4421-a572-feefaeef8bf3'),
  ('DEPILACION ESPALDA COMPLETA',                                     2,  700, true, '7750ee93-274a-4421-a572-feefaeef8bf3'),
  ('DEPILACION MANOS HOMBRES',                                        1,   60, true, '7750ee93-274a-4421-a572-feefaeef8bf3'),
  ('DEPILACION MEDIA ESPALDA',                                        1,  430, true, '7750ee93-274a-4421-a572-feefaeef8bf3'),
  ('DEPILACION MEDIAS PIERNAS',                                       2,  600, true, '7750ee93-274a-4421-a572-feefaeef8bf3'),
  ('DEPILACION PIES HOMBRE',                                          1,   60, true, '7750ee93-274a-4421-a572-feefaeef8bf3')
ON CONFLICT DO NOTHING;
