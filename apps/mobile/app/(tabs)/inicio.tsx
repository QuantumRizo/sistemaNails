import { useEffect, useState } from 'react'
import {
  View, Text, StyleSheet, ScrollView,
  ActivityIndicator, TouchableOpacity, Image
} from 'react-native'
import { useRouter } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import { supabase } from '../../lib/supabase'

const SERVICIOS = [
  { title: 'Esmaltado Permanente', desc: 'Larga duración, libre de químicos agresivos. El favorito de nuestras clientas.' },
  { title: 'Unas Esculpidas',      desc: 'Gel o acrílico con las mejores tecnicas del mercado.' },
  { title: 'Manicura & Spa',       desc: 'Tus manos hablan de ti. Cuídalas con nosotros.' },
  { title: 'Cuidado Facial',       desc: 'Higiene profunda y tratamientos para piel luminosa.' },
  { title: 'Masajes Terapeuticos', desc: 'Relajacion profunda y reflexología para tu equilibrio.' },
  { title: 'Pedicura Avanzada',    desc: 'Salud y estetica integral para tus pies.' },
  { title: 'Eyes & Brows',         desc: 'Disenos de cejas y elevacion de pestanas que enmarcan tu rostro.' },
  { title: 'Depilacion Premium',   desc: 'Suavidad duradera con tecnicas delicadas y efectivas.' },
  { title: 'Nail Art & Diseno',    desc: 'Decoraciones exclusivas para que tus unas sean una obra de arte.' },
]

const ACCENT = '#88B04B'

