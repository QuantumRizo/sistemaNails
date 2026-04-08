import { useState } from 'react'
import { Wallet, DollarSign, CreditCard, CheckCircle, TrendingDown, TrendingUp, Clock, AlertTriangle } from 'lucide-react'
import { useCajaActiva, useAbrirCaja, useCerrarCaja, useCrearMovimientoCaja } from '../hooks/useCaja'
import { useTodasEmpleadas } from '../hooks/useEmpleadas'
import { useSucursales } from '../hooks/useSucursales'
import { useToast } from '../components/Common/Toast'

export default function CajaPage() {
  const { data: sucursales = [] } = useSucursales()
  const [activeSucursal, setActiveSucursal] = useState<string>('')
  const toast = useToast()
  
  if (!activeSucursal && sucursales.length > 0) {
    setActiveSucursal(sucursales[0].id)
  }

  const { data: cajaInfo, isLoading } = useCajaActiva(activeSucursal)
  const [montoApertura, setMontoApertura] = useState(0)
  const [empleadaAperturaId, setEmpleadaAperturaId] = useState('')
  const abrirCaja = useAbrirCaja()

  // ─── Modal Gasto ─────────────────────────────────────────────
  const [showGastoModal, setShowGastoModal] = useState(false)
  const [gastoMonto, setGastoMonto] = useState(0)
  const [gastoConcepto, setGastoConcepto] = useState('')
  const [gastoEmpleadaId, setGastoEmpleadaId] = useState('')

  // ─── Modal Ingreso Extra ──────────────────────────────────────
  const [showIngresoModal, setShowIngresoModal] = useState(false)
  const [ingresoMonto, setIngresoMonto] = useState(0)
  const [ingresoConcepto, setIngresoConcepto] = useState('')
  const [ingresoEmpleadaId, setIngresoEmpleadaId] = useState('')

  const crearMovimiento = useCrearMovimientoCaja()

  // ─── Modal Cierre ─────────────────────────────────────────────
  const [showCierreModal, setShowCierreModal] = useState(false)
  const [showCierreConfirmModal, setShowCierreConfirmModal] = useState(false)
  const [montoReal, setMontoReal] = useState(0)
  const [notasCierre, setNotasCierre] = useState('')
  const cerrarCaja = useCerrarCaja()

  const { data: empleadas = [] } = useTodasEmpleadas()

  const handleAbrirCaja = async () => {
    if (montoApertura < 0) { toast('Monto inválido', 'warning'); return }
    if (!activeSucursal) { toast('Selecciona una sucursal', 'warning'); return }
    try {
      await abrirCaja.mutateAsync({ 
        sucursalId: activeSucursal, 
        montoEfectivo: montoApertura,
        empleadaId: empleadaAperturaId || undefined
      })
      setMontoApertura(0)
      setEmpleadaAperturaId('')
    } catch (e) {
      console.error(e)
      toast('Error abriendo caja', 'error')
    }
  }

  const handleGuardarGasto = async () => {
    if (!gastoConcepto || gastoMonto <= 0) { toast('Faltan datos en el gasto', 'warning'); return }
    try {
      if (!cajaInfo?.turno.id) return
      await crearMovimiento.mutateAsync({
        turno_caja_id: cajaInfo.turno.id,
        tipo: 'Gasto / Salida',
        monto: gastoMonto,
        concepto: gastoConcepto,
        empleada_id: gastoEmpleadaId || null
      })
      setShowGastoModal(false)
      setGastoMonto(0)
      setGastoConcepto('')
      setGastoEmpleadaId('')
    } catch (e) {
      console.error(e)
      toast('Error al registrar movimiento', 'error')
    }
  }

  const handleGuardarIngreso = async () => {
    if (!ingresoConcepto || ingresoMonto <= 0) { toast('Faltan datos del ingreso', 'warning'); return }
    try {
      if (!cajaInfo?.turno.id) return
      await crearMovimiento.mutateAsync({
        turno_caja_id: cajaInfo.turno.id,
        tipo: 'Ingreso Extra',
        monto: ingresoMonto,
        concepto: ingresoConcepto,
        empleada_id: ingresoEmpleadaId || null
      })
      setShowIngresoModal(false)
      setIngresoMonto(0)
      setIngresoConcepto('')
      setIngresoEmpleadaId('')
    } catch (e) {
      console.error(e)
      toast('Error al registrar ingreso', 'error')
    }
  }

  const handleCerrarCaja = async () => {
    try {
      if (!cajaInfo?.turno.id) return
      await cerrarCaja.mutateAsync({
        turnoId: cajaInfo.turno.id,
        resumen: cajaInfo.resumen,
        montoReal: montoReal,
        notas: notasCierre
      })
      setShowCierreConfirmModal(false)
      setShowCierreModal(false)
      toast('Caja cerrada correctamente', 'success')
    } catch (e) {
      console.error(e)
      toast('Error al cerrar caja', 'error')
    }
  }

  if (isLoading) {
    return <div className="page-container p-6">Cargando datos de caja...</div>
  }

  // --- VISTA CAJA CERRADA ---
  if (!cajaInfo || !cajaInfo.turno) {
    return (
      <div className="page-container p-6 bg-gray-50 flex items-center justify-center">
        <div className="dash-placeholder" style={{ maxWidth: 450, width: '100%', marginTop: '10vh' }}>
          <div className="dash-icon-box" style={{ width: 64, height: 64, margin: '0 auto 20px', borderRadius: '50%' }}>
            <Wallet size={32} />
          </div>

          <div style={{ marginBottom: 20 }}>
             <select
               value={activeSucursal}
               onChange={(e) => setActiveSucursal(e.target.value)}
               className="form-input"
               style={{ textAlign: 'center', fontSize: 16, fontWeight: 600 }}
             >
               {sucursales.map((s) => (
                 <option key={s.id} value={s.id}>{s.nombre}</option>
               ))}
             </select>
          </div>

          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Caja Cerrada</h2>
          <p style={{ color: 'var(--text-3)', fontSize: 13, marginBottom: 30, lineHeight: 1.6 }}>
            El turno está cerrado en esta sucursal. Abre la caja para declarar el efectivo base (fondo fijo) 
            con el que arrancan operaciones en mostrador el día de hoy.
          </p>

          <div style={{ padding: 20, background: 'var(--surface-2)', borderRadius: 12, border: '1px solid var(--border-2)', width: '100%' }}>
            
            {/* Empleada que abre */}
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>
                ¿Quién abre la caja?
              </label>
              <select 
                className="form-input" 
                value={empleadaAperturaId}
                onChange={e => setEmpleadaAperturaId(e.target.value)}
              >
                <option value="">— Seleccionar empleada —</option>
                {empleadas.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
              </select>
            </div>

            <label style={{ display: 'block', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>
              Fondo inicial (Efectivo)
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 15, top: 12, color: 'var(--text-3)' }}>$</span>
              <input 
                type="number" 
                className="form-input" 
                style={{ paddingLeft: 30, height: 44, fontSize: 18, fontWeight: 600 }}
                value={montoApertura}
                onChange={e => setMontoApertura(Number(e.target.value))}
                min="0" step="10"
              />
            </div>
            
            <button 
              className="btn-primary" 
              style={{ width: '100%', padding: '12px', marginTop: 15, fontSize: 14 }}
              onClick={handleAbrirCaja}
              disabled={abrirCaja.isPending}
            >
              <CheckCircle size={18} /> 
              {abrirCaja.isPending ? 'Abriendo...' : 'Abrir Turno'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // --- VISTA CAJA ABIERTA ---
  const t = cajaInfo.resumen

  return (
    <div className="page-container p-6" style={{ overflowY: 'auto', background: 'var(--bg)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 15, marginBottom: 10 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.5px', margin: 0 }}>Turno de Caja</h1>
            <select
               value={activeSucursal}
               onChange={(e) => setActiveSucursal(e.target.value)}
               className="form-input"
               style={{ padding: '4px 30px 4px 10px', height: 32, fontSize: 13, minWidth: 150 }}
            >
               {sucursales.map((s) => (
                 <option key={s.id} value={s.id}>{s.nombre}</option>
               ))}
            </select>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Clock size={14} /> Abierto desde {new Date(`${cajaInfo.turno.fecha_apertura}T${cajaInfo.turno.hora_apertura}`).toLocaleString('es-MX', { dateStyle: 'long', timeStyle: 'short' })}
            {cajaInfo.turno.empleada_abre && (
              <span style={{ marginLeft: 8, background: 'var(--surface-2)', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
                Apertura: {(cajaInfo.turno.empleada_abre as any).nombre}
              </span>
            )}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-secondary" onClick={() => setShowIngresoModal(true)}>
            <TrendingUp size={16} /> Ingreso Extra
          </button>
          <button className="btn-secondary" onClick={() => setShowGastoModal(true)}>
            <TrendingDown size={16} /> Registrar Gasto
          </button>
          <button className="btn-primary" onClick={() => {
            setMontoReal(t.efectivoEsperado)
            setShowCierreModal(true)
          }}>
            <Wallet size={16} /> Cerrar Caja (Corte)
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 30 }}>
        {/* Métrica 1 */}
        <div className="dash-card">
          <div className="dash-card-header">
            <span className="dash-card-title">Ventas Efectivo</span>
            <div className="dash-icon-box"><DollarSign size={18} /></div>
          </div>
          <div>
            <div className="dash-card-value">${t.ventasEfectivo.toFixed(2)}</div>
            <div className="dash-card-subvalue" style={{ marginTop: 4 }}>
              + Fondo Fijo de ${t.fondoInicial.toFixed(2)}
            </div>
          </div>
        </div>
        
        {/* Métrica 2 */}
        <div className="dash-card">
          <div className="dash-card-header">
            <span className="dash-card-title">Ventas Tarjeta / Otros</span>
            <div className="dash-icon-box"><CreditCard size={18} /></div>
          </div>
          <div>
            <div className="dash-card-value">${(t.ventasTarjeta + t.ventasOtros).toFixed(2)}</div>
            <div className="dash-card-subvalue" style={{ marginTop: 4 }}>
              Tarjetas: ${t.ventasTarjeta.toFixed(2)} | Otros: ${t.ventasOtros.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Métrica 3 */}
        {t.ingresosExtra > 0 && (
          <div className="dash-card">
            <div className="dash-card-header">
              <span className="dash-card-title">Ingresos Extra</span>
              <div className="dash-icon-box" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>
                <TrendingUp size={18} />
              </div>
            </div>
            <div>
              <div className="dash-card-value" style={{ color: 'var(--success)' }}>+${t.ingresosExtra.toFixed(2)}</div>
              <div className="dash-card-subvalue" style={{ marginTop: 4 }}>Entradas adicionales de efectivo</div>
            </div>
          </div>
        )}

        {/* Métrica Gastos */}
        <div className="dash-card" style={{ borderColor: 'var(--danger)', background: 'var(--bg)' }}>
          <div className="dash-card-header">
            <span className="dash-card-title">Gastos del Turno</span>
            <div className="dash-icon-box" style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}>
              <TrendingDown size={18} />
            </div>
          </div>
          <div>
            <div className="dash-card-value" style={{ color: 'var(--danger)' }}>-${t.gastos.toFixed(2)}</div>
            <div className="dash-card-subvalue" style={{ marginTop: 4, color: 'var(--text-3)' }}>
              Salidas en efectivo registradas
            </div>
          </div>
        </div>
      </div>

      {/* EFECTIVO ESPERADO (CAJÓN) */}
      <div style={{ background: 'var(--surface)', borderRadius: 16, padding: 30, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', marginBottom: 30 }}>
        <div>
          <h2 style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-3)', fontWeight: 700, marginBottom: 5 }}>
            Total Esperado en Cajón (Efectivo)
          </h2>
          <div style={{ fontSize: 42, fontWeight: 300, color: 'var(--accent)', letterSpacing: '-1px' }}>
            ${t.efectivoEsperado.toFixed(2)}
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 8 }}>
            (Fondo Inicial + Ventas Efectivo + Entradas Extra - Gastos)
          </p>
        </div>
        <div style={{ opacity: 0.1 }}><Wallet size={100} /></div>
      </div>

      {/* Movimientos del turno */}
      {(cajaInfo.movimientos || []).length > 0 && (
        <div style={{ background: 'var(--surface)', borderRadius: 12, padding: 20, border: '1px solid var(--border)', marginBottom: 30 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 15, color: 'var(--text-1)' }}>Movimientos del turno</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Hora</th>
                <th>Tipo</th>
                <th>Concepto</th>
                <th>Empleada</th>
                <th style={{ textAlign: 'right' }}>Monto</th>
              </tr>
            </thead>
            <tbody>
              {cajaInfo.movimientos.map((m: any) => (
                <tr key={m.id}>
                  <td style={{ fontSize: 12, color: 'var(--text-3)' }}>{m.hora?.substring(0, 5)}</td>
                  <td>
                    <span style={{ 
                      fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
                      background: m.tipo === 'Gasto / Salida' ? 'var(--danger-bg)' : 'var(--success-bg)',
                      color: m.tipo === 'Gasto / Salida' ? 'var(--danger)' : 'var(--success)'
                    }}>
                      {m.tipo}
                    </span>
                  </td>
                  <td>{m.concepto}</td>
                  <td style={{ fontSize: 12 }}>{m.empleada?.nombre || '—'}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600, color: m.tipo === 'Gasto / Salida' ? 'var(--danger)' : 'var(--success)' }}>
                    {m.tipo === 'Gasto / Salida' ? '-' : '+'}${Number(m.monto).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}


      {/* ─── MODALES ─────────────────────────────────────────────── */}

      {/* Modal Gasto */}
      {showGastoModal && (
        <div className="modal-overlay" onClick={() => setShowGastoModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Registrar Gasto (Salida de Efectivo)</h3>
            </div>
            <div className="modal-body p-5">
              <div className="form-group mb-4">
                <label>Concepto / Motivo</label>
                <input type="text" className="form-input" placeholder="Ej. Compra de material..." value={gastoConcepto} onChange={e => setGastoConcepto(e.target.value)} autoFocus />
              </div>
              <div className="form-group mb-4">
                <label>Monto extraído ($)</label>
                <input type="number" className="form-input" value={gastoMonto} onChange={e => setGastoMonto(Number(e.target.value))} min="0" step="10" />
              </div>
              <div className="form-group">
                <label>Empleada que retira (Opcional)</label>
                <select className="form-input" value={gastoEmpleadaId} onChange={e => setGastoEmpleadaId(e.target.value)}>
                  <option value="">-- Seleccionar --</option>
                  {empleadas.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowGastoModal(false)}>Cancelar</button>
              <button className="btn-danger" onClick={handleGuardarGasto} disabled={crearMovimiento.isPending}>
                Registrar Gasto
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ingreso Extra */}
      {showIngresoModal && (
        <div className="modal-overlay" onClick={() => setShowIngresoModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Registrar Ingreso Extra</h3>
            </div>
            <div className="modal-body p-5">
              <div className="form-group mb-4">
                <label>Concepto / Descripción</label>
                <input type="text" className="form-input" placeholder="Ej. Cambio de billete, depósito..." value={ingresoConcepto} onChange={e => setIngresoConcepto(e.target.value)} autoFocus />
              </div>
              <div className="form-group mb-4">
                <label>Monto ingresado ($)</label>
                <input type="number" className="form-input" value={ingresoMonto} onChange={e => setIngresoMonto(Number(e.target.value))} min="0" step="10" />
              </div>
              <div className="form-group">
                <label>Empleada responsable (Opcional)</label>
                <select className="form-input" value={ingresoEmpleadaId} onChange={e => setIngresoEmpleadaId(e.target.value)}>
                  <option value="">-- Seleccionar --</option>
                  {empleadas.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowIngresoModal(false)}>Cancelar</button>
              <button className="btn-primary" onClick={handleGuardarIngreso} disabled={crearMovimiento.isPending}>
                <TrendingUp size={16} /> Registrar Ingreso
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Cierre (Paso 1: ingresar monto) */}
      {showCierreModal && (
        <div className="modal-overlay" onClick={() => setShowCierreModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Cierre de Caja (Corte)</h3>
            </div>
            <div className="modal-body p-6" style={{ background: 'var(--bg)' }}>
              
              <div style={{ padding: 15, background: 'var(--surface)', borderRadius: 8, border: '1px solid var(--border)', marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: 'var(--text-2)' }}>Fondo Inicial:</span>
                  <span style={{ fontWeight: 600 }}>${t.fondoInicial.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: 'var(--text-2)' }}>Ventas Efectivo:</span>
                  <span style={{ fontWeight: 600 }}>${t.ventasEfectivo.toFixed(2)}</span>
                </div>
                {t.ingresosExtra > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: 'var(--text-2)' }}>Ingresos Extra:</span>
                    <span style={{ fontWeight: 600, color: 'var(--success)' }}>+${t.ingresosExtra.toFixed(2)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: 'var(--text-2)' }}>Gastos / Retiros:</span>
                  <span style={{ fontWeight: 600, color: 'var(--danger)' }}>-${t.gastos.toFixed(2)}</span>
                </div>
                <div style={{ borderTop: '1px solid var(--border)', margin: '10px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 700, color: 'var(--accent)' }}>
                  <span>Efectivo Total Esperado:</span>
                  <span>${t.efectivoEsperado.toFixed(2)}</span>
                </div>
              </div>

              <div className="form-group mb-4">
                <label style={{ fontSize: 14, fontWeight: 600 }}>¿Cuánto efectivo real hay en caja?</label>
                <div style={{ position: 'relative', marginTop: 8 }}>
                  <span style={{ position: 'absolute', left: 15, top: 12, color: 'var(--text-3)', fontSize: 18 }}>$</span>
                  <input 
                    type="number" 
                    className="form-input" 
                    style={{ paddingLeft: 35, height: 50, fontSize: 24, fontWeight: 700, color: 'var(--text-1)' }}
                    value={montoReal} 
                    onChange={e => setMontoReal(Number(e.target.value))} 
                  />
                </div>
                {montoReal !== t.efectivoEsperado && (
                  <div style={{ marginTop: 8, fontSize: 12, color: montoReal > t.efectivoEsperado ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
                    Diferencia de: ${(montoReal - t.efectivoEsperado).toFixed(2)} MXN
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Notas de Cierre (Opcional)</label>
                <textarea 
                  className="form-input" 
                  rows={2}
                  placeholder="Justificación de faltantes/sobrantes..." 
                  value={notasCierre} 
                  onChange={e => setNotasCierre(e.target.value)} 
                />
              </div>

            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowCierreModal(false)}>Cancelar</button>
              <button className="btn-primary" onClick={() => {
                setShowCierreModal(false)
                setShowCierreConfirmModal(true)
              }}>
                <Wallet size={16} /> Continuar → Confirmar Cierre
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Cierre (Paso 2: Confirmación visual) */}
      {showCierreConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: 400 }}>
            <div className="modal-header" style={{ background: 'var(--danger-bg)', borderBottom: '1px solid var(--danger)' }}>
              <AlertTriangle size={20} color="var(--danger)" />
              <h3 className="modal-title" style={{ color: 'var(--danger)' }}>Confirmar Cierre de Caja</h3>
            </div>
            <div className="modal-body p-6">
              <p style={{ marginBottom: 20, fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6 }}>
                Estás a punto de cerrar el turno de caja. Esta acción <strong>no se puede revertir</strong>.
              </p>
              <div style={{ padding: 15, background: 'var(--surface-2)', borderRadius: 8, fontSize: 13 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span>Efectivo esperado:</span>
                  <span style={{ fontWeight: 700 }}>${t.efectivoEsperado.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span>Efectivo contado:</span>
                  <span style={{ fontWeight: 700 }}>${montoReal.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 15, color: montoReal >= t.efectivoEsperado ? 'var(--success)' : 'var(--danger)' }}>
                  <span>Diferencia:</span>
                  <span>{montoReal >= t.efectivoEsperado ? '+' : ''}{(montoReal - t.efectivoEsperado).toFixed(2)}</span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => {
                setShowCierreConfirmModal(false)
                setShowCierreModal(true)
              }}>← Volver</button>
              <button className="btn-danger" onClick={handleCerrarCaja} disabled={cerrarCaja.isPending}>
                {cerrarCaja.isPending ? 'Cerrando...' : 'Confirmar Cierre'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
