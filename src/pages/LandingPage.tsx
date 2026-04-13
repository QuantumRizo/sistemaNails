import { 
  MapPin, 
  User, 
  ShieldCheck, 
  Heart 
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const BRANCHES = [
  {
    nombre: "Homero",
    direccion: "Av. Homero 1629, Polanco I Secc, Miguel Hidalgo, 11510 CDMX",
    telefono: "55 2703 2830"
  },
  {
    nombre: "Newton",
    direccion: "Av. Isaac Newton 215, Polanco V Secc, Miguel Hidalgo, 11560 CDMX",
    telefono: "56 1901 1318"
  },
  {
    nombre: "Euler",
    direccion: "Euler 152, Polanco V Secc, Miguel Hidalgo, 11550 CDMX",
    telefono: "55 4939 5929"
  },
  {
    nombre: "Campos Eliseos",
    direccion: "Campos Elíseos 169, Polanco V Secc, Miguel Hidalgo, 11580 CDMX",
    telefono: "55 4453 3065"
  }
]

const CATEGORIES = [
  {
    title: "Esmaltado Permanente",
    image: "/category_manicura_luxury_1776098533636.png",
    description: "La novedosa técnica que ha revolucionado el mundo de las uñas: el único esmaltado permanente de larga duración y 20Free.",
    linkText: "Descubre más"
  },
  {
    title: "Uñas Esculpidas",
    image: "/category_esculpidas_luxury_1776098550318.png",
    description: "Uñas esculpidas con las mejores técnicas del mercado: uñas de gel, uñas en acrílico... ¡Ponte en buenas manos! ¡No esperes más!",
    linkText: "Descubre más"
  },
  {
    title: "Manicura & Spa",
    image: "/muymuy_hero_beauty_1776097840515.png",
    description: "¡Tus manos hablan de ti! Cuídalas con nuestros servicios de manicura: limar y esmaltar, manicura básica, spa, etc.",
    linkText: "Descubre más"
  },
  {
    title: "Cuidado Facial",
    image: "/category_facial_luxury_1776098568008.png",
    description: "Protocolos de higiene profunda y tratamientos personalizados para una piel luminosa, sana y revitalizada.",
    linkText: "Descubre más"
  },
  {
    title: "Masajes Terapéuticos",
    image: "/category_massage_luxury_2_1776098590661.png",
    description: "Un refugio para el estrés. Sesiones de relajación profunda y reflexología para restaurar tu equilibrio corporal y mental.",
    linkText: "Descubre más"
  },
  {
    title: "Pedicura Avanzada",
    image: "/category_pedicura_luxury_2_1776098606871.png",
    description: "Salud y estética integral para tus pies. Desde relajantes sesiones spa hasta pedicuras técnicas especializadas.",
    linkText: "Descubre más"
  },
  {
    title: "Eyes & Brows",
    image: "/category_eyes_luxury_2_1776098621485.png",
    description: "Realzamos tu mirada. Diseños de cejas y elevación de pestañas que enmarcan tu rostro con elegancia y naturalidad.",
    linkText: "Descubre más"
  },
  {
    title: "Depilación Premium",
    image: "/category_depilacion_luxury_3_1776098651269.png",
    description: "Suavidad duradera con técnicas delicadas y efectivas. Una experiencia de depilación profesional en un ambiente de confort.",
    linkText: "Descubre más"
  },
  {
    title: "Nail Art & Diseño",
    image: "/category_art_nails_luxury_3_1776098666778.png",
    description: "El toque artístico final. Decoraciones exclusivas y diseños personalizados para que tus uñas sean una obra de arte.",
    linkText: "Descubre más"
  }
]

const InstagramIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" style={{ stopColor: '#f09433' }} />
        <stop offset="25%" style={{ stopColor: '#e6683c' }} />
        <stop offset="50%" style={{ stopColor: '#dc2743' }} />
        <stop offset="75%" style={{ stopColor: '#cc2366' }} />
        <stop offset="100%" style={{ stopColor: '#bc1888' }} />
      </linearGradient>
    </defs>
    <path d="M12 2C9.27 2 8.93 2.01 7.86 2.06C6.8 2.11 6.07 2.28 5.45 2.52C4.81 2.77 4.27 3.1 3.73 3.64C3.19 4.18 2.86 4.72 2.61 5.36C2.37 5.98 2.2 6.71 2.15 7.77C2.1 8.84 2.1 9.18 2.1 11.91C2.1 14.64 2.1 14.98 2.15 16.05C2.2 17.11 2.37 17.84 2.61 18.46C2.86 19.1 3.19 19.64 3.73 20.18C4.27 20.72 4.81 21.05 5.45 21.3C6.07 21.54 6.8 21.71 7.86 21.76C8.93 21.81 9.27 21.82 12 21.82C14.73 21.82 15.07 21.81 16.14 21.76C17.2 21.71 17.93 21.54 18.55 21.3C19.19 21.05 19.73 20.72 20.27 20.18C20.81 19.64 21.14 19.1 21.39 18.46C21.63 17.84 21.8 17.11 21.85 16.05C21.9 14.98 21.9 14.64 21.9 11.91C21.9 9.18 21.9 8.84 21.85 7.77C21.8 6.71 21.63 5.98 21.39 5.36C21.14 4.72 20.81 4.18 20.27 3.64C19.73 3.1 19.19 2.77 18.55 2.52C17.93 2.28 17.2 2.11 16.14 2.06C15.07 2.01 14.73 2 12 2V2ZM12 4.16C14.68 4.16 15 4.17 16.06 4.22C17.04 4.26 17.57 4.43 17.93 4.57C18.41 4.75 18.74 4.97 19.1 5.33C19.46 5.69 19.68 6.02 19.86 6.5C20 6.86 20.17 7.39 20.21 8.37C20.26 9.43 20.27 9.75 20.27 12.43C20.27 15.11 20.26 15.43 20.21 16.49C20.17 17.47 20 18 19.86 18.36C19.68 18.84 19.46 19.17 19.1 19.53C18.74 19.89 18.41 20.11 17.93 20.29C17.57 20.43 17.04 20.6 16.06 20.64C15 20.69 14.68 20.7 12 20.7C9.32 20.7 9 20.69 7.94 20.64C6.96 20.6 6.43 20.43 6.07 20.29C5.59 20.11 5.26 19.89 4.9 19.53C4.54 19.17 4.32 18.84 4.14 18.36C4 18 3.83 17.47 3.79 16.49C3.74 15.43 3.73 15.11 3.73 12.43C3.73 9.75 3.74 9.43 3.79 8.37C3.83 7.39 4 6.86 4.14 6.5C4.32 5.02 4.54 5.69 4.9 5.33C5.26 4.97 5.59 4.75 6.07 4.57C6.43 4.43 6.96 4.26 7.94 4.22C9 4.17 9.32 4.16 12 4.16V4.16ZM12 6.83C9.13 6.83 6.83 9.13 6.83 12C6.83 14.87 9.13 17.17 12 17.17C14.87 17.17 17.17 14.87 17.17 12C17.17 9.13 14.87 6.83 12 6.83ZM12 15.39C10.13 15.39 8.61 13.87 8.61 12C8.61 10.13 10.13 8.61 12 8.61C13.87 8.61 15.39 10.13 15.39 12C15.39 13.87 13.87 15.39 12 15.39ZM18.57 6.64C18.57 7.31 18.03 7.85 17.36 7.85C16.69 7.85 16.15 7.31 16.15 6.64C16.15 5.97 16.69 5.43 17.36 5.43C18.03 5.43 18.57 5.97 18.57 6.64Z" fill="url(#ig-grad)"/>
  </svg>
)

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    const handleResize = () => setIsMobile(window.innerWidth < 900)
    
    handleScroll()
    handleResize()
    
    window.addEventListener('scroll', handleScroll)
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <div style={{ background: '#fff', color: '#1d1d1f', fontFamily: '"Inter", -apple-system, sans-serif' }}>
      
      {/* ─── NAVIGATION ────────────────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        background: isScrolled ? 'rgba(255,255,255,0.8)' : (isMobile ? '#fff' : 'transparent'),
        backdropFilter: isScrolled ? 'blur(20px)' : 'none',
        height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '0 24px', transition: 'all 0.4s ease',
        borderBottom: (isScrolled || isMobile) ? '1px solid #f2f2f2' : 'none'
      }}>
        <div style={{ maxWidth: '1100px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src="/logoVertical.png" alt="MUYMUY" style={{ height: '32px' }} />
            <span style={{ fontWeight: 700, fontSize: '18px', letterSpacing: '-0.5px' }}>MUYMUY</span>
          </div>
          <div style={{ display: 'flex', gap: 30, fontSize: '14px', fontWeight: 500 }} className="desktop-only">
            <a href="#welcome" style={{ textDecoration: 'none', color: 'inherit' }}>Estudio</a>
            <a href="#services" style={{ textDecoration: 'none', color: 'inherit' }}>Servicios</a>
            <a href="#contact" style={{ textDecoration: 'none', color: 'inherit' }}>Contacto</a>
          </div>
          <Link to="/reservar" style={{
            background: '#1d1d1f', color: '#fff', border: 'none',
            padding: '8px 18px', borderRadius: '20px', fontSize: '13px', fontWeight: 600,
            cursor: 'pointer', textDecoration: 'none'
          }}>
            Agendar Online
          </Link>
        </div>
      </nav>

      {/* ─── HERO SECTION SPLIT ─────────────────────────────────── */}
      <section id="welcome" style={{
        display: 'flex',
        flexDirection: isMobile ? 'column-reverse' : 'row',
        minHeight: '65vh',
        width: '100%',
        overflow: 'hidden'
      }}>
        {/* Panel Izquierdo: Contenido */}
        <div style={{
          flex: 1,
          background: '#fff',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: isMobile ? 'center' : 'flex-start',
          padding: isMobile ? '60px 24px' : '10%',
          textAlign: isMobile ? 'center' : 'left'
        }}>
          <img 
            src="/logo.jpeg" 
            alt="MUYMUY Logo" 
            style={{ 
              width: '140px', 
              height: 'auto', 
              marginBottom: '48px' 
            }} 
          />
          
          <h1 style={{ 
            fontSize: 'clamp(42px, 7vw, 76px)', 
            fontWeight: 800, 
            letterSpacing: '-2px', 
            lineHeight: 0.95, 
            margin: '0 0 24px', 
            color: '#1d1d1f',
            textTransform: 'uppercase'
          }}>
            Atrevidas,<br />
            Únicas,<br />
            <span style={{ color: 'var(--primary)' }}>Modernas.</span>
          </h1>
          
          <p style={{ 
            fontSize: 'clamp(17px, 2.5vw, 20px)', 
            fontWeight: 400, 
            color: '#6e6e73',
            lineHeight: 1.5, 
            marginBottom: '48px', 
            maxWidth: '440px'
          }}>
            Diseños de uñas vanguardistas y manicuras de lujo diseñadas para la mujer que se atreve a brillar.
          </p>
          
          <div style={{ display: 'flex', gap: 16, flexDirection: isMobile ? 'column' : 'row', width: isMobile ? '100%' : 'auto' }}>
            <Link to="/reservar" style={{
              background: '#1d1d1f', color: '#fff', border: 'none',
              padding: '18px 36px', borderRadius: '40px', fontSize: '17px', fontWeight: 600,
              cursor: 'pointer', minWidth: '200px', textDecoration: 'none', textAlign: 'center'
            }}>
              Reserva tu cita
            </Link>
            <a href="#services" style={{
              background: '#fff', color: '#1d1d1f', border: '2px solid #1d1d1f',
              padding: '18px 36px', borderRadius: '40px', fontSize: '17px', fontWeight: 600,
              cursor: 'pointer', minWidth: '200px', textDecoration: 'none', textAlign: 'center'
            }}>
              Ver Servicios
            </a>
          </div>
        </div>

        {/* Panel Derecho: Imagen */}
        <div style={{
          flex: 1,
          backgroundImage: 'var(--hero-image)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: isMobile ? '45vh' : 'auto'
        }} />
      </section>

      {/* ─── PHILOSOPHY ────────────────────────────────────────── */}
      <section style={{ padding: '120px 24px', textAlign: 'center', background: '#fff' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 24 }}>
            MUYMUY Experience
          </h2>
          <p style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 700, lineHeight: 1.1, color: '#1d1d1f', marginBottom: 80, letterSpacing: '-1.5px' }}>
            Excelencia en cada trazo. <br/>
            Cuidado en cada detalle.
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 60 }}>
            <div>
              <div style={{ background: '#f5f5f7', width: 56, height: 56, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <User size={28} />
              </div>
              <h3 style={{ fontSize: '21px', fontWeight: 600, marginBottom: 12 }}>Personalización</h3>
              <p style={{ fontSize: '16px', color: '#6e6e73', lineHeight: 1.6 }}>Entendemos que cada persona es única. Adaptamos cada técnica a tus necesidades específicas.</p>
            </div>
            <div>
              <div style={{ background: '#f5f5f7', width: 56, height: 56, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <ShieldCheck size={28} />
              </div>
              <h3 style={{ fontSize: '21px', fontWeight: 600, marginBottom: 12 }}>Seguridad</h3>
              <p style={{ fontSize: '16px', color: '#6e6e73', lineHeight: 1.6 }}>Protocolos de esterilización de grado médico y productos premium certificados.</p>
            </div>
            <div>
              <div style={{ background: '#f5f5f7', width: 56, height: 56, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <Heart size={28} />
              </div>
              <h3 style={{ fontSize: '21px', fontWeight: 600, marginBottom: 12 }}>Bienestar</h3>
              <p style={{ fontSize: '16px', color: '#6e6e73', lineHeight: 1.6 }}>Más que un servicio, es un momento de pausa y reconexión en un ambiente de paz.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SERVICES CATEGORIES ────────────────────────────────── */}
      <section id="services" style={{ padding: '120px 24px', background: '#fff' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 80 }}>
            <h2 style={{ fontSize: 'clamp(32px, 6vw, 56px)', fontWeight: 800, letterSpacing: '-2px', marginBottom: 20 }}>
              Nuestro Menú de Servicios
            </h2>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
            columnGap: '40px',
            rowGap: '60px'
          }}>
            {CATEGORIES.map((cat, idx) => (
              <div key={idx} style={{ 
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                cursor: 'default'
              }}>
                <div style={{ 
                  width: '100%', 
                  aspectRatio: '16/10', 
                  borderRadius: '12px', 
                  overflow: 'hidden',
                  marginBottom: '24px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                }}>
                  <img 
                    src={cat.image} 
                    alt={cat.title} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s ease' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  />
                </div>
                
                <h3 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '12px', color: '#000' }}>
                  {cat.title}
                </h3>
                
                <p style={{ 
                  fontSize: '15px', 
                  color: '#1d1d1f', 
                  lineHeight: '1.5', 
                  marginBottom: '16px', 
                  maxWidth: '300px' 
                }}>
                  {cat.description}
                </p>

                <a href="#" style={{ 
                  fontSize: '15px', 
                  fontStyle: 'italic', 
                  color: '#1d1d1f', 
                  textDecoration: 'none',
                  borderBottom: '1px solid #1d1d1f',
                  paddingBottom: '2px'
                }}>
                  {cat.linkText}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CONTACT & BRANCHES ───────────────────────────────────── */}
      <section id="contact" style={{ padding: '100px 24px', background: '#1d1d1f', color: '#fff' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 80, marginBottom: 80 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
                <img src="/logoVertical.png" alt="MUYMUY" style={{ height: '44px', filter: 'invert(1)' }} />
                <span style={{ fontWeight: 700, fontSize: '26px', letterSpacing: '-1px' }}>MUYMUY</span>
              </div>
              <p style={{ fontSize: '17px', color: '#86868b', lineHeight: 1.6, marginBottom: 40, maxWidth: '400px' }}>
                Redefiniendo los estándares de belleza y bienestar. Visítanos en cualquiera de nuestras sucursales en Polanco.
              </p>
              <div style={{ display: 'flex', gap: 24, marginBottom: 32 }}>
                <a href="https://instagram.com" style={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(255,255,255,0.05)', borderRadius: '12px', width: '48px', height: '48px'
                }}>
                  <InstagramIcon size={30} />
                </a>
              </div>

            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 40 }}>
              {BRANCHES.map((branch, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <MapPin size={18} color="var(--primary)" />
                    <h4 style={{ fontSize: '18px', fontWeight: 700 }}>{branch.nombre}</h4>
                  </div>
                  <p style={{ fontSize: '14px', color: '#86868b', lineHeight: 1.5, minHeight: '44px' }}>
                    {branch.direccion}
                  </p>
                  <a href={`tel:${branch.telefono.replace(/\s/g, '')}`} style={{ 
                    fontSize: '14px', color: '#fff', textDecoration: 'none', 
                    display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600
                  }}>
                    {branch.telefono}
                  </a>
                </div>
              ))}
            </div>
          </div>
          
          <div style={{ 
            padding: '40px 0 0',
            borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', 
            fontSize: '13px', color: '#86868b'
          }}>
            © 2026 MUYMUY Beauty Studio. Todos los derechos reservados.
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 768px) {
          .desktop-only { display: none; }
        }
        * { scroll-behavior: smooth; }
      `}</style>
    </div>
  )
}
