import { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native'
import * as SecureStore from 'expo-secure-store'
import { useRouter } from 'expo-router'
import { supabase } from '../../lib/supabase'

export default function PerfilScreen() {
  const router = useRouter()
  const [cliente, setCliente] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const clienteId = await SecureStore.getItemAsync('cliente_id')
      if (clienteId) {
        const { data } = await supabase
          .from('clientes')
          .select('id, nombre_completo, telefono_cel, email, created_at, num_cliente')
          .eq('id', clienteId)
          .single()
        setCliente(data)
      }
      setLoading(false)
    }
    load()
  }, [])

  async function handleLogout() {
    Alert.alert(
      'Cerrar sesion',
      'Deseas salir de tu cuenta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Salir',
          style: 'destructive',
          onPress: async () => {
            await SecureStore.deleteItemAsync('cliente_id')
            await SecureStore.deleteItemAsync('cliente_nombre')
            setCliente(null)
          }
        }
      ]
    )
  }

  if (loading) return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f8f8' }}>
      <ActivityIndicator color="#88B04B" />
    </View>
  )

  // Sin sesion
  if (!cliente) return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: 80 }]}>
        <Text style={styles.pageTitle}>Mi perfil</Text>
        <Text style={styles.pageSub}>No estas identificada.</Text>

        <TouchableOpacity
          style={styles.loginBtn}
          onPress={() => router.push('/(auth)/identificacion')}
        >
          <Text style={styles.loginBtnText}>Identificarme con mi telefono</Text>
        </TouchableOpacity>

        <Text style={styles.hint}>
          Al identificarte podras ver el historial de tus citas y agilizar futuros agendados.
        </Text>
      </ScrollView>
    </View>
  )

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Mi perfil</Text>

      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {cliente.nombre_completo?.charAt(0).toUpperCase()}
        </Text>
      </View>
      <Text style={styles.nombre}>{cliente.nombre_completo}</Text>
      <Text style={styles.numCliente}>Cliente #{cliente.num_cliente}</Text>

      <View style={styles.card}>
        <InfoRow label="Telefono" value={cliente.telefono_cel ?? '—'} />
        <InfoRow label="Correo" value={cliente.email ?? 'No registrado'} />
        <InfoRow
          label="Miembro desde"
          value={new Date(cliente.created_at).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}
        />
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Cerrar sesion</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={infoStyles.row}>
      <Text style={infoStyles.label}>{label}</Text>
      <Text style={infoStyles.value}>{value}</Text>
    </View>
  )
}

const infoStyles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  label: { fontSize: 14, color: '#6e6e73' },
  value: { fontSize: 14, fontWeight: '600', color: '#1d1d1f', maxWidth: '60%', textAlign: 'right' },
})

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  content: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 60, alignItems: 'center' },
  pageTitle: { fontSize: 26, fontWeight: '800', color: '#1d1d1f', alignSelf: 'flex-start', marginBottom: 8, letterSpacing: -0.5 },
  pageSub: { fontSize: 15, color: '#6e6e73', alignSelf: 'flex-start', marginBottom: 32 },
  loginBtn: {
    backgroundColor: '#1d1d1f', borderRadius: 16,
    paddingVertical: 18, paddingHorizontal: 24,
    alignSelf: 'stretch', alignItems: 'center', marginBottom: 16,
  },
  loginBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  hint: { fontSize: 13, color: '#b0b0b0', textAlign: 'center', lineHeight: 20 },
  avatar: {
    width: 76, height: 76, borderRadius: 38,
    backgroundColor: '#88B04B',
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  avatarText: { fontSize: 30, fontWeight: '800', color: '#fff' },
  nombre: { fontSize: 20, fontWeight: '700', color: '#1d1d1f', marginBottom: 4 },
  numCliente: { fontSize: 13, color: '#6e6e73', marginBottom: 28 },
  card: {
    backgroundColor: '#fff', borderRadius: 20,
    padding: 4, width: '100%',
    borderWidth: 1, borderColor: '#f0f0f0', marginBottom: 24,
  },
  logoutBtn: {
    paddingVertical: 14, paddingHorizontal: 32,
    borderRadius: 14, borderWidth: 1.5, borderColor: '#ff3b30',
  },
  logoutText: { fontSize: 15, fontWeight: '700', color: '#ff3b30' },
})
