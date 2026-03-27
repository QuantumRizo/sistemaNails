import { useState, useEffect } from 'react'
import { 
  DollarSign, Calendar, Users, CheckCircle, 
  MapPin 
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import KPICard from '../components/Dashboard/KPICard'
import { 
  DashboardBarChart, 
  DashboardAreaChart, 
  DashboardPieChart 
} from '../components/Dashboard/Charts'
import { useDashboardData, type TimeRange } from '../hooks/useDashboardData'
import type { Sucursal } from '../types/database'

export default function InicioPage() {
  const [sucursalId, setSucursalId] = useState<string>('all')
  const [range, setRange] = useState<TimeRange>('today')
  const [sucursales, setSucursales] = useState<Sucursal[]>([])

  const { data, loading, error } = useDashboardData(sucursalId, range)

  useEffect(() => {
    supabase.from('sucursales').select('*').order('nombre').then(({ data }) => {
      if (data) setSucursales(data)
    })
  }, [])

  if (error) {
    return (
      <div className="card" style={{ padding: '20px', margin: '20px', color: 'var(--danger)', background: 'var(--danger-bg)' }}>
        Error al cargar el dashboard: {error}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Page Header (Compact) */}
      <div className="page-header" style={{ padding: '18px 24px 0', marginBottom: 15 }}>
        <div className="page-header-content">
          <h1 className="page-title" style={{ fontSize: '24px', margin: 0 }}>Inicio</h1>
          <p className="page-subtitle" style={{ fontSize: '12px', marginTop: '2px' }}>Rendimiento general del negocio</p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Sucursal Selector (Compact) */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <MapPin size={12} style={{ position: 'absolute', left: '10px', color: 'var(--text-3)' }} />
            <select 
              value={sucursalId} 
              onChange={(e) => setSucursalId(e.target.value)}
              className="sucursal-select"
              style={{ paddingLeft: '28px', paddingRight: '28px', fontSize: '12px', height: '34px' }}
            >
              <option value="all">Sedes combinadas</option>
              {sucursales.map(s => (
                <option key={s.id} value={s.id}>{s.nombre}</option>
              ))}
            </select>
          </div>

          {/* Time Range Selector (Compact) */}
          <div style={{ display: 'flex', background: 'var(--surface-2)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border)' }}>
            {(['today', 'week', 'month'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                style={{
                  padding: '4px 12px',
                  fontSize: '10px',
                  fontWeight: 600,
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: range === r ? 'var(--surface)' : 'transparent',
                  color: range === r ? 'var(--accent)' : 'var(--text-3)',
                  boxShadow: range === r ? 'var(--shadow-sm)' : 'none',
                  height: '28px'
                }}
              >
                {r === 'today' ? 'Hoy' : r === 'week' ? 'Semana' : 'Mes'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area (Compact) */}
      <div className="page-content" style={{ padding: '0 24px 18px', overflowY: 'auto' }}>
        {loading && !data ? (
          <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-3)', fontSize: '13px' }}>
            Actualizando indicadores...
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* KPI Row (Compact) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
              <KPICard 
                title="Ingresos" 
                value={new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(data?.revenue)}
                Icon={DollarSign}
                subtitle="Respecto anterior"
              />
              <KPICard 
                title="Citas" 
                value={data?.appointments}
                Icon={Calendar}
                subtitle="Programadas"
              />
              <KPICard 
                title="C. Nuevos" 
                value={data?.newClients}
                Icon={Users}
                subtitle="Nuevos registros"
              />
              <KPICard 
                title="Asistencia" 
                value={`${data?.attendanceRate?.toFixed(1)}%`}
                Icon={CheckCircle}
                subtitle="Finalizadas"
              />
            </div>

            {/* Second Row: Main Activity Charts (Compact) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '16px' }}>
              <div className="card" style={{ padding: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
                  <span className="card-title" style={{ fontSize: '13px' }}>Top Tratamientos / Actividad</span>
                  <span style={{ fontSize: '9px', fontWeight: 700, color: 'var(--accent)', background: 'var(--accent-light)', padding: '3px 8px', borderRadius: '15px' }}>
                    POR INGRESO
                  </span>
                </div>
                <DashboardAreaChart data={data?.treatments || []} height={220} colors={['var(--accent)']} />
              </div>
              
              <div className="card" style={{ padding: '18px' }}>
                <span className="card-title" style={{ display: 'block', marginBottom: '16px', fontSize: '13px' }}>Asistencia</span>
                <DashboardPieChart 
                  data={data?.attendanceSummary?.map((r: any) => ({ ...r, cantidad: r.total_citas - r.no_asistidas })) || []} 
                  height={220} 
                  colors={['var(--accent)', '#e2e8f0', '#94a3b8']} 
                />
              </div>
            </div>

            {/* Third Row (Compact) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="card" style={{ padding: '18px' }}>
                <span className="card-title" style={{ display: 'block', marginBottom: '16px', fontSize: '13px' }}>Horas de Demanda</span>
                <DashboardBarChart data={data?.peakHours || []} height={200} colors={['var(--accent)']} />
              </div>
              
              <div className="card" style={{ padding: '18px' }}>
                <span className="card-title" style={{ display: 'block', marginBottom: '16px', fontSize: '13px' }}>Ventas por Producto</span>
                <DashboardBarChart data={data?.salesProduct || []} height={200} colors={['var(--accent)']} />
              </div>
            </div>

            {/* Bottom Row (Compact) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', paddingBottom: '16px' }}>
              <div className="card" style={{ padding: '18px' }}>
                <span className="card-title" style={{ display: 'block', marginBottom: '16px', fontSize: '13px' }}>Origen de Clientes</span>
                <DashboardBarChart data={data?.clientOrigin || []} height={200} colors={['var(--accent)']} />
              </div>
              
              <div className="card" style={{ padding: '18px' }}>
                <span className="card-title" style={{ display: 'block', marginBottom: '16px', fontSize: '13px' }}>Métodos de Pago</span>
                <DashboardBarChart data={data?.paymentMethods || []} height={200} colors={['var(--accent)']} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