export default function InicioScreen() {
  const router = useRouter()
  const [nombre, setNombre] = useState<string | null>(null)
  const [clienteId, setClienteId] = useState<string | null>(null)
  const [citas, setCitas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const id = await SecureStore.getItemAsync('cliente_id')
      const nom = await SecureStore.getItemAsync('cliente_nombre')
      setClienteId(id)
      setNombre(nom ? nom.split(' ')[0] : null)

      if (id) {
        const hoy = new Date().toISOString().split('T')[0]
        const { data } = await supabase
          .from('citas')
          .select('*, sucursal:sucursales(nombre), servicios:cita_servicios(servicio:servicios(nombre))')
          .eq('cliente_id', id)
          .gte('fecha', hoy)
          .eq('estado', 'Programada')
          .order('fecha', { ascending: true })
          .limit(5)
        setCitas((data as any[]) ?? [])
      }
      setLoading(false)
    }
    load()
  }, [])

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* Logo / Header */}
      <View style={styles.logoRow}>
        <Text style={styles.logoText}>MUYMUY</Text>
        <Text style={styles.logoSub}>Beauty Studio · Polanco</Text>
      </View>

      {/* Saludo personalizado si esta identificada */}
      {nombre && (
        <View style={styles.greetingBanner}>
          <Text style={styles.greetingText}>Bienvenida, {nombre}</Text>
        </View>
      )}

      {/* CTA Reservar */}
      <TouchableOpacity
        style={styles.ctaCard}
        onPress={() => router.push('/(tabs)/reservar')}
        activeOpacity={0.85}
      >
        <Text style={styles.ctaTitle}>Agenda tu cita</Text>
        <Text style={styles.ctaSub}>Elige sucursal, servicio y horario</Text>
        <View style={styles.ctaArrow}>
          <Text style={styles.ctaArrowText}>→</Text>
        </View>
      </TouchableOpacity>

      {/* Login card si no hay sesion */}
      {!clienteId && !loading && (
        <TouchableOpacity
          style={styles.loginCard}
          onPress={() => router.push('/(auth)/identificacion')}
          activeOpacity={0.85}
        >
          <Text style={styles.loginTitle}>Identificarte</Text>
          <Text style={styles.loginSub}>Agrega tu telefono para ver y seguir tus citas</Text>
        </TouchableOpacity>
      )}

      {/* Proximas citas */}
      {clienteId && (
        <>
          <Text style={styles.sectionTitle}>Tus proximas citas</Text>
          {loading ? (
            <ActivityIndicator color={ACCENT} style={{ marginBottom: 32 }} />
          ) : citas.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No tienes citas proximas.</Text>
              <Text style={styles.emptyHint}>Agenda una ahora.</Text>
            </View>
          ) : (
            citas.map((cita) => (
              <View key={cita.id} style={styles.citaCard}>
                <View style={styles.citaDateBadge}>
                  <Text style={styles.citaDay}>{new Date(cita.fecha + 'T12:00:00').getDate()}</Text>
                  <Text style={styles.citaMes}>
                    {new Date(cita.fecha + 'T12:00:00').toLocaleString('es-MX', { month: 'short' }).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.citaInfo}>
                  <Text style={styles.citaSucursal}>{cita.sucursal?.nombre ?? 'MUYMUY'}</Text>
                  <Text style={styles.citaHora}>{cita.bloque_inicio} hrs</Text>
                  <Text style={styles.citaServicio} numberOfLines={1}>
                    {cita.servicios?.map((s: any) => s.servicio?.nombre).filter(Boolean).join(', ') || 'Servicio'}
                  </Text>
                </View>
              </View>
            ))
          )}
        </>
      )}

      {/* Seccion de servicios */}
      <Text style={styles.sectionTitle}>Nuestros servicios</Text>
      <Text style={styles.sectionSub}>Todo lo que necesitas en un solo lugar</Text>

      <View style={styles.serviciosGrid}>
        {SERVICIOS.map((s, i) => (
          <View key={i} style={styles.servicioCard}>
            <View style={styles.servicioIconDot} />
            <Text style={styles.servicioTitle}>{s.title}</Text>
            <Text style={styles.servicioDesc}>{s.desc}</Text>
          </View>
        ))}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerTitle}>MUYMUY Beauty Studio</Text>
        <Text style={styles.footerSub}>Polanco · Ciudad de Mexico</Text>
        <Text style={styles.footerSub}>Lun–Sab 10:00–20:00  ·  Dom 11:00–18:00</Text>
      </View>

    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  content: { paddingBottom: 48 },

  /* Logo */
  logoRow: {
    backgroundColor: '#1d1d1f',
    paddingTop: 64,
    paddingBottom: 28,
    paddingHorizontal: 24,
  },
  logoText: {
    fontSize: 34,
    fontWeight: '800',
    color: ACCENT,
    letterSpacing: -1,
  },
  logoSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 4,
    fontWeight: '500',
  },

  /* Greeting */
  greetingBanner: {
    backgroundColor: '#f0f7e6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e0efcc',
  },
  greetingText: {
    fontSize: 14,
    fontWeight: '600',
    color: ACCENT,
  },

  /* CTA */
  ctaCard: {
    backgroundColor: ACCENT,
    margin: 20,
    marginBottom: 12,
    borderRadius: 20,
    padding: 22,
    position: 'relative',
  },
  ctaTitle: { fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 4 },
  ctaSub: { fontSize: 13, color: 'rgba(255,255,255,0.75)' },
  ctaArrow: {
    position: 'absolute',
    right: 22,
    top: '50%',
    marginTop: -12,
    width: 36, height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaArrowText: { color: '#fff', fontSize: 18, fontWeight: '700' },

  /* Login */
  loginCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1.5,
    borderColor: ACCENT,
  },
  loginTitle: { fontSize: 15, fontWeight: '700', color: ACCENT, marginBottom: 3 },
  loginSub: { fontSize: 13, color: '#6e6e73' },

  /* Citas */
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1d1d1f',
    marginHorizontal: 20,
    marginTop: 28,
    marginBottom: 4,
  },
  sectionSub: {
    fontSize: 13,
    color: '#6e6e73',
    marginHorizontal: 20,
    marginBottom: 16,
  },
  emptyCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f0f0f0',
    marginBottom: 8,
  },
  emptyText: { fontSize: 14, color: '#6e6e73' },
  emptyHint: { fontSize: 13, color: ACCENT, fontWeight: '600', marginTop: 4 },
  citaCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  citaDateBadge: {
    width: 46, height: 46, borderRadius: 12,
    backgroundColor: '#f0f7e6',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  citaDay: { fontSize: 17, fontWeight: '800', color: ACCENT, lineHeight: 19 },
  citaMes: { fontSize: 9, fontWeight: '700', color: ACCENT },
  citaInfo: { flex: 1 },
  citaSucursal: { fontSize: 14, fontWeight: '700', color: '#1d1d1f' },
  citaHora: { fontSize: 12, color: '#6e6e73', marginTop: 1 },
  citaServicio: { fontSize: 12, color: '#6e6e73', marginTop: 1 },

  /* Servicios grid */
  serviciosGrid: {
    marginHorizontal: 20,
    gap: 12,
  },
  servicioCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  servicioIconDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: ACCENT,
    marginBottom: 10,
  },
  servicioTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1d1d1f',
    marginBottom: 4,
  },
  servicioDesc: {
    fontSize: 13,
    color: '#6e6e73',
    lineHeight: 19,
  },

  /* Footer */
  footer: {
    marginTop: 40,
    paddingVertical: 28,
    paddingHorizontal: 24,
    backgroundColor: '#1d1d1f',
    alignItems: 'center',
    gap: 4,
  },
  footerTitle: { fontSize: 16, fontWeight: '800', color: ACCENT },
  footerSub: { fontSize: 12, color: 'rgba(255,255,255,0.45)', textAlign: 'center' },
})
