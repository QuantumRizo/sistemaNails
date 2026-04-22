import React, { useState } from 'react'
import { X, Save, AlertCircle, Loader2 } from 'lucide-react'
import { useCrearCliente } from '../../hooks/useClientes'
import { useSucursales } from '../../hooks/useSucursales'
import { supabase } from '../../lib/supabase'
import type { Cliente, SexoType } from '../../types/database'
import { useToast } from '../Common/Toast'

const PROCEDENCIAS = [
  'Banamex', 'Facebook', 'Instagram', 'Lufthansa', 'Recomendación',
  'Google', 'TikTok', 'Otro',
]

interface Props {
  onCreated: (cliente?: Cliente) => void
  onClose: () => void
}

export default function FormularioCliente({ onCreated, onClose }: Props) {
  const crearCliente = useCrearCliente()
  const toast = useToast()
  const { data: sucursales = [] } = useSucursales()
  const [form, setForm] = useState({
    nombre_completo: '',
    telefono_cel: '',
    email: '',
    rfc: '',
    procedencia: '',
    sexo: '' as SexoType | '',
    fecha_nacimiento: '',
    pais: 'México',
    notas: '',
    sucursal_id: '',
  })

  // Estados para validación en tiempo real
  const [checking, setChecking] = useState({ phone: false, email: false })
  const [errors, setErrors] = useState({ phone: '', email: '' })
  const [submitted, setSubmitted] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const set = (k: string, v: string) => {
    setForm((f) => ({ ...f, [k]: v }))
    // Limpiar errores cuando el usuario vuelve a escribir
    if (k === 'telefono_cel') setErrors(prev => ({ ...prev, phone: '' }))
    if (k === 'email') setErrors(prev => ({ ...prev, email: '' }))
  }

  const sanitizePhone = (val: string) => val.replace(/\D/g, '').slice(0, 10)

  // Validación de teléfono en tiempo real
  React.useEffect(() => {
    if (form.telefono_cel.length === 10) {
      const checkPhone = async () => {
        setChecking(prev => ({ ...prev, phone: true }))
        const { data } = await supabase
          .from('clientes')
          .select('id, nombre_completo')
          .eq('telefono_cel', form.telefono_cel)
          .maybeSingle()
        
        if (data) {
          setErrors(prev => ({ ...prev, phone: `Ya registrado a nombre de: ${data.nombre_completo}` }))
        }
        setChecking(prev => ({ ...prev, phone: false }))
      }
      checkPhone()
    }
  }, [form.telefono_cel])

  // Validación de email en tiempo real
  React.useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (form.email && emailRegex.test(form.email)) {
      const checkEmail = async () => {
        setChecking(prev => ({ ...prev, email: true }))
        const { data } = await supabase
          .from('clientes')
          .select('id, nombre_completo')
          .eq('email', form.email)
          .maybeSingle()
        
        if (data) {
          setErrors(prev => ({ ...prev, email: `Este correo ya pertenece a: ${data.nombre_completo}` }))
        }
        setChecking(prev => ({ ...prev, email: false }))
      }
      checkEmail()
    }
  }, [form.email])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)

    const { nombre_completo, telefono_cel, email, ...extra } = form
    
    // Validación básica antes de enviar
    if (!nombre_completo.trim()) return

    if (telefono_cel && telefono_cel.length !== 10) {
      toast('El teléfono debe tener exactamente 10 dígitos (Ej: 5512345678)', 'error')
      return
    }

    const payload = {
      nombre_completo,
      telefono_cel: telefono_cel || null,
      email: email || null,
      sucursal_id: form.sucursal_id || null,
      datos_extra: {
        rfc: extra.rfc || undefined,
        procedencia: extra.procedencia || undefined,
        sexo: (extra.sexo || undefined) as SexoType | undefined,
        fecha_nacimiento: extra.fecha_nacimiento || undefined,
        pais: extra.pais || undefined,
        notas: extra.notas || undefined,
      },
    }

    try {
      const result = await crearCliente.mutateAsync(payload)
      setSaveSuccess(true)
      toast('Cliente creado con éxito', 'success')
      // Esperar un momento para mostrar el estado de éxito antes de cerrar
      setTimeout(() => {
        onCreated(result as Cliente)
      }, 1500)
    } catch (err: any) {
      console.error('Error al crear cliente:', err)
      // Error 23505 es "unique_violation" en PostgreSQL (Supabase)
      if (err.code === '23505') {
        const field = err.message?.includes('telefono_cel') ? 'teléfono' : 'email'
        toast(`Este ${field} ya está registrado con otro cliente.`, 'error')
      } else {
        toast('Error al guardar el cliente. Revisa los datos.', 'error')
      }
    }
  }

  if (saveSuccess) {
    return (
      <div className="modal-overlay">
        <div className="modal-box" style={{ maxWidth: 400, textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ 
            width: 80, height: 80, borderRadius: '50%', background: 'var(--success-bg)', 
            color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', 
            margin: '0 auto 24px', animation: 'scale-up 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)' 
          }}>
            <Save size={40} />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-1)', marginBottom: 8 }}>¡Cliente registrado!</h2>
          <p style={{ color: 'var(--text-3)', fontSize: 14 }}>La información se ha guardado correctamente.</p>
          <style>{`
            @keyframes scale-up {
              from { transform: scale(0.5); opacity: 0; }
              to { transform: scale(1); opacity: 1; }
            }
          `}</style>
        </div>
      </div>
    )
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Nuevo Cliente</h2>
          <button onClick={onClose} className="btn-icon"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="form-body">
          {/* ── Datos principales ───────────────────────── */}
          <div className="form-section-title">Datos principales</div>
          <div className="form-grid-2">
            <div className="form-group">
              <label>Nombre completo <span style={{ color: 'var(--danger)' }}>*</span></label>
              <input 
                required 
                value={form.nombre_completo} 
                onChange={(e) => set('nombre_completo', e.target.value)} 
                className={`form-input ${submitted && !form.nombre_completo ? 'input-error' : ''}`} 
                placeholder="Nombre y apellidos" 
              />
              {submitted && !form.nombre_completo && (
                <div className="error-message">Este campo es obligatorio</div>
              )}
            </div>
            <div className="form-group">
              <label>Teléfono celular</label>
              <div style={{ position: 'relative' }}>
                <input 
                  value={form.telefono_cel} 
                  onChange={(e) => set('telefono_cel', sanitizePhone(e.target.value))} 
                  className={`form-input ${errors.phone ? 'input-error' : ''}`} 
                  placeholder="5512345678" 
                />
                {checking.phone && (
                  <Loader2 size={14} className="animate-spin" style={{ position: 'absolute', right: 10, top: 12, color: 'var(--text-3)' }} />
                )}
              </div>
              {errors.phone && (
                <div style={{ fontSize: 10, color: 'var(--danger)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                  <AlertCircle size={10} /> {errors.phone}
                </div>
              )}
            </div>
            <div className="form-group">
              <label>Email <span style={{ color: 'var(--text-3)', fontSize: 10, fontWeight: 400 }}>(Opcional)</span></label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="email" 
                  value={form.email} 
                  onChange={(e) => set('email', e.target.value)} 
                  className={`form-input ${errors.email ? 'input-error' : ''}`} 
                  placeholder="cliente@email.com" 
                />
                {checking.email && (
                  <Loader2 size={14} className="animate-spin" style={{ position: 'absolute', right: 10, top: 12, color: 'var(--text-3)' }} />
                )}
              </div>
              {errors.email && (
                <div style={{ fontSize: 10, color: 'var(--danger)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                  <AlertCircle size={10} /> {errors.email}
                </div>
              )}
            </div>
            <div className="form-group">
              <label>RFC <span style={{ color: 'var(--text-3)', fontSize: 10, fontWeight: 400 }}>(Opcional)</span></label>
              <input value={form.rfc} onChange={(e) => set('rfc', e.target.value)} className="form-input" placeholder="AAAA000000XXX" />
            </div>
          </div>

          {/* ── Datos extra (JSONB) ─────────────────────── */}
          <div className="form-section-title mt-4">Información adicional</div>
          <div className="form-grid-2">
            <div className="form-group">
              <label>Procedencia <span style={{ color: 'var(--text-3)', fontSize: 10, fontWeight: 400 }}>(Opcional)</span></label>
              <select value={form.procedencia} onChange={(e) => set('procedencia', e.target.value)} className="form-input">
                <option value="">Seleccionar...</option>
                {PROCEDENCIAS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Sexo <span style={{ color: 'var(--text-3)', fontSize: 10, fontWeight: 400 }}>(Opcional)</span></label>
              <select value={form.sexo} onChange={(e) => set('sexo', e.target.value)} className="form-input">
                <option value="">Seleccionar...</option>
                <option value="Mujer">Mujer</option>
                <option value="Hombre">Hombre</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            <div className="form-group">
              <label>Fecha de nacimiento <span style={{ color: 'var(--text-3)', fontSize: 10, fontWeight: 400 }}>(Opcional)</span></label>
              <input type="date" value={form.fecha_nacimiento} onChange={(e) => set('fecha_nacimiento', e.target.value)} className="form-input" />
            </div>
            <div className="form-group">
              <label>País <span style={{ color: 'var(--text-3)', fontSize: 10, fontWeight: 400 }}>(Opcional)</span></label>
              <input value={form.pais} onChange={(e) => set('pais', e.target.value)} className="form-input" placeholder="México" />
            </div>
            <div className="form-group">
              <label>Sucursal de origen <span style={{ color: 'var(--text-3)', fontSize: 10, fontWeight: 400 }}>(Opcional)</span></label>
              <select value={form.sucursal_id} onChange={(e) => set('sucursal_id', e.target.value)} className="form-input">
                <option value="">Ninguna / Global</option>
                {sucursales.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group mt-2">
            <label>Notas <span style={{ color: 'var(--text-3)', fontSize: 10, fontWeight: 400 }}>(Opcional)</span></label>
            <textarea value={form.notas} onChange={(e) => set('notas', e.target.value)} className="form-input" rows={3} placeholder="Alergias, preferencias, etc." />
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-ghost">Cancelar</button>
            <button 
              type="submit" 
              disabled={crearCliente.isPending || !!errors.phone || !!errors.email || checking.phone || checking.email} 
              className="btn-primary"
            >
              <Save size={15} />
              {crearCliente.isPending ? 'Guardando...' : 'Guardar cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
