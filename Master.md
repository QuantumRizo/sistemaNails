Aquí tienes el contenido completo para tu archivo **`SYSTEM_BLUEPRINT.md`**. He integrado tanto la visión del sistema como el esquema técnico de Supabase, incluyendo la lógica de los bloques de 15 minutos y el manejo de los datos extensos de clientes que me pasaste.

Puedes copiar este bloque de código y guardarlo directamente como un archivo `.md`.

```markdown
# 💅 SYSTEM BLUEPRINT: Gestión d-uñas (Multi-sucursal)

## 1. Visión General del Proyecto
Este sistema es una replicación avanzada para la gestión de 4 sucursales de uñas. El núcleo del software es una **Agenda Dinámica** basada en bloques de tiempo de 15 minutos, con gestión de personal rotativo y expedientes de clientes detallados.

**Stack Tecnológico:**
- **Frontend:** React (Vite) + Tailwind CSS.
- **Backend:** Supabase (PostgreSQL).
- **Hosting:** Vercel.
- **Gestión de Estado:** Zustand / TanStack Query.

---

## 2. Estructura de Base de Datos (Supabase SQL)

### 2.1 Enums y Tipos Globales
```sql
CREATE TYPE sexo_type AS ENUM ('Mujer', 'Hombre', 'Otro');
CREATE TYPE cita_status AS ENUM ('Programada', 'En curso', 'Finalizada', 'Cancelada', 'No asistió');
```

### 2.2 Tablas Principales

#### sucursales
| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | `uuid` (PK) | Identificador único de sucursal. |
| `nombre` | `text` | Ej: 'Campos Elíseos', 'Polanco'. |

#### perfiles_empleadas
| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | `uuid` (PK) | Relacionado con auth.users. |
| `nombre` | `text` | Nombre de la profesional. |
| `activo` | `boolean` | Control de visibilidad en agenda. |

#### clientes
| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | `uuid` (PK) | |
| `num_cliente` | `serial` | ID numérico para búsqueda rápida. |
| `nombre_completo`| `text` | |
| `telefono_cel` | `text` | |
| `email` | `text` | |
| `datos_extra` | `jsonb` | **Clave:** Aquí guardamos: RFC, Procedencia (Lufthansa, Facebook, etc.), Sexo, Fecha Nacimiento, País y Notas. |

#### servicios
| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | `uuid` (PK) | |
| `nombre` | `text` | Ej: 'Manicura SPA'. |
| `duracion_slots`| `int` | **Crítico:** Cuántos bloques de 15 min ocupa (ej: 4 = 1 hora). |
| `precio` | `numeric` | |
| `familia` | `text` | Categoría (Esculpidas, Pedicura, etc.). |

### 2.3 Tablas de Operación (Agenda)

#### citas
| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | `uuid` (PK) | |
| `cliente_id` | `uuid` (FK) | |
| `empleada_id` | `uuid` (FK) | Profesional asignada. |
| `sucursal_id` | `uuid` (FK) | Sucursal donde ocurre la cita. |
| `fecha` | `date` | |
| `bloque_inicio` | `time` | Hora exacta del primer slot (ej: 09:15). |
| `estado` | `cita_status`| Default 'Programada'. |
| `comentarios` | `text` | Notas específicas de la cita. |

#### cita_servicios
*Tabla intermedia para permitir múltiples servicios en una sola cita.*
- `id`, `cita_id`, `servicio_id`.

#### bloqueos_agenda
- `id`, `empleada_id`, `fecha`, `hora_inicio`, `hora_fin`, `motivo` (Comida/Descanso).

---

## 3. Lógica del Frontend y UI

### 3.1 La Agenda (The Grid)
- **Eje X (Columnas):** Empleadas activas devueltas por la base de datos para esa sucursal y día.
- **Eje Y (Filas):** Generar bloques de 15 minutos desde la apertura a cierre (ej: 09:00 a 21:00).
- **Renderizado:** Las citas se posicionan usando `grid-row-start` basado en la hora de inicio y ocupan `grid-row-end` sumando los `duracion_slots` de sus servicios.

### 3.2 Registro de Clientes
El formulario debe mapear los datos extensos al campo `jsonb` de Supabase para mantener la tabla limpia pero flexible:
- **Procedencia:** Menú desplegable con las opciones capturadas (Banamex, Instagram, etc.).
- **Validación:** El teléfono es el campo de búsqueda principal junto con el nombre.

---

## 4. Próximas Fases (Pendientes de Detalle)
1. **Inventario:** Control de stock por sucursal (productos de venta).
2. **Facturación:** Generación de tickets no fiscales (formato térmico).
3. **Estadísticas:** Reportes de productividad por chica y servicios más solicitados.

---

## 5. Prompt Maestro para Desarrollo (AI Agent)

Actúa como un desarrollador Fullstack Senior. Crea un sistema de gestión de citas en React/Vite y Supabase con los siguientes módulos integrados:

1. Agenda Dinámica (CSS Grid):

Construye un calendario con cabeceras anidadas: Fila superior para el Día y sub-columnas para cada Empleada (ej: Itz, Dan, Reb).

Eje vertical con intervalos de 15 minutos.

Las citas deben posicionarse usando grid-row-start y grid-row-end basándose en la suma de bloques de los servicios seleccionados.

Representa los 'Bloqueos' (comida/descanso) con un fondo rayado gris (repeating-linear-gradient).

Las citas 'Validadas' deben mostrar un icono de check; las pendientes no.

2. Gestión de Clientes (Buscador y Registro):

Buscador: Un modal que permita buscar por Nombre, Teléfono o ID. Debe incluir un botón para 'Nuevo Cliente' si no existe.

Formulario de Registro: Debe ser exhaustivo. Campos principales: Nombre, Apellidos, Teléfono, Email.

Mapeo JSONB: Todos los datos adicionales (Sexo, RFC, Procedencia como 'Lufthansa', 'Banamex', 'Facebook', etc., y Notas) deben guardarse en una sola columna de Supabase llamada datos_extra tipo JSONB.

3. Flujo de Citas:

Al hacer clic en un espacio vacío: Abrir buscador de clientes -> Seleccionar servicios -> Confirmar profesional y bloques ocupados.

Al hacer clic en una cita existente: Abrir modal de gestión que permita 'Mover', 'Eliminar' o 'Validar Cita' (este último activa el icono de check en la agenda).

Soporta múltiples servicios por cita; el sistema debe calcular la duración total automáticamente para ocupar el espacio correcto en el grid.

Especificaciones Técnicas:

Usa Tailwind CSS para el diseño.

El número de empleadas por día debe ser mutable (el grid se ajusta solo).

No uses librerías de calendario externas; el control del grid debe ser manual y preciso.
```

---