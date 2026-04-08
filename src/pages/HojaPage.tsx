import { useState, useMemo } from 'react'
import { CheckSquare, Square, ChevronLeft, ChevronRight, FileCheck, User, Save } from 'lucide-react'
import { useSucursales } from '../hooks/useSucursales'
import { useEmpleadas } from '../hooks/useEmpleadas'
import { useEvaluacionesHoja, useGuardarEvaluacion } from '../hooks/useHoja'
import { useToast } from '../components/Common/Toast'

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

export default function HojaPage() {
  const toast = useToast()
  const now = new Date()

  const [sucursalId, setSucursalId] = useState('')
  const [mes, setMes] = useState(now.getMonth() + 1)
  const [anio, setAnio] = useState(now.getFullYear())

  const { data: sucursales = [] } = useSucursales()
  const { data: empleadas = [] } = useEmpleadas()
  const { data: evaluaciones = [], isLoading } = useEvaluacionesHoja(sucursalId, mes, anio)
  const guardar = useGuardarEvaluacion()

  // Init sucursal
  if (!sucursalId && sucursales.length > 0) setSucursalId(sucursales[0].id)

  // Local override state: empleada_id → cumplió_hoja boolean
  const [overrides, setOverrides] = useState<Record<string, boolean>>({})
  const [notasMap, setNotasMap] = useState<Record<string, string>>({})

  // Whether a given empleada cumplió, checking overrides first then DB
  const getCumplió = (empId: string): boolean => {
    if (empId in overrides) return overrides[empId]
    const ev = evaluaciones.find((e: any) => e.empleada_id === empId)
    return ev?.cumplio_hoja ?? false
  }

  const getNotas = (empId: string): string => {
    if (empId in notasMap) return notasMap[empId]
    const ev = evaluaciones.find((e: any) => e.empleada_id === empId)
    return ev?.notas ?? ''
  }

  const toggle = (empId: string) => {
    setOverrides(prev => ({ ...prev, [empId]: !getCumplió(empId) }))
  }

  const dirty = useMemo(() => {
    return Object.keys(overrides).length > 0 || Object.keys(notasMap).length > 0
  }, [overrides, notasMap])

  const handleGuardar = async () => {
    if (!sucursalId) return
    const empleadasConCambio = new Set([
      ...Object.keys(overrides),
      ...Object.keys(notasMap)
    ])

    try {
      for (const empId of empleadasConCambio) {
        await guardar.mutateAsync({
          empleada_id: empId,
          sucursal_id: sucursalId,
          mes,
          anio,
          cumplio_hoja: getCumplió(empId),
          notas: getNotas(empId) || undefined
        })
      }
      setOverrides({})
      setNotasMap({})
      toast('Evaluaciones guardadas correctamente', 'success')
    } catch (e) {
      console.error(e)
      toast('Error al guardar', 'error')
    }
  }

  const prevMes = () => {
    if (mes === 1) { setMes(12); setAnio(a => a - 1) }
    else setMes(m => m - 1)
    setOverrides({})
    setNotasMap({})
  }

  const nextMes = () => {
    if (mes === 12) { setMes(1); setAnio(a => a + 1) }
    else setMes(m => m + 1)
    setOverrides({})
    setNotasMap({})
  }

  const cumplieronCount = empleadas.filter(e => getCumplió(e.id)).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* Header */}
      <div className="page-header" style={{ padding: '24px 24px 0', marginBottom: 24 }}>
        <div className="page-header-content">
          <h1 className="page-title">Evaluación de Hoja</h1>
          <p className="page-subtitle">
            Marca si cada profesional cumplió con sus metas del mes. Esto determina su porcentaje de comisión.
          </p>
        </div>
        <div className="page-header-actions" style={{ gap: 12 }}>
          {/* Sucursal */}
          <select
            className="form-input"
            value={sucursalId}
            onChange={e => { setSucursalId(e.target.value); setOverrides({}); setNotasMap({}) }}
            style={{ height: 36, fontSize: 13, minWidth: 160 }}
          >
            {sucursales.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
          </select>

          {/* Navegación mes */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, padding: '4px 8px' }}>
            <button className="btn-icon" onClick={prevMes} style={{ width: 28, height: 28 }}>
              <ChevronLeft size={16} />
            </button>
            <span style={{ fontSize: 14, fontWeight: 600, minWidth: 130, textAlign: 'center' }}>
              {MESES[mes - 1]} {anio}
            </span>
            <button className="btn-icon" onClick={nextMes} style={{ width: 28, height: 28 }}
              disabled={mes === now.getMonth() + 1 && anio === now.getFullYear()}>
              <ChevronRight size={16} />
            </button>
          </div>

          {dirty && (
            <button className="btn-primary" onClick={handleGuardar} disabled={guardar.isPending} style={{ height: 36 }}>
              <Save size={15} /> {guardar.isPending ? 'Guardando...' : 'Guardar cambios'}
            </button>
          )}
        </div>
      </div>

      {/* Resumen rápido */}
      <div style={{ padding: '0 24px 16px', display: 'flex', gap: 16 }}>
        <div className="dash-card" style={{ flex: 1, maxWidth: 220 }}>
          <div className="dash-card-header">
            <span className="dash-card-title">Con hoja</span>
            <div className="dash-icon-box"><FileCheck size={16} /></div>
          </div>
          <div className="dash-card-value" style={{ color: 'var(--success)' }}>{cumplieronCount}</div>
          <div className="dash-card-subvalue">de {empleadas.length} profesionales</div>
        </div>

        <div className="dash-card" style={{ flex: 1, maxWidth: 220 }}>
          <div className="dash-card-header">
            <span className="dash-card-title">Sin hoja</span>
            <div className="dash-icon-box" style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}>
              <User size={16} />
            </div>
          </div>
          <div className="dash-card-value" style={{ color: 'var(--danger)' }}>{empleadas.length - cumplieronCount}</div>
          <div className="dash-card-subvalue">comisionan en tasa reducida</div>
        </div>
      </div>

      {/* Tabla de empleadas */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px 24px' }}>
        {isLoading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-3)' }}>Cargando...</div>
        ) : empleadas.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-3)' }}>No hay profesionales registradas.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {empleadas.map(emp => {
              const cumplió = getCumplió(emp.id)
              const notas = getNotas(emp.id)
              return (
                <div
                  key={emp.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 16,
                    padding: '16px 20px',
                    background: cumplió ? 'var(--success-bg)' : 'var(--surface)',
                    border: `1px solid ${cumplió ? 'var(--success)' : 'var(--border)'}`,
                    borderRadius: 12,
                    transition: 'all 0.2s'
                  }}
                >
                  {/* Avatar */}
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                    background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18, fontWeight: 700, color: 'var(--accent)'
                  }}>
                    {(emp as any).foto_url
                      ? <img src={(emp as any).foto_url} alt={emp.nombre} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                      : emp.nombre.charAt(0).toUpperCase()
                    }
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-1)' }}>{emp.nombre}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{(emp as any).puesto || 'Profesional'}</div>
                  </div>

                  {/* Notas */}
                  <input
                    type="text"
                    placeholder="Notas (opcional)..."
                    className="form-input"
                    style={{ maxWidth: 260, height: 34, fontSize: 12 }}
                    value={notas}
                    onChange={e => setNotasMap(prev => ({ ...prev, [emp.id]: e.target.value }))}
                  />

                  {/* Toggle */}
                  <button
                    onClick={() => toggle(emp.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
                      background: cumplió ? 'var(--success)' : 'var(--surface-2)',
                      color: cumplió ? '#fff' : 'var(--text-2)',
                      fontWeight: 700, fontSize: 13,
                      transition: 'all 0.2s',
                      minWidth: 140, justifyContent: 'center'
                    }}
                  >
                    {cumplió
                      ? <><CheckSquare size={17} /> Cumplió hoja</>
                      : <><Square size={17} /> Sin hoja</>
                    }
                  </button>
                </div>
              )
            })}
          </div>
        )}

        {dirty && (
          <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn-primary" onClick={handleGuardar} disabled={guardar.isPending} style={{ padding: '12px 28px' }}>
              <Save size={16} /> {guardar.isPending ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
