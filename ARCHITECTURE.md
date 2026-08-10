# 🏗️ MUYMUY Beauty — Arquitectura del Monorepo

> **Última actualización:** Agosto 2026

---

## Estructura actual del proyecto

```
muy-muy-beauty/
│
├── apps/
│   ├── web/                    ← Dashboard admin + booking público (Vite + React 19 + TS)
│   │   ├── src/
│   │   │   ├── components/     ← UI agrupada por dominio (Agenda, Citas, Dashboard…)
│   │   │   ├── pages/          ← Una página por ruta (/admin/agenda, /reservar, etc.)
│   │   │   ├── hooks/          ← TanStack Query hooks (useCitas, useTickets, useCaja…)
│   │   │   ├── lib/            ← Utilidades puras (reportQueries, dateUtils, supabase)
│   │   │   ├── context/        ← React Context (AuthContext, SucursalContext)
│   │   │   ├── types/          ← Tipos TypeScript del esquema de BD
│   │   │   └── utils/          ← Helpers compartidos (agenda.ts: timeToSlots, etc.)
│   │   └── .env.example        ← Plantilla de variables — copia a .env.local
│   │
│   └── mobile/                 ← App iOS (Expo + React Native)
│       ├── app/
│       │   ├── (auth)/         ← Pantallas de login
│       │   └── (tabs)/         ← Navegación principal con tabs
│       ├── lib/                ← supabase.ts, dateUtils, Zustand store
│       └── .env.example        ← Plantilla de variables — copia a .env.local
│
├── supabase/
│   ├── functions/
│   │   └── meta-insights/      ← Edge Function: proxy seguro para Meta Graph API
│   └── migrations/             ← Migraciones SQL en orden cronológico
│
├── package.json                ← Workspace npm de la app web
└── ARCHITECTURE.md             ← Este archivo
```

---

## Setup rápido (nuevo desarrollador)

```bash
# 1. Clonar e instalar dependencias
git clone <repo>
cd muy-muy-beauty
npm ci
npm ci --prefix apps/mobile

# 2. Configurar variables de entorno
cp apps/web/.env.example apps/web/.env.local      # → editar con tus valores
cp apps/mobile/.env.example apps/mobile/.env.local # → editar con tus valores

# 3. Iniciar Supabase local (requiere Docker)
npx supabase start

# 4. Aplicar migraciones locales
npx supabase db reset  # aplica todas las migraciones en orden

# 5. Iniciar apps
cd apps/web && npm run dev       # http://localhost:5173
cd apps/mobile && npx expo start # escáner QR para iOS
```

---

## Clientes Supabase — uno por app

Cada app tiene **su propio cliente Supabase** con sus propias env vars:

| App | Archivo | Variable |
|---|---|---|
| Web (Vite) | `apps/web/src/lib/supabase.ts` | `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` |
| Mobile (Expo) | `apps/mobile/lib/supabase.ts` | `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY` |

Ambas apps apuntan al **mismo proyecto Supabase**. Usa la URL y la clave que imprime
`npx supabase status`; los puertos están definidos en `supabase/config.toml` y no se
deben asumir en el código.

---

## Edge Functions

| Función | Ruta | Descripción |
|---|---|---|
| `meta-insights` | `supabase/functions/meta-insights/` | Proxy seguro para la Meta Graph API. El `access_token` nunca sale al cliente. |

Para desplegar una Edge Function:
```bash
npx supabase functions deploy meta-insights
```

---

## 🔒 Seguridad y RLS

### Roles de acceso

| Rol | Acceso | Descripción |
|---|---|---|
| `anon` | Solo lectura de `servicios` y `sucursales` + RPCs de booking | Clientes en el formulario de reserva público |
| `authenticated` | Todas las tablas operativas via RLS | Personal con login en el dashboard |

### Flujo de reserva pública (`/reservar`)

El flujo de booking funciona de forma **anónima** (`anon`) sin cuenta de usuario. Usa exclusivamente **funciones RPC SECURITY DEFINER** para proteger los datos:

| RPC | Rol | Descripción |
|---|---|---|
| `verificar_cliente_por_telefono(p_telefono)` | `anon` | Solo devuelve si el teléfono ya existe; no expone PII ni IDs |
| `obtener_horarios_disponibles(...)` | `anon` | Calcula disponibilidad sin exponer citas, bloqueos ni datos de clientas |
| `crear_reserva_publica(...)` | `anon` | Crea cliente + cita + servicios de forma atómica y evita dobles reservas |

**⚠️ IMPORTANTE:** El rol `anon` **NO tiene** acceso directo INSERT/UPDATE en `clientes`, `citas` ni `cita_servicios`. Toda escritura va por RPC. Las políticas RLS de acceso directo para `anon` en esas tablas fueron eliminadas en `20260609010000_secure_booking_rpc.sql`.

### Validaciones en `crear_reserva_publica`

La función RPC endurecida valida:
1. Teléfono mexicano de 10 dígitos
2. Nombre no vacío y límites de tamaño
3. Máximo 5 servicios por reserva (anti-abuse)
4. Todos los servicios deben existir y estar **activos**
5. La empleada (si se especifica) debe pertenecer a **la misma sucursal**
6. Fecha futura, bloques de 15 minutos y horario completo dentro de apertura
7. Disponibilidad real bajo un bloqueo transaccional por sucursal y fecha

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend web | React 19 + TypeScript + Vite |
| Estado servidor | TanStack Query v5 |
| Frontend mobile | Expo + React Native |
| Backend | Supabase (PostgreSQL + Auth + RLS + Edge Functions) |
| Routing web | React Router v7 |
| Charts | Recharts |
| Icons | Lucide React |
| Gestión monorepo | npm workspace para web; Expo aislado con lockfile propio |
| Deploy web | Vercel (Root Directory: `apps/web`) |
| Deploy mobile | Expo EAS Build |

---

## Decisiones de arquitectura

### ¿Por qué el móvil está fuera del workspace raíz?
- React web y React Native requieren árboles de dependencias distintos
- Expo conserva su propio `package-lock.json` para que npm no mezcle peers nativos

### ¿Por qué no un paquete `@muymuy/types` compartido?
- Con solo 2 apps activas el overhead de configuración no vale la pena
- Los tipos del mobile son un subconjunto de los del web
- Se puede extraer cuando la divergencia lo justifique

### ¿Por qué no Turborepo?
- Para 2 apps, el overhead de configuración no aporta valor aún
- Se puede agregar después sin romper nada

### ¿Por qué el dashboard usa caché de módulo y no React Query?
- El dashboard hace 13 queries paralelas y necesita un TTL propio de 3 minutos
- React Query global tiene `staleTime: 60s` — los dos sistemas coexisten sin interferir
- Ver `apps/web/src/hooks/useDashboardData.ts` para la implementación

### ¿Por qué una Edge Function para Meta API y no llamar directamente?
- Llamar desde el browser expone el `access_token` en el tráfico de red (DevTools)
- La Edge Function recupera el token desde la BD y llama a Meta server-side
- El token **nunca** llega al navegador del usuario
