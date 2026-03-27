import { type LucideIcon } from 'lucide-react'

interface Props {
  title: string
  value: string | number
  subtitle?: string
  Icon: LucideIcon
}

export default function KPICard({ title, value, subtitle, Icon }: Props) {
  return (
    <div className="card" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '130px', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <h3 style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>
          {title}
        </h3>
        <div style={{ padding: '8px', borderRadius: '10px', background: 'var(--accent-light)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={16} strokeWidth={2.5} />
        </div>
      </div>

      <div style={{ marginTop: 'auto' }}>
        <p style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-1)', margin: '0 0 2px 0', letterSpacing: '-1px', lineHeight: 1 }}>
          {value}
        </p>
        {subtitle && (
          <p style={{ fontSize: '10px', fontWeight: 500, color: 'var(--text-3)', margin: 0 }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  )
}