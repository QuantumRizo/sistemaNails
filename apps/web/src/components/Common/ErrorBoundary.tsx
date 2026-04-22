import { Component, type ReactNode } from 'react'
import { RefreshCw, AlertTriangle } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg, #f5f5f7)',
          fontFamily: '"Inter", -apple-system, sans-serif',
        }}>
          <div style={{
            maxWidth: 420,
            textAlign: 'center',
            padding: '48px 32px',
            background: '#fff',
            borderRadius: 20,
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: '#fff3cd', color: '#d4a017',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 24px',
            }}>
              <AlertTriangle size={36} />
            </div>

            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1d1d1f', marginBottom: 8 }}>
              Algo salió mal
            </h1>
            <p style={{ fontSize: 14, color: '#86868b', lineHeight: 1.6, marginBottom: 32 }}>
              Ha ocurrido un error inesperado. No te preocupes, tus datos están seguros. 
              Intenta recargar la página.
            </p>

            <button
              onClick={this.handleReload}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: '#1d1d1f', color: '#fff',
                border: 'none', borderRadius: 12,
                padding: '14px 28px', fontSize: 14, fontWeight: 600,
                cursor: 'pointer', transition: 'opacity 0.2s',
              }}
              onMouseOver={(e) => (e.currentTarget.style.opacity = '0.85')}
              onMouseOut={(e) => (e.currentTarget.style.opacity = '1')}
            >
              <RefreshCw size={16} />
              Recargar página
            </button>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details style={{ marginTop: 24, textAlign: 'left' }}>
                <summary style={{ fontSize: 11, color: '#86868b', cursor: 'pointer', marginBottom: 8 }}>
                  Detalles técnicos
                </summary>
                <pre style={{
                  fontSize: 10, background: '#f5f5f7', padding: 12, borderRadius: 8,
                  overflow: 'auto', maxHeight: 120, color: '#d32f2f',
                }}>
                  {this.state.error.message}
                  {'\n'}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
