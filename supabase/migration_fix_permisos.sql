-- ============================================================
-- SCRIPT DE REPARACIÓN DE PERMISOS (RLS) PARA USUARIOS AUTENTICADOS
-- ============================================================

-- 1. Asegurarnos que el rol authenticated tiene uso del esquema
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- 2. SUUCURSALES
DROP POLICY IF EXISTS "Allow all" ON sucursales;
DROP POLICY IF EXISTS "Permitir todo a usuarios autenticados" ON sucursales;
CREATE POLICY "Permitir todo a usuarios autenticados" ON sucursales FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON sucursales FOR ALL TO anon USING (true) WITH CHECK (true);

-- 3. PERFILES EMPLEADAS
DROP POLICY IF EXISTS "Allow all" ON perfiles_empleadas;
DROP POLICY IF EXISTS "Permitir todo a usuarios autenticados" ON perfiles_empleadas;
CREATE POLICY "Permitir todo a usuarios autenticados" ON perfiles_empleadas FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON perfiles_empleadas FOR ALL TO anon USING (true) WITH CHECK (true);

-- 4. CLIENTES
DROP POLICY IF EXISTS "Allow all" ON clientes;
DROP POLICY IF EXISTS "Permitir todo a usuarios autenticados" ON clientes;
CREATE POLICY "Permitir todo a usuarios autenticados" ON clientes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON clientes FOR ALL TO anon USING (true) WITH CHECK (true);

-- 5. SERVICIOS
DROP POLICY IF EXISTS "Allow all" ON servicios;
DROP POLICY IF EXISTS "Permitir todo a usuarios autenticados" ON servicios;
CREATE POLICY "Permitir todo a usuarios autenticados" ON servicios FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON servicios FOR ALL TO anon USING (true) WITH CHECK (true);

-- 6. CITAS
DROP POLICY IF EXISTS "Allow all" ON citas;
DROP POLICY IF EXISTS "Permitir todo a usuarios autenticados" ON citas;
CREATE POLICY "Permitir todo a usuarios autenticados" ON citas FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON citas FOR ALL TO anon USING (true) WITH CHECK (true);

-- 7. CITA SERVICIOS
DROP POLICY IF EXISTS "Allow all" ON cita_servicios;
DROP POLICY IF EXISTS "Permitir todo a usuarios autenticados" ON cita_servicios;
CREATE POLICY "Permitir todo a usuarios autenticados" ON cita_servicios FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON cita_servicios FOR ALL TO anon USING (true) WITH CHECK (true);

-- 8. BLOQUEOS AGENDA
DROP POLICY IF EXISTS "Allow all" ON bloqueos_agenda;
DROP POLICY IF EXISTS "Permitir todo a usuarios autenticados" ON bloqueos_agenda;
CREATE POLICY "Permitir todo a usuarios autenticados" ON bloqueos_agenda FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON bloqueos_agenda FOR ALL TO anon USING (true) WITH CHECK (true);

-- 9. PRODUCTOS
DROP POLICY IF EXISTS "Allow all" ON productos;
DROP POLICY IF EXISTS "Permitir todo a usuarios autenticados" ON productos;
CREATE POLICY "Permitir todo a usuarios autenticados" ON productos FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON productos FOR ALL TO anon USING (true) WITH CHECK (true);

-- 10. TICKETS
DROP POLICY IF EXISTS "Allow all" ON tickets;
DROP POLICY IF EXISTS "Permitir todo a usuarios autenticados" ON tickets;
CREATE POLICY "Permitir todo a usuarios autenticados" ON tickets FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON tickets FOR ALL TO anon USING (true) WITH CHECK (true);

-- 11. TICKET ITEMS
DROP POLICY IF EXISTS "Allow all" ON ticket_items;
DROP POLICY IF EXISTS "Permitir todo a usuarios autenticados" ON ticket_items;
CREATE POLICY "Permitir todo a usuarios autenticados" ON ticket_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON ticket_items FOR ALL TO anon USING (true) WITH CHECK (true);

-- 12. PAGOS
DROP POLICY IF EXISTS "Allow all" ON pagos;
DROP POLICY IF EXISTS "Permitir todo a usuarios autenticados" ON pagos;
CREATE POLICY "Permitir todo a usuarios autenticados" ON pagos FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON pagos FOR ALL TO anon USING (true) WITH CHECK (true);

-- 13. EVALUACIONES HOJA
DROP POLICY IF EXISTS "Allow all" ON evaluaciones_hoja;
DROP POLICY IF EXISTS "Permitir todo a usuarios autenticados" ON evaluaciones_hoja;
CREATE POLICY "Permitir todo a usuarios autenticados" ON evaluaciones_hoja FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON evaluaciones_hoja FOR ALL TO anon USING (true) WITH CHECK (true);
