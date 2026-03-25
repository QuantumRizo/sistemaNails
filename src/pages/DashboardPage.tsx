import { useState, useEffect } from 'react'
import { Calendar, DollarSign, Users, CheckCircle, Clock } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useSucursales } from '../hooks/useSucursales'

export default function DashboardPage() {
  const { data: sucursales = [] } = useSucursales()
  const [sucursalId, setSucursalId] = useState<string>('')
  
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    citasHoy: 0,
    citasCompletadas: 0,
    ingresosHoy: 0,
    clientesNuevosMes: 0,
  })

  // Fechas base
  const hoy = new Date().toLocaleDateString('en-CA')
  const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true)

        // 1. Citas del día 
        let citasQuery = supabase
          .from('citas')
          .select('estado')
          .eq('fecha', hoy)
          .neq('estado', 'Cancelada')
        
        if (sucursalId) citasQuery = citasQuery.eq('sucursal_id', sucursalId)
        
        const { data: citas } = await citasQuery

        const totalCitas = citas?.length || 0
        const completadas = citas?.filter(c => c.estado === 'Finalizada').length || 0

        // 2. Ingresos del día 
        let ticketsQuery = supabase
          .from('tickets')
          .select('total')
          .eq('estado', 'Pagado')
          .gte('fecha', hoy)
          .lte('fecha', `${hoy}T23:59:59`)

        if (sucursalId) ticketsQuery = ticketsQuery.eq('sucursal_id', sucursalId)
          
        const { data: tickets } = await ticketsQuery

        const ingresos = tickets?.reduce((sum, t) => sum + (Number(t.total) || 0), 0) || 0

        // 3. Clientes nuevos
        let clientesQuery = supabase
          .from('clientes')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', `${inicioMes}T00:00:00`)

        if (sucursalId) clientesQuery = clientesQuery.eq('sucursal_id', sucursalId)
          
        const { count: clientesCount } = await clientesQuery

        setStats({
          citasHoy: totalCitas,
          citasCompletadas: completadas,
          ingresosHoy: ingresos,
          clientesNuevosMes: clientesCount || 0,
        })

      } catch (err) {
        console.error('Error cargando KPIs:', err)
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [hoy, inicioMes, sucursalId])

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center min-h-[400px]">
        <div className="text-gray-400 font-light">Cargando métricas...</div>
      </div>
    )
  }

  return (
    <div className="page-container" style={{ padding: '24px 32px' }}>
      <div className="page-header">
        <div className="page-header-content">
          <h1 className="page-title">Inicio</h1>
          <p className="page-subtitle">
            Resumen de actividad para hoy, {new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        
        <div className="page-header-actions">
          <select
            value={sucursalId}
            onChange={(e) => setSucursalId(e.target.value)}
            className="sucursal-select-primary"
          >
            <option value="">Todas las sucursales</option>
            {sucursales.map((s) => (
              <option key={s.id} value={s.id}>{s.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="dashboard-grid">
        
        {/* Card 1: Citas */}
        <div className="dash-card">
          <div className="dash-card-bg-shape"></div>
          <div className="dash-card-header">
            <div className="dash-icon-box">
              <Calendar size={22} strokeWidth={1.5} />
            </div>
          </div>
          <div>
            <div className="dash-card-title">Citas Hoy</div>
            <div className="dash-card-value">{stats.citasHoy}</div>
          </div>
        </div>

        {/* Card 2: Ingresos */}
        <div className="dash-card">
          <div className="dash-card-bg-shape"></div>
          <div className="dash-card-header">
            <div className="dash-icon-box">
              <DollarSign size={22} strokeWidth={1.5} />
            </div>
            <span className="dash-badge yellow">MXN</span>
          </div>
          <div>
            <div className="dash-card-title">Ingresos Hoy</div>
            <div className="dash-card-value">
              ${stats.ingresosHoy.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Card 3: Completadas (Progreso) */}
        <div className="dash-card">
          <div className="dash-card-bg-shape"></div>
          <div className="dash-card-header">
            <div className="dash-icon-box">
              <CheckCircle size={22} strokeWidth={1.5} />
            </div>
          </div>
          <div>
            <div className="dash-card-title">Completadas</div>
            <div className="dash-card-value">
              {stats.citasCompletadas}
              <span className="dash-card-subvalue">/ {stats.citasHoy}</span>
            </div>
            <div className="dash-progress-track">
              <div 
                className="dash-progress-fill"
                style={{ width: `${stats.citasHoy > 0 ? (stats.citasCompletadas / stats.citasHoy) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Card 4: Clientes */}
        <div className="dash-card">
          <div className="dash-card-bg-shape"></div>
          <div className="dash-card-header">
            <div className="dash-icon-box">
              <Users size={22} strokeWidth={1.5} />
            </div>
            <span className="dash-badge gray">Este mes</span>
          </div>
          <div>
            <div className="dash-card-title">Nuevos Clientes</div>
            <div className="dash-card-value">{stats.clientesNuevosMes}</div>
          </div>
        </div>

      </div>

      {/* Placeholder visual inferior */}
      <div className="dash-placeholder">
        <div className="dash-placeholder-bg"></div>
        <Clock size={40} className="mb-4" style={{ color: 'var(--accent)', opacity: 0.3 }} strokeWidth={1} />
        <h3 className="text-lg text-gray-700 font-medium mb-1">Próximas citas</h3>
        <p className="text-sm text-gray-400 text-center max-w-sm">
          Aquí se mostrará un desglose rápido de las próximas sesiones y la disponibilidad de la agenda del día.
        </p>
      </div>
      
    </div>
  )
}

