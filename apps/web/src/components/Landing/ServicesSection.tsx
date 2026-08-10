import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { FAMILIES_DATA, type FamilyData } from '../../data/servicesData'

const LANDING_ORDER = [
  'esmaltado-permanente',
  'unas-esculpidas',
  'manicura-spa',
  'cuidado-facial',
  'masajes-terapeuticos',
  'pedicura-avanzada',
  'eyes-brows',
  'depilacion-laser',
  'nail-art-diseno',
]

const LANDING_SERVICES = LANDING_ORDER.map(slug =>
  FAMILIES_DATA.find(family => family.slug === slug)
).filter((family): family is FamilyData => Boolean(family))

function ServiceCard({ family, index }: { family: FamilyData; index: number }) {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '80px 0px', threshold: 0.08 }
    )

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <Link
      ref={ref}
      to={`/servicios/${family.slug}`}
      className={`service-showcase-card${visible ? ' is-visible' : ''}`}
      style={{ '--card-delay': `${(index % 3) * 70}ms` } as CSSProperties}
      aria-label={`Descubre ${family.name}`}
    >
      <img
        className="service-showcase-image"
        src={family.image}
        alt=""
        loading="lazy"
        decoding="async"
      />
      <div className="service-showcase-shade" />

      <div className="service-showcase-topline">
        <span>{String(index + 1).padStart(2, '0')}</span>
        <span>MUYMUY</span>
      </div>

      <div className="service-showcase-copy">
        <h3>{family.name}</h3>
        <p>{family.description}</p>
        <span className="service-showcase-link">
          Explorar servicio <ArrowUpRight size={18} strokeWidth={1.8} />
        </span>
      </div>
    </Link>
  )
}

export default function ServicesSection() {
  return (
    <section id="services" className="services-showcase">
      <div className="services-showcase-heading">
        <div>
          <span className="services-showcase-kicker">Belleza a tu manera</span>
          <h2>Nuestros servicios</h2>
        </div>
        <div className="services-showcase-intro">
          <p>
            Tratamientos diseñados para cuidarte, expresarte y hacer de cada visita
            una experiencia extraordinaria.
          </p>
          <Link to="/reservar">
            Reserva tu cita <ArrowUpRight size={18} />
          </Link>
        </div>
      </div>

      <div className="services-showcase-grid">
        {LANDING_SERVICES.map((family, index) => (
          <ServiceCard key={family.slug} family={family} index={index} />
        ))}
      </div>

      <style>{`
        .services-showcase {
          background: #f3f1ec;
          padding: clamp(72px, 8vw, 136px) clamp(16px, 3vw, 56px);
          overflow: hidden;
        }

        .services-showcase-heading {
          width: 100%;
          max-width: 1800px;
          margin: 0 auto clamp(40px, 5vw, 80px);
          display: grid;
          grid-template-columns: minmax(0, 1.65fr) minmax(280px, 0.55fr);
          gap: 48px;
          align-items: end;
        }

        .services-showcase-kicker {
          display: inline-block;
          margin-bottom: 18px;
          color: #637436;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }

        .services-showcase-heading h2 {
          margin: 0;
          color: #171714;
          font-size: clamp(50px, 7.4vw, 128px) !important;
          line-height: 0.82;
          letter-spacing: -0.065em !important;
        }

        .services-showcase-intro {
          padding-bottom: 4px;
        }

        .services-showcase-intro p {
          margin: 0 0 24px;
          color: #5b5a54;
          font-size: clamp(15px, 1.15vw, 18px);
          line-height: 1.65;
        }

        .services-showcase-intro > a {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          color: #171714;
          font-size: 14px;
          font-weight: 700;
          text-decoration: none;
          border-bottom: 1px solid #171714;
          padding-bottom: 5px;
        }

        .services-showcase-grid {
          width: 100%;
          max-width: 1800px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: clamp(14px, 1.5vw, 28px);
        }

        .service-showcase-card {
          --card-delay: 0ms;
          position: relative;
          display: block;
          min-height: clamp(420px, 38vw, 620px);
          overflow: hidden;
          border-radius: clamp(22px, 2vw, 36px);
          background: #25251f;
          color: #fff;
          text-decoration: none;
          isolation: isolate;
          opacity: 0;
          transform: translateY(24px);
          transition:
            opacity 650ms ease var(--card-delay),
            transform 750ms cubic-bezier(0.2, 0.75, 0.25, 1) var(--card-delay),
            box-shadow 350ms ease;
        }

        .service-showcase-card.is-visible {
          opacity: 1;
          transform: translateY(0);
        }

        .service-showcase-card:hover {
          box-shadow: 0 24px 70px rgba(23, 23, 20, 0.2);
        }

        .service-showcase-image {
          position: absolute;
          inset: 0;
          z-index: -3;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 800ms cubic-bezier(0.2, 0.75, 0.25, 1);
        }

        .service-showcase-card:hover .service-showcase-image {
          transform: scale(1.045);
        }

        .service-showcase-shade {
          position: absolute;
          inset: 0;
          z-index: -2;
          background:
            linear-gradient(180deg, rgba(10, 10, 8, 0.36) 0%, transparent 35%),
            linear-gradient(0deg, rgba(10, 10, 8, 0.92) 0%, rgba(10, 10, 8, 0.12) 72%);
        }

        .service-showcase-topline {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          display: flex;
          justify-content: space-between;
          padding: clamp(22px, 2vw, 32px);
          color: rgba(255, 255, 255, 0.78);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.18em;
        }

        .service-showcase-copy {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          padding: clamp(24px, 2.4vw, 42px);
        }

        .service-showcase-copy h3 {
          max-width: 94%;
          margin: 0 0 16px;
          color: #fff;
          font-size: clamp(30px, 3vw, 54px) !important;
          line-height: 0.94;
          letter-spacing: -0.045em !important;
        }

        .service-showcase-copy p {
          display: -webkit-box;
          max-width: 500px;
          margin: 0 0 24px;
          overflow: hidden;
          color: rgba(255, 255, 255, 0.78);
          font-size: clamp(13px, 1vw, 16px);
          line-height: 1.55;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 3;
        }

        .service-showcase-link {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          color: #fff;
          font-size: 13px;
          font-weight: 700;
        }

        .service-showcase-link svg {
          transition: transform 250ms ease;
        }

        .service-showcase-card:hover .service-showcase-link svg {
          transform: translate(3px, -3px);
        }

        @media (max-width: 1020px) {
          .services-showcase-heading {
            grid-template-columns: 1fr;
            gap: 26px;
          }

          .services-showcase-intro {
            max-width: 600px;
          }

          .services-showcase-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .service-showcase-card {
            min-height: 520px;
          }
        }

        @media (max-width: 680px) {
          .services-showcase {
            padding-left: 14px;
            padding-right: 14px;
          }

          .services-showcase-heading {
            padding: 0 6px;
          }

          .services-showcase-heading h2 {
            font-size: clamp(46px, 15vw, 70px) !important;
            line-height: 0.88;
          }

          .services-showcase-grid {
            grid-template-columns: 1fr;
            gap: 14px;
          }

          .service-showcase-card {
            min-height: min(124vw, 520px);
            opacity: 1;
            transform: none;
            transition: box-shadow 350ms ease;
          }

          .service-showcase-copy h3 {
            font-size: clamp(34px, 11vw, 48px) !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .service-showcase-card,
          .service-showcase-image,
          .service-showcase-link svg {
            opacity: 1;
            transform: none;
            transition: none;
          }
        }
      `}</style>
    </section>
  )
}
