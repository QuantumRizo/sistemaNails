import { useState } from 'react'
import { Megaphone, Target, BarChart, Plus, ExternalLink, Activity, Users, DollarSign } from 'lucide-react'

export default function MarketingPage() {
  const [activeTab, setActiveTab] = useState<'integrations' | 'campaigns'>('integrations')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', background: 'var(--bg)' }}>
      {/* Header */}
      <div className="page-header" style={{ padding: '24px 24px 0', marginBottom: 24, flexShrink: 0 }}>
        <div className="page-header-content">
          <h1 className="page-title">Marketing</h1>
          <p className="page-subtitle">
            Gestiona tus campañas publicitarias y analiza el retorno de inversión.
          </p>
        </div>
        
        <div className="page-header-actions">
          {/* Tabs */}
          <div style={{ 
            display: 'flex', 
            background: 'var(--surface)', 
            padding: 4, 
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)'
          }}>
            <button
              onClick={() => setActiveTab('integrations')}
              style={{
                padding: '6px 16px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: activeTab === 'integrations' ? 'var(--accent-light)' : 'transparent',
                color: activeTab === 'integrations' ? 'var(--accent)' : 'var(--text-2)',
                fontWeight: activeTab === 'integrations' ? 600 : 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontSize: 13
              }}
            >
              Integraciones
            </button>
            <button
              onClick={() => setActiveTab('campaigns')}
              style={{
                padding: '6px 16px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: activeTab === 'campaigns' ? 'var(--accent-light)' : 'transparent',
                color: activeTab === 'campaigns' ? 'var(--accent)' : 'var(--text-2)',
                fontWeight: activeTab === 'campaigns' ? 600 : 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontSize: 13
              }}
            >
              Mis Campañas
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px 24px' }}>
        
        {activeTab === 'integrations' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
            
            {/* Meta Ads Box */}
            <div style={{ 
              background: 'var(--surface)', 
              borderRadius: 'var(--radius-lg)', 
              border: '1px solid var(--border)',
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                <div style={{ 
                  width: 48, height: 48, borderRadius: 12, 
                  background: '#1877F2', color: 'white', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center' 
                }}>
                  <Target size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: 'var(--text-1)' }}>Meta Ads</h3>
                  <p style={{ fontSize: 12, color: 'var(--text-3)', margin: '2px 0 0 0' }}>Facebook & Instagram</p>
                </div>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5, flex: 1 }}>
                Conecta tu cuenta publicitaria de Meta para sincronizar los prospectos generados o visualizar el gasto directamente en tu dashboard.
              </p>
              
              <div style={{ marginTop: 24, padding: '12px', background: 'var(--surface-2)', borderRadius: 'var(--radius-md)', fontSize: 12, color: 'var(--text-2)' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-1)' }}>Estado:</span> Desconectado
              </div>
              
              <button className="btn-secondary" style={{ marginTop: 16, width: '100%', justifyContent: 'center', height: 38 }}>
                Conectar con Meta
                <ExternalLink size={14} style={{ marginLeft: 4 }} />
              </button>
            </div>

            {/* Google Ads Box */}
            <div style={{ 
              background: 'var(--surface)', 
              borderRadius: 'var(--radius-lg)', 
              border: '1px solid var(--border)',
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                <div style={{ 
                  width: 48, height: 48, borderRadius: 12, 
                  background: '#EA4335', color: 'white', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center' 
                }}>
                  <BarChart size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: 'var(--text-1)' }}>Google Ads</h3>
                  <p style={{ fontSize: 12, color: 'var(--text-3)', margin: '2px 0 0 0' }}>Búsqueda & Display</p>
                </div>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5, flex: 1 }}>
                Analiza el rendimiento de tus campañas de búsqueda y vincula el retorno de inversión (ROI) directamente con tus clientes registrados.
              </p>
              
              <div style={{ marginTop: 24, padding: '12px', background: 'var(--surface-2)', borderRadius: 'var(--radius-md)', fontSize: 12, color: 'var(--text-2)' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-1)' }}>Estado:</span> Desconectado
              </div>
              
              <button className="btn-secondary" style={{ marginTop: 16, width: '100%', justifyContent: 'center', height: 38 }}>
                Conectar con Google
                <ExternalLink size={14} style={{ marginLeft: 4 }} />
              </button>
            </div>

          </div>
        )}

        {activeTab === 'campaigns' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-1)', margin: 0 }}>Registro de Campañas Activas</h2>
              <button className="btn-primary" style={{ height: 34 }}>
                <Plus size={16} /> Nueva Campaña
              </button>
            </div>

            {/* Empty State for Campaigns */}
            <div style={{ 
              background: 'var(--surface)', 
              borderRadius: 'var(--radius-lg)', 
              border: '1px dashed var(--border-2)',
              padding: '60px 20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center'
            }}>
              <div style={{ 
                width: 64, height: 64, borderRadius: '50%', background: 'var(--surface-2)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)',
                marginBottom: 16
              }}>
                <Megaphone size={32} />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-1)', margin: '0 0 8px 0' }}>No tienes campañas registradas</h3>
              <p style={{ fontSize: 13, color: 'var(--text-2)', maxWidth: 400, margin: 0, lineHeight: 1.5 }}>
                Registra tus campañas manualmente para llevar un registro del costo de adquisición o vincula una integración para que se actualicen automáticamente.
              </p>
            </div>

            {/* Dummy Mockup data to show user potential */}
            <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-3)', margin: '32px 0 16px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Ejemplo de Visualización
            </h2>
            <div style={{ 
              background: 'var(--surface)', 
              borderRadius: 'var(--radius-md)', 
              border: '1px solid var(--border)',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 20,
              opacity: 0.6,
              filter: 'grayscale(1)'
            }}>
              <div style={{ width: 40, height: 40, borderRadius: 8, background: '#1877F2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
                <Target size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)' }}>Campaña Verano 2026</div>
                <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Meta Ads • Activa</div>
              </div>
              
              <div style={{ display: 'flex', gap: 32 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: 4 }}><DollarSign size={12}/> Inversión</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }}>$1,250.00</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: 4 }}><Users size={12}/> Prospectos</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }}>42</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: 4 }}><Activity size={12}/> Costo/Lead</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--success)' }}>$29.76</div>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  )
}
