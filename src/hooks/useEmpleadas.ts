import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Empleada } from '../types/database'

// Employees are global (no sucursal filter)
export function useEmpleadas() {
  return useQuery<Empleada[]>({
    queryKey: ['empleadas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('perfiles_empleadas')
        .select('*')
        .eq('activo', true)
        .order('nombre')
      if (error) throw error
      return data ?? []
    },
  })
}

// All empleadas including inactive (for config page)
export function useTodasEmpleadas() {
  return useQuery<Empleada[]>({
    queryKey: ['empleadas', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('perfiles_empleadas')
        .select('*')
        .order('nombre')
      if (error) throw error
      return data ?? []
    },
  })
}
