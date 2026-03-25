import React, { useState } from 'react'
import { Plus, Trash2, Check, X } from 'lucide-react'
import { useTodasEmpleadas } from '../hooks/useEmpleadas'
import { supabase } from '../lib/supabase'
import { useQueryClient } from '@tanstack/react-query'
import type { Empleada } from '../types/database'


interface EmpleadaForm { id?: string; nombre: string }


export default function ProfesionalesPage() {
  const qc = useQueryClient()
  const { data: empleadas = [], isLoading } = useTodasEmpleadas()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<EmpleadaForm>({ nombre: '' })

  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.nombre.trim()) return
    setSaving(true)

    if (editingId) {
      await supabase
        .from('perfiles_empleadas')
        .update({
          nombre: form.nombre.trim(),
        })
        .eq('id', editingId)
    } else {
      await supabase.from('perfiles_empleadas').insert({
        nombre: form.nombre.trim(),
        activo: true,
      })
    }


    qc.invalidateQueries({ queryKey: ['empleadas'] })
    setForm({ nombre: '' })

    setShowForm(false)
    setEditingId(null)
    setSaving(false)
  }

  const startEdit = (emp: Empleada) => {
    setForm({ id: emp.id, nombre: emp.nombre })
    setEditingId(emp.id)
    setShowForm(true)
  }


  const cancelForm = () => {
    setShowForm(false)
    setEditingId(null)
    setForm({ nombre: '' })
  }


  const toggleActivo = async (emp: Empleada) => {
    await supabase
      .from('perfiles_empleadas')
      .update({ activo: !emp.activo })
      .eq('id', emp.id)
    qc.invalidateQueries({ queryKey: ['empleadas'] })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar a este profesional? Esta acción no se puede deshacer.')) return
    await supabase.from('perfiles_empleadas').delete().eq('id', id)
    qc.invalidateQueries({ queryKey: ['empleadas'] })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Topbar */}
      <div className="page-header" style={{ padding: '24px 24px 0', marginBottom: 20 }}>
        <div className="page-header-content">
          <h1 className="page-title">Profesionales</h1>
          <p className="page-subtitle">Gestiona el personal y los especialistas del sistema</p>
        </div>
        <div className="page-header-actions">
          <button onClick={() => setShowForm(true)} className="btn-primary">
            <Plus size={14} /> Agregar profesional
          </button>
        </div>
      </div>

      <div className="page-content">
        {/* New empleada form */}
        {showForm && (
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-header">
              <span className="card-title">{editingId ? 'Editar profesional' : 'Agregar profesional'}</span>
              <button onClick={cancelForm} className="modal-close-btn"><X size={15} /></button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="form-grid-1">
                <div className="form-group">
                  <label>Nombre completo</label>
                  <input
                    autoFocus
                    required
                    value={form.nombre}
                    onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                    className="form-input"
                    placeholder="Ej: Daniela Ugalde..."
                  />
                </div>
              </div>


              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button type="button" onClick={cancelForm} className="btn-ghost">Cancelar</button>
                <button type="submit" disabled={saving} className="btn-primary">
                  <Check size={14} /> {saving ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Empleadas list */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">
              Profesionales ({empleadas.filter((e) => e.activo).length} activas)
            </span>
            <span style={{ fontSize: 11, color: 'var(--text-3)' }}>
              Disponibles en todas las sucursales
            </span>
          </div>

          {isLoading ? (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-3)' }}>Cargando...</div>
          ) : empleadas.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-3)' }}>
              No hay empleadas registradas. Agrega la primera.
            </div>
          ) : (
            empleadas.map((emp) => (
              <div key={emp.id} className="empleada-row">
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <span className="empleada-nombre">{emp.nombre}</span>
                  <span style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 600 }}>{emp.nombre.substring(0, 3).toUpperCase()}</span>
                </div>

                <span className={emp.activo ? 'badge-activa' : 'badge-inactiva'}>
                  {emp.activo ? 'Activa' : 'Inactiva'}
                </span>
                <div style={{ display: 'flex', gap: 5 }}>
                  <button onClick={() => startEdit(emp)} className="btn-secondary" style={{ padding: '4px 8px', fontSize: 11 }}>
                    Editar
                  </button>
                  <button onClick={() => toggleActivo(emp)} className="toggle-btn">
                    {emp.activo ? 'Desactivar' : 'Activar'}
                  </button>
                </div>
                <button
                  onClick={() => handleDelete(emp.id)}
                  className="btn-danger-ghost"
                  style={{ padding: '3px 8px', fontSize: 11 }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
