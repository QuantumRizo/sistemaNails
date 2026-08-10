import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useClientVerification(telefono: string) {
  const [isExistingClient, setIsExistingClient] = useState(false)

  useEffect(() => {
    if (telefono.length === 10) {
      supabase.rpc('verificar_cliente_por_telefono', { p_telefono: telefono })
        .then(({ data, error }) => {
          if (error) {
            setIsExistingClient(false)
            return
          }
          if (data?.existe) {
            setIsExistingClient(true)
          } else {
            setIsExistingClient(false)
          }
        })
    } else {
      setIsExistingClient(false)
    }
  }, [telefono])

  return { isExistingClient }
}
