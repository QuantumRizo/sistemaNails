-- =============================================================
-- ACTUALIZACIONES POS: Vendedores por Ítem y Stock de Inventario
-- =============================================================

-- 1. Añadir el Vendedor a cada concepto vendido (Ticket Item)
ALTER TABLE ticket_items 
ADD COLUMN vendedor_id UUID REFERENCES perfiles_empleadas(id) ON DELETE SET NULL;

-- 2. Añadir el Nombre del Vendedor (opcional pero muy útil para el reporte histórico si cambian el nombre de la empleada)
ALTER TABLE ticket_items 
ADD COLUMN vendedor_nombre TEXT;

-- 3. Crear función RPC para decrementar stock de forma segura
CREATE OR REPLACE FUNCTION decrementar_stock_producto(
  p_id UUID, 
  p_cantidad INT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE productos
  SET stock = stock - p_cantidad
  WHERE id = p_id;
END;
$$;
