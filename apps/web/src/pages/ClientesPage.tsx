import { useState, useEffect } from 'react'
import { Search, UserPlus, CalendarPlus, ChevronLeft, ChevronRight } from 'lucide-react'
import { useClientes } from '../hooks/useClientes'
import FormularioCliente from '../components/Clientes/FormularioCliente'
import ClienteDetalleSlideOver from '../components/Clientes/ClienteDetalleSlideOver'
import type { Cliente } from '../types/database'

const PAGE_SIZE = 20

interface Props {
  onGoToAgenda?: (cliente: Cliente) => void
}

export default function ClientesPage({ onGoToAgenda }: Props) {
  const [query, setQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null)
  const { data: clientes = [], isLoading } = useClientes(query)

  // Pagination state — resets to page 1 when query changes
  const [page, setPage] = useState(1)
  useEffect(() => { setPage(1) }, [query])

  const totalPages = Math.ceil(clientes.length / PAGE_SIZE)
  const paginatedClientes = clientes.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const initials = (name: string) =>
    name.split(' ').slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div className="page-header" style={{ padding: '24px 24px 0' }}>
        <div className="page-header-content">
          <h1 className="page-title">Buscador de clientes</h1>
          <p className="page-subtitle">Encuentra o registra un nuevo perfil en el sistema</p>
        </div>
        <div className="page-header-actions">
          <div className="clientes-search-input-wrap" style={{ width: '280px' }}>
            <Search size={15} color="var(--text-3)" />
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre, teléfono o ID..."
              className="clientes-search-input"
            />
          </div>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            <UserPlus size={14} /> Nuevo cliente
          </button>
        </div>
      </div>

      {/* Results Table */}
      <div className="table-container">
        {isLoading && (
          <table className="data-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Nº Cliente</th>
                <th>Teléfono</th>
                <th>E-mail</th>
                <th>Sucursal</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, i) => (
                <tr key={i} style={{ pointerEvents: 'none' }}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="cliente-avatar-sm" style={{ background: 'var(--border)', animation: 'skeleton-pulse 1.5s infinite ease-in-out' }}></div>
                      <div style={{ width: 120, height: 12, background: 'var(--border)', borderRadius: 4, animation: 'skeleton-pulse 1.5s infinite ease-in-out' }}></div>
                    </div>
                  </td>
                  <td><div style={{ width: 40, height: 12, background: 'var(--border)', borderRadius: 4, animation: 'skeleton-pulse 1.5s infinite ease-in-out' }}></div></td>
                  <td><div style={{ width: 80, height: 12, background: 'var(--border)', borderRadius: 4, animation: 'skeleton-pulse 1.5s infinite ease-in-out' }}></div></td>
                  <td><div style={{ width: 140, height: 12, background: 'var(--border)', borderRadius: 4, animation: 'skeleton-pulse 1.5s infinite ease-in-out' }}></div></td>
                  <td><div style={{ width: 60, height: 12, background: 'var(--border)', borderRadius: 4, animation: 'skeleton-pulse 1.5s infinite ease-in-out' }}></div></td>
                  <td style={{ textAlign: 'right' }}><div style={{ width: 70, height: 24, background: 'var(--border)', borderRadius: 20, animation: 'skeleton-pulse 1.5s infinite ease-in-out', marginLeft: 'auto' }}></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!isLoading && query.length >= 2 && clientes.length === 0 && (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-3)' }}>
            <div style={{ marginBottom: 8 }}>No se encontraron clientes</div>
            <button onClick={() => setShowForm(true)} className="btn-secondary" style={{ marginTop: 12 }}>
              <UserPlus size={14} /> Crear nuevo
            </button>
          </div>
        )}
        {!isLoading && query.length < 2 && (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-3)' }}>
            <div>Escribe al menos 2 letras para buscar clientes</div>
          </div>
        )}
        {!isLoading && query.length >= 2 && clientes.length > 0 && (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Nº Cliente</th>
                  <th>Teléfono</th>
                  <th>E-mail</th>
                  <th>Sucursal</th>
                  <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedClientes.map((c) => (
                  <tr 
                    key={c.id} 
                    onClick={() => setSelectedCliente(c)}
                    className="clickable-row"
                  >
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="cliente-avatar-sm">{initials(c.nombre_completo)}</div>
                        <span style={{ fontWeight: 500 }}>{c.nombre_completo}</span>
                      </div>
                    </td>
                    <td>#{c.num_cliente}</td>
                    <td>{c.telefono_cel || '—'}</td>
                    <td>{c.email || '—'}</td>
                    <td>{c.sucursal?.nombre || '—'}</td>
                    <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); onGoToAgenda?.(c) }}
                          className="btn-secondary"
                          style={{ padding: '6px 10px', fontSize: 11 }}
                          title="Ir a la Agenda para buscar horario"
                        >
                          <CalendarPlus size={14} /> Agendar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

            {/* Pagination Bar */}
            {totalPages > 1 && (
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 16px', borderTop: '1px solid var(--border)',
                background: 'var(--surface-2)', fontSize: 13, color: 'var(--text-2)',
              }}>
                <span>
                  Mostrando {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, clientes.length)} de {clientes.length} clientes
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: 32, height: 32, borderRadius: 8,
                      border: '1px solid var(--border)', background: 'var(--surface)',
                      cursor: page === 1 ? 'default' : 'pointer',
                      opacity: page === 1 ? 0.4 : 1,
                      transition: 'all 0.15s',
                    }}
                  >
                    <ChevronLeft size={16} />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                    .reduce<(number | 'ellipsis')[]>((acc, p, idx, arr) => {
                      if (idx > 0 && arr[idx - 1] !== p - 1) acc.push('ellipsis')
                      acc.push(p)
                      return acc
                    }, [])
                    .map((item, idx) =>
                      item === 'ellipsis' ? (
                        <span key={`e${idx}`} style={{ padding: '0 4px', color: 'var(--text-3)' }}>…</span>
                      ) : (
                        <button
                          key={item}
                          onClick={() => setPage(item as number)}
                          style={{
                            width: 32, height: 32, borderRadius: 8,
                            border: page === item ? 'none' : '1px solid var(--border)',
                            background: page === item ? 'var(--accent)' : 'var(--surface)',
                            color: page === item ? '#fff' : 'var(--text-1)',
                            fontWeight: page === item ? 700 : 500,
                            fontSize: 13, cursor: 'pointer',
                            transition: 'all 0.15s',
                          }}
                        >
                          {item}
                        </button>
                      )
                    )
                  }

                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: 32, height: 32, borderRadius: 8,
                      border: '1px solid var(--border)', background: 'var(--surface)',
                      cursor: page === totalPages ? 'default' : 'pointer',
                      opacity: page === totalPages ? 0.4 : 1,
                      transition: 'all 0.15s',
                    }}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* New client modal */}
      {showForm && (
        <FormularioCliente
          onCreated={() => setShowForm(false)}
          onClose={() => setShowForm(false)}
        />
      )}

      {/* Detail slide-over */}
      {selectedCliente && (
        <ClienteDetalleSlideOver
          cliente={selectedCliente}
          onClose={() => setSelectedCliente(null)}
        />
      )}

      <style>{`
        .clickable-row {
          cursor: pointer;
          transition: background-color 0.1s ease;
        }
        .clickable-row:hover {
          background-color: var(--bg);
        }
      `}</style>
    </div>
  )
}
