# MUYMUY Beauty Studio - Monorepo Architecture

## Descripción del Proyecto

Un ecosistema digital completo para la administración y experiencia de clientes en MUYMUY Beauty Studio. 
El proyecto está estructurado como un **Monorepo** moderno que divide las responsabilidades entre una plataforma administrativa vía Web y una aplicación móvil nativa para la experiencia directa de las clientas.

---

## 🏗 Arquitectura y Estructura

El repositorio utiliza *npm workspaces* gestionados desde el `package.json` raíz, aunque la aplicación móvil se mantiene deliberadamente aislada para evitar conflictos de dependencias nativas.

```
muy_muy_beauty/
├── apps/
│   ├── web/        (Plataforma Administrativa y React SPA Vercel)
│   └── mobile/     (Aplicación Móvil iOS/Android en Expo React Native)
├── package.json    (Raíz Workspace npm)
└── vercel.json     (Reglas de ruteo y despliegue Nube)
```

---

## 🌐 Módulo Web (`apps/web`)

Sistema integral diseñado para la gestión y control del estudio.
- **Frontend**: React 19.2 + TypeScript + Vite 5.4.x
- **Gestión de Estado**: Zustand & React Query.
- **Estilos**: TailwindCSS v4.
- **Ruteo**: SPA gestionada en Node.js mediante reglas en `vercel.json`.

> [!WARNING]
> **Bloqueo de Versión Vite**:
> La versión de Vite se redujo deliberadamente al release `5.4.x` y el plugin `@vitejs/plugin-react` a la v4. **Prohibido actualizar a Vite 6 o Vite 8**. Las versiones superiores utilizan `rolldown`, lo cual causa errores fatales de *Native Bindings* (`@rolldown/binding-linux-x64-gnu`) en contenedores Linux de Vercel.

---

## 📱 Módulo Móvil (`apps/mobile`)

App diseñada para acercar el ecosistema de servicios a los clientes. Permite ver el catálogo, agendar citas en tiempo real ligadas a las sucursales, ver el historial y gestionar su perfil.
- **Framework**: React Native 0.81.4 bajo Expo SDK 54.0.0.
- **Frontend**: React 19.1 + TypeScript.
- **Estado**: Zustand + Supabase en local con persistencia.
- **Manejo de Rutas**: `expo-router` (requiere dependencia `expo-linking` forzada en SDK 54).

> [!CAUTION]
> **Aislamiento Móvil**:
> El directorio `apps/mobile` **NO** se encuentra mapeado dentro de los `workspaces` del `package.json` raíz. Esto se hizo a propósito para asegurar que dependencias muy estrictas exigidas por React Native no colisionen con las dependencias de la subcarpeta `web`. **Comandos en la app móvil deben siempre ejecutarse ubicándose físicamente dentro de `apps/mobile/`**.

---

## ☁️ Backend y Base de Datos

Todo el ecosistema se apoya sobre una infraestructura ágil usando **Supabase**.
- Autenticación y Perfiles.
- Bases de Datos PostgreSQL Relacional (Citas, Bloqueos de agenda, Clientes, Sucursales y Empleados).
- Seguridad y políticas de Row Level Security (RLS) configuradas por entorno.

---

## ⚙️ Instalación y Scripts Comunes

### Requisitos Previos
- Node.js (v24/v25 recomendado).
- Cuenta de Supabase válida con sus llaves.

### Configuración del Entorno Virtual Local
En la terminal (macOS/Unix), asegúrate de clonar y correr la instalación garantizando un correcto enlace usando los lockfiles existentes:

```bash
git clone https://github.com/QuantumRizo/muy_muy_beauty.git
cd muy_muy_beauty

# 1. Instalar depedencias web/globales garantizando estabilidad (En la ráz)
npm install

# 2. Levantar el proyecto Web
npm run web

# 3. Instalar y Levantar la App Móvil (Desde su propia carpeta)
cd apps/mobile
npm install
npx expo start --ios
```

### Variables de Entorno (`.env`)
Crear un entorno `.env` local en la raíz dependiendo del módulo que se vaya a invocar:
```env
# Ejemplo para la aplicación web
VITE_SUPABASE_URL=__su_url__
VITE_SUPABASE_ANON_KEY=__su_anon_key__

# En apps/mobile
EXPO_PUBLIC_SUPABASE_URL=__su_url__
EXPO_PUBLIC_SUPABASE_ANON_KEY=__su_anon_key__
```

---

## 🔒 Auditoría y Salud del Proyecto (Actualización Vercel)
A causa del ciclo de compilación en *Vercel*:
1. Todo intento de usar `bun install` mediante plataformas nube puede causar colisiones si se encuentra con lockfiles viejos. Asegúrese siempre de commitir el archivo `package-lock.json` de la raíz tras toda actualización importante para forzar a Vercel a acatar los árboles fijos desarrollados en local en macOS.
2. SPA catch-all (Admin, auth, dashboard) siempre recurrirá al archivo `vercel.json` estático anidado en el directorio especificado de despliegue.

---
*Privado / Software Propietario. Todos los derechos reservados a MUYMUY Beauty.*