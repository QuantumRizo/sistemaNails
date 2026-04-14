import { Redirect } from 'expo-router'

// Redirige directo al home. Login es opcional.
export default function Index() {
  return <Redirect href="/(tabs)/inicio" />
}
