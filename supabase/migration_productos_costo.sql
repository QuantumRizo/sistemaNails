-- Añadir columna de precio de costo a la tabla de productos
ALTER TABLE productos 
ADD COLUMN IF NOT EXISTS precio_costo NUMERIC(10,2) DEFAULT 0;

-- Comentario para documentación
COMMENT ON COLUMN productos.precio_costo IS 'Costo de adquisición del producto';
