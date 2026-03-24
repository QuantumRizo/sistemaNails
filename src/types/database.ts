// ─── Database Types ────────────────────────────────────────────

export type SexoType = 'Mujer' | 'Hombre' | 'Otro'
export type CitaStatus = 'Programada' | 'En curso' | 'Finalizada' | 'Cancelada' | 'No asistió'

export interface Sucursal {
  id: string
  nombre: string
}

export interface Empleada {
  id: string
  nombre: string
  nombre_corto?: string
  activo: boolean
}

export interface DatosExtra {
  rfc?: string
  procedencia?: string
  sexo?: SexoType
  fecha_nacimiento?: string
  pais?: string
  notas?: string
}

export interface Cliente {
  id: string
  num_cliente: number
  nombre_completo: string
  telefono_cel: string | null
  email: string | null
  datos_extra: DatosExtra
  created_at: string
}

export interface Servicio {
  id: string
  nombre: string
  duracion_slots: number
  precio: number
  familia: string | null
  activo: boolean
}

export interface Cita {
  id: string
  cliente_id: string
  empleada_id: string | null
  sucursal_id: string
  fecha: string
  bloque_inicio: string
  estado: CitaStatus
  duracion_manual_slots: number | null
  comentarios: string | null
  created_at: string
  // Joined fields
  cliente?: Cliente
  empleada?: Empleada
  sucursal?: Sucursal
  servicios?: Servicio[]
}

export interface CitaServicio {
  id: string
  cita_id: string
  servicio_id: string
}

export interface BloqueoAgenda {
  id: string
  empleada_id: string
  fecha: string
  hora_inicio: string
  hora_fin: string
  motivo: string
}

// ─── UI / App Types ────────────────────────────────────────────

export interface SlotInfo {
  empleadaId: string
  hora: string // "09:00", "09:15", etc.
  fecha: string
}

// ─── Stub for Supabase typed client ───────────────────────────
export interface Database {
  public: {
    Tables: {
      sucursales: { Row: Sucursal; Insert: Omit<Sucursal, 'id'>; Update: Partial<Sucursal> }
      perfiles_empleadas: { Row: Empleada; Insert: Omit<Empleada, 'id'>; Update: Partial<Empleada> }
      clientes: { Row: Cliente; Insert: Omit<Cliente, 'id' | 'num_cliente' | 'created_at'>; Update: Partial<Cliente> }
      servicios: { Row: Servicio; Insert: Omit<Servicio, 'id'>; Update: Partial<Servicio> }
      citas: { Row: Cita; Insert: Omit<Cita, 'id' | 'created_at' | 'cliente' | 'empleada' | 'servicios'>; Update: Partial<Cita> }
      cita_servicios: { Row: CitaServicio; Insert: Omit<CitaServicio, 'id'>; Update: Partial<CitaServicio> }
      bloqueos_agenda: { Row: BloqueoAgenda; Insert: Omit<BloqueoAgenda, 'id'>; Update: Partial<BloqueoAgenda> }
    }
  }
}
