import { useState } from 'react'
import { RefreshCw, CheckCircle2, Shield } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function SeguridadTab() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.')
      return
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }

    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError('Error al actualizar la contraseña.')
    } else {
      setSuccess(true)
      setPassword('')
      setConfirm('')
    }
    setLoading(false)
  }

  return (
    <div className="animate-in">
      <div style={{ maxWidth: 460, margin: '0 auto' }}>
        
        {/* Cambio de Contraseña */}
        <div className="stats-card">
          <div style={{ padding: '10px 0 20px', textAlign: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', margin: '0 auto 12px' }}>
              <Shield size={24} />
            </div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-1)' }}>Acceso Personal</h2>
            <p style={{ fontSize: 12, color: 'var(--text-3)' }}>Actualiza tu clave de acceso.</p>
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20 }}>
            {success && <div style={{ background: 'var(--success-bg)', color: 'var(--success)', padding: '12px', borderRadius: 8, marginBottom: 16, fontSize: 12, display: 'flex', gap: 8 }}><CheckCircle2 size={16} /> ¡Actualizada!</div>}
            {error && <div style={{ background: 'var(--danger-bg)', color: 'var(--danger)', padding: '12px', borderRadius: 8, marginBottom: 16, fontSize: 12 }}>{error}</div>}

            <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="stats-section-label">Nueva contraseña</label>
                <input type="password" className="form-input" style={{ borderRadius: 10 }} value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="stats-section-label">Confirmar contraseña</label>
                <input type="password" className="form-input" style={{ borderRadius: 10 }} value={confirm} onChange={e => setConfirm(e.target.value)} required />
              </div>
              <button className="btn-primary" type="submit" disabled={loading} style={{ justifyContent: 'center', height: 40 }}>
                {loading ? <RefreshCw className="animate-spin" size={16} /> : 'Guardar nueva clave'}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  )
}
