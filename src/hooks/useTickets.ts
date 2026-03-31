import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Ticket, TicketItem, Pago } from '../types/database'

export function useCrearTicket() {
  const qc = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ 
      ticket, 
      items, 
      pagos,
      citaId 
    }: { 
      ticket: Omit<Ticket, 'id' | 'created_at' | 'cliente' | 'sucursal' | 'vendedor' | 'items' | 'pagos'>, 
      items: Omit<TicketItem, 'id' | 'ticket_id'>[], 
      pagos: Omit<Pago, 'id' | 'ticket_id' | 'fecha'>[],
      citaId: string
    }) => {
      // 1. Crear el ticket
      const { data: tData, error: tError } = await supabase
        .from('tickets')
        .insert(ticket)
        .select()
        .single()
      
      if (tError) throw tError

      // 2. Crear los items del ticket con el ID del ticket recién creado
      if (items.length > 0) {
        const { error: iError } = await supabase
          .from('ticket_items')
          .insert(items.map(item => ({ ...item, ticket_id: tData.id })))
        
        if (iError) throw iError

        // 2.5 Descontar stock de inventario para cada producto
        for (const item of items) {
          if (item.tipo === 'Producto') {
             const { error: rpcError } = await supabase.rpc('decrementar_stock_producto', {
               p_id: item.referencia_id,
               p_cantidad: item.cantidad
             });
             // No interrumpir compra entera si falla el stock, pero ideal guardarlo en un log si falla.
             if (rpcError) console.error('Error descontando stock:', rpcError);
          }
        }
      }

      // 3. Crear los pagos
      if (pagos.length > 0) {
        const { error: pError } = await supabase
          .from('pagos')
          .insert(pagos.map(p => ({ ...p, ticket_id: tData.id })))
        
        if (pError) throw pError
      }

      // 4. Vincular el ticket a la cita y marcarla como Finalizada
      const { error: cError } = await supabase
        .from('citas')
        .update({ ticket_id: tData.id, estado: 'Finalizada' })
        .eq('id', citaId)
      
      if (cError) throw cError

      return tData
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['citas'] })
      qc.invalidateQueries({ queryKey: ['tickets'] })
    }
  })
}
