import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

const ITEMS = [
  { title: 'AFP 10%', desc: 'Cotización previsional obligatoria al fondo de pensiones.' },
  { title: 'Comisión AFP', desc: 'Porcentaje adicional cobrado por la AFP por administración.' },
  { title: 'Salud (Fonasa/Isapre)', desc: '7% Fonasa o 10% Isapre sobre la renta imponible.' },
  { title: 'Seguro de cesantía', desc: '3% sobre renta imponible, cargo del trabajador.' },
  { title: 'Gratificación legal (25%)', desc: '25% sobre sueldo base + comisiones + semana corrida.' },
  { title: 'Renta imponible', desc: 'Base de cálculo de todos los descuentos previsionales.' },
  { title: 'Haberes no imponibles', desc: 'Movilización y colación no están sujetos a descuentos.' },
];

export default function AcercaDeScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Acerca de</Text>
        <Text style={styles.subtitle}>Simulador de Remuneraciones</Text>
        <Text style={styles.desc}>
          Esta app calcula una liquidación de sueldo según la normativa chilena vigente,
          incluyendo cotizaciones previsionales (AFP + salud + cesantía) y gratificación legal del 25%.
        </Text>
        <Text style={styles.sectionTitle}>Conceptos clave</Text>
        {ITEMS.map((item) => (
          <View key={item.title} style={styles.card}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDesc}>{item.desc}</Text>
          </View>
        ))}
        <Text style={styles.footer}>
          Los valores son estimativos. Consulta a un profesional de remuneraciones para liquidaciones oficiales.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: '#f3f4f6' },
  container: { padding: 20 },
  title: {
    fontSize: 24, fontWeight: 'bold', color: '#1e3a5f',
    textAlign: 'center', marginTop: 8, marginBottom: 4,
  },
  subtitle: {
    fontSize: 15, color: '#2563eb', textAlign: 'center', marginBottom: 16,
  },
  desc: {
    fontSize: 14, color: '#374151', lineHeight: 22, marginBottom: 24,
    backgroundColor: '#fff', borderRadius: 10, padding: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
  },
  sectionTitle: {
    fontSize: 17, fontWeight: '700', color: '#1e3a5f', marginBottom: 12,
  },
  card: {
    backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
  },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#2563eb', marginBottom: 4 },
  cardDesc:  { fontSize: 13, color: '#374151', lineHeight: 20 },
  footer: {
    marginTop: 24, fontSize: 12, color: '#9ca3af',
    textAlign: 'center', lineHeight: 18,
  },
});
