-- 1. Tabla de Perfiles de Usuario (Esquema Público)
CREATE TABLE IF NOT EXISTS perfiles_usuario (
    id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email       TEXT NOT NULL,
    nombre      TEXT,
    avatar_url  TEXT,
    rol         TEXT DEFAULT 'admin' CHECK (rol IN ('admin', 'superadmin')),
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Habilitar RLS
ALTER TABLE perfiles_usuario ENABLE ROW LEVEL SECURITY;

-- 3. Políticas de RLS
CREATE POLICY "Usuarios pueden ver su propio perfil" 
    ON perfiles_usuario FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Usuarios pueden actualizar su propio perfil" 
    ON perfiles_usuario FOR UPDATE 
    USING (auth.uid() = id);

-- 4. Función de Trigger para nuevos usuarios
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.perfiles_usuario (id, email, nombre)
    VALUES (
        NEW.id, 
        NEW.email, 
        COALESCE(NEW.raw_user_meta_data->>'nombre', split_part(NEW.email, '@', 1))
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Vincular el Trigger a auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Sincronización inicial (opcional - para usuarios ya existentes)
INSERT INTO public.perfiles_usuario (id, email, nombre)
SELECT id, email, split_part(email, '@', 1)
FROM auth.users
ON CONFLICT (id) DO NOTHING;
