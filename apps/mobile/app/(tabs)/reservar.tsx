import { View, Text, StyleSheet } from 'react-native'

// TODO: Adaptar BookingPage.tsx de la web a React Native
export default function ReservarScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reservar cita</Text>
      <Text style={styles.sub}>Próximamente — flujo de reservas</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f8f8' },
  title: { fontSize: 24, fontWeight: '700', color: '#1d1d1f' },
  sub: { fontSize: 14, color: '#6e6e73', marginTop: 8 },
})
