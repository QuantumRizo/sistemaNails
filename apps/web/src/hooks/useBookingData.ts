import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Sucursal, Servicio, Empleada } from '../types/database'

export function useBookingData(selectedSucursal: Sucursal | null) {
  const [sucursales, setSucursales] = useState<Sucursal[]>([])
  const [servicios, setServicios] = useState<Servicio[]>([])
  const [perfiles, setPerfiles] = useState<Empleada[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError(null)
      const [resSuc, resSer] = await Promise.all([
        supabase.from('sucursales').select('*').order('nombre'),
        supabase.from('servicios').select('*, categoria:categorias_servicio(nombre)').eq('activo', true).order('nombre')
      ])
      if (resSuc.error || resSer.error) {
        setError('No pudimos cargar las sucursales y servicios.')
      }
      if (resSuc.data) setSucursales(resSuc.data)
      if (resSer.data) setServicios(resSer.data)
      setLoading(false)
    }
    fetchData()
  }, [reloadKey])

  useEffect(() => {
    if (selectedSucursal) {
      supabase.from('perfiles_empleadas')
        .select('id, nombre, activo, sucursal_id')
        .eq('activo', true)
        .eq('sucursal_id', selectedSucursal.id)
        .then(({ data, error: employeeError }) => {
          if (employeeError) setError('No pudimos cargar las profesionales de esta sucursal.')
          if (data) setPerfiles(data)
        })
    } else {
      setPerfiles([])
    }
  }, [selectedSucursal])

  return {
    sucursales,
    servicios,
    perfiles,
    loading,
    error,
    retry: () => setReloadKey(key => key + 1),
  }
}
