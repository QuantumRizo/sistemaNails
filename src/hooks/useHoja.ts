import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export interface EvaluacionHoja {
  id?: string
  empleada_id: string
  sucursal_id: string
  mes: number
  anio: number
  cumplio_hoja: boolean
  notas?: string
}

export function useEvaluacionesHoja(sucursalId: string, mes: number, anio: number) {
  return useQuery({
    queryKey: ['evaluaciones_hoja', sucursalId, mes, anio],
    queryFn: async () => {
      if (!sucursalId) return []
      const { data, error } = await supabase
        .from('evaluaciones_hoja')
        .select(`
          *,
          empleada:empleada_id(id, nombre, puesto, foto_url)
        `)
        .eq('sucursal_id', sucursalId)
        .eq('mes', mes)
        .eq('anio', anio)
      if (error) throw error
      return data
    },
    enabled: !!sucursalId
  })
}

export function useGuardarEvaluacion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (ev: EvaluacionHoja) => {
      const { data, error } = await supabase
        .from('evaluaciones_hoja')
        .upsert({
          empleada_id: ev.empleada_id,
          sucursal_id: ev.sucursal_id,
          mes:         ev.mes,
          anio:        ev.anio,
          cumplio_hoja: ev.cumplio_hoja,
          notas:       ev.notas ?? null,
          evaluado_en: new Date().toISOString()
        }, { onConflict: 'empleada_id,mes,anio' })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['evaluaciones_hoja', vars.sucursal_id, vars.mes, vars.anio] })
    }
  })
}
