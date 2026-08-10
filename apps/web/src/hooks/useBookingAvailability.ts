import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { supabase } from '../lib/supabase'
import type { Sucursal, Servicio } from '../types/database'

// ─── HELPERS ──────────────────────────────────────────────────
export function getSucursalHours(sucursal: Sucursal, date: Date): { start: number; end: number } {
  const dow = date.getDay() // 0=Dom, 6=Sáb
  const hpd = sucursal.horarios_por_dia
  if (hpd && hpd[dow] && !hpd[dow].cerrado) {
    return {
      start: parseInt(hpd[dow].apertura.split(':')[0], 10),
      end:   parseInt(hpd[dow].cierre.split(':')[0], 10),
    }
  }
  // Fallback: algunos valores legacy pueden llegar como nanosegundos enteros (PostgreSQL interval)
  const toHour = (val: string | number | null | undefined): number => {
    if (typeof val === 'string') return parseInt(val.split(':')[0], 10)
    if (typeof val === 'number') return Math.floor(val / 3_600_000_000_000) // nanoseconds → hours
    return 10 // safe default
  }
  const esFinde = dow === 0 || dow === 6
  const apertura = esFinde ? (sucursal.hora_apertura_finde ?? sucursal.hora_apertura) : sucursal.hora_apertura
  const cierre   = esFinde ? (sucursal.hora_cierre_finde   ?? sucursal.hora_cierre)   : sucursal.hora_cierre
  return { start: toHour(apertura) || 10, end: toHour(cierre) || 20 }
}

export function useBookingAvailability(
  selectedDate: Date | null,
  selectedSucursal: Sucursal | null,
  selectedServicios: Servicio[],
  selectedProfesional: string | null
) {
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [fetchingSlots, setFetchingSlots] = useState(false)
  const [availabilityError, setAvailabilityError] = useState<string | null>(null)

  useEffect(() => {
    if (selectedDate && selectedSucursal && selectedServicios.length > 0) {
      async function checkAvailability() {
        setFetchingSlots(true)
        setAvailabilityError(null)

        try {
          const { data, error } = await supabase.rpc('obtener_horarios_disponibles', {
            p_sucursal_id: selectedSucursal!.id,
            p_fecha: format(selectedDate!, 'yyyy-MM-dd'),
            p_servicio_ids: selectedServicios.map(service => service.id),
            p_empleada_id: selectedProfesional,
          })
          if (error) throw error
          setAvailableSlots(data ?? [])
        } catch (err) {
          console.error(err)
          setAvailableSlots([])
          setAvailabilityError('No pudimos consultar la disponibilidad. Intenta de nuevo.')
        } finally {
          setFetchingSlots(false)
        }
      }
      checkAvailability()
    } else {
      setAvailableSlots([])
      setAvailabilityError(null)
    }
  }, [selectedDate, selectedSucursal, selectedServicios, selectedProfesional])

  return { availableSlots, fetchingSlots, availabilityError }
}
