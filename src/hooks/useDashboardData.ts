import { useState, useEffect } from 'react'
import { runQuery } from '../lib/reportQueries'
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, format } from 'date-fns'

export type TimeRange = 'today' | 'week' | 'month'

export function useDashboardData(sucursalId: string, range: TimeRange) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError(null)
      try {
        const now = new Date()
        let fi: Date, ff: Date

        if (range === 'today') {
          fi = startOfDay(now)
          ff = endOfDay(now)
        } else if (range === 'week') {
          fi = startOfWeek(now, { weekStartsOn: 1 })
          ff = endOfWeek(now, { weekStartsOn: 1 })
        } else {
          fi = startOfMonth(now)
          ff = endOfMonth(now)
        }

        const sFi = format(fi, 'yyyy-MM-dd')
        const sFf = format(ff, 'yyyy-MM-dd')

        // Fetch multiple metrics in parallel
        const [
          revenue,
          appointments,
          newClients,
          attendance,
          treatments,
          peakHours,
          salesProduct,
          clientOrigin,
          paymentMethods
        ] = await Promise.all([
          runQuery('4.1.1', 'total', 'total_desc', sFi, sFf, sucursalId), // Revenue
          runQuery('3.7', 'total', 'cantidad_desc', sFi, sFf, sucursalId), // Appointments
          runQuery('1.1.1', 'total', 'cantidad_desc', sFi, sFf, sucursalId), // New Clients
          runQuery('3.1', 'sucursal', 'porcentaje_desc', sFi, sFf, sucursalId), // Attendance Rate
          runQuery('4.4.1', 'tratamiento', 'total_desc', sFi, sFf, sucursalId), // Top Treatments
          runQuery('4.17.1', 'hora', 'cantidad_desc', sFi, sFf, sucursalId), // Peak Hours
          runQuery('4.9.1', 'producto', 'total_desc', sFi, sFf, sucursalId), // Sales by Product
          runQuery('1.2', 'procedencia', 'cantidad_desc', sFi, sFf, ''), // Client Origin (Global)
          runQuery('4.12.1', 'metodo', 'total_desc', sFi, sFf, sucursalId)  // Payment Methods
        ])

        // Tasa de asistencia: promedio ponderado global (no solo primera fila)
        const totalCitas = attendance.rows.reduce((s: number, r: any) => s + (r.total_citas ?? 0), 0)
        const totalNoAsistidas = attendance.rows.reduce((s: number, r: any) => s + (r.no_asistidas ?? 0), 0)
        const globalAbsencePct = totalCitas > 0 ? (totalNoAsistidas / totalCitas) * 100 : 0

        setData({
          revenue: revenue.totals.total || 0,
          appointments: appointments.totals.cantidad || 0,
          newClients: newClients.totals.cantidad || 0,
          attendanceRate: 100 - globalAbsencePct,
          treatments: treatments.rows.slice(0, 5),
          attendanceSummary: attendance.rows,
          peakHours: peakHours.rows,
          salesProduct: salesProduct.rows.slice(0, 5),
          clientOrigin: clientOrigin.rows,
          paymentMethods: paymentMethods.rows
        })
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [sucursalId, range])

  return { data, loading, error }
}
