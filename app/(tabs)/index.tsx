import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

// ── AFP options ──────────────────────────────────────────────────────────────
const AFP_OPTIONS = [
  { label: 'AFP Uno — 0,46%',      value: 0.46, name: 'AFP Uno' },
  { label: 'AFP Capital — 1,44%',  value: 1.44, name: 'AFP Capital' },
  { label: 'AFP Cuprum — 1,44%',   value: 1.44, name: 'AFP Cuprum' },
  { label: 'AFP Habitat — 1,27%',  value: 1.27, name: 'AFP Habitat' },
  { label: 'AFP Modelo — 0,58%',   value: 0.58, name: 'AFP Modelo' },
  { label: 'AFP Planvital — 1,16%',value: 1.16, name: 'AFP Planvital' },
  { label: 'AFP Provida — 1,45%',  value: 1.45, name: 'AFP Provida' },
];

const SALUD_OPTIONS = [
  { label: 'Fonasa — 7%',  value: 7,  name: 'Fonasa' },
  { label: 'Isapre — 10%', value: 10, name: 'Isapre' },
];

type Option = { label: string; value: number; name: string };

type ResultData = {
  nombre: string; rut: string; cargo: string;
  fechaIngreso: string; fechaLiquidacion: string;
  sueldoBase: number; comisiones: number; semanaCorrida: number;
  gratificacion: number; totalImponible: number;
  afpNombre: string; afpComisionPorc: number;
  descAfp10: number; descAfpComision: number;
  saludNombre: string; saludPorc: number;
  descSalud: number; descCesantia: number; totalDescuentos: number;
  movilizacion: number; colacion: number; totalNoImponibles: number;
  sueldoBruto: number; sueldoLiquido: number;
};

const fmt = (n: number) =>
  n.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });

// ── PDF HTML builder ─────────────────────────────────────────────────────────
function buildHtml(r: ResultData): string {
  const row = (label: string, value: number, bold = false, prefix = '') =>
    `<tr class="${bold ? 'total-row' : ''}">
      <td>${label}</td><td class="amount">${prefix}${fmt(value)}</td>
    </tr>`;
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Liquidación de Sueldo</title>
<style>
  body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #111827; font-size: 13px; }
  h1 { text-align: center; color: #1e3a5f; margin-bottom: 4px; font-size: 20px; }
  .fecha { text-align: center; color: #6b7280; margin-bottom: 20px; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; }
  .card.full { grid-column: span 2; }
  .card.totales { border: 2px solid #2563eb; }
  h3 { margin: 0 0 8px; font-size: 13px; color: #1e3a5f; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; }
  table { width: 100%; border-collapse: collapse; }
  td { padding: 5px 2px; border-bottom: 1px dashed #f3f4f6; }
  td.amount { text-align: right; white-space: nowrap; }
  tr.total-row td { font-weight: bold; border-top: 1px solid #e5e7eb; border-bottom: none; padding-top: 7px; }
  .datos-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 16px; font-size: 12px; }
  .datos-grid span { color: #9ca3af; display: block; }
  .liquido { display: flex; justify-content: space-between; margin-top: 8px; padding-top: 8px; border-top: 2px solid #2563eb; font-weight: bold; font-size: 15px; color: #2563eb; }
  @media print { body { padding: 10px; } }
</style>
</head>
<body>
  <h1>Liquidación de Sueldo</h1>
  ${r.fechaLiquidacion ? `<p class="fecha">Fecha: ${r.fechaLiquidacion}</p>` : ''}
  <div class="grid">
    <div class="card full">
      <h3>Datos personales</h3>
      <div class="datos-grid">
        <div><span>Nombre</span>${r.nombre}</div>
        <div><span>RUT</span>${r.rut}</div>
        <div><span>Cargo</span>${r.cargo}</div>
        ${r.fechaIngreso ? `<div><span>Fecha ingreso</span>${r.fechaIngreso}</div>` : ''}
      </div>
    </div>
    <div class="card">
      <h3>Haberes imponibles</h3>
      <table>
        ${row('Sueldo base', r.sueldoBase)}
        ${row('Comisiones', r.comisiones)}
        ${row('Semana corrida', r.semanaCorrida)}
        ${row('Gratificación legal (25%)', r.gratificacion)}
        ${row('Total imponible', r.totalImponible, true)}
      </table>
    </div>
    <div class="card">
      <h3>Descuentos</h3>
      <table>
        ${row('AFP 10%', r.descAfp10, false, '- ')}
        ${row(`Comisión ${r.afpNombre} (${r.afpComisionPorc.toFixed(2)}%)`, r.descAfpComision, false, '- ')}
        ${row(`Salud ${r.saludNombre} (${r.saludPorc}%)`, r.descSalud, false, '- ')}
        ${row('Seguro de cesantía (3%)', r.descCesantia, false, '- ')}
        ${row('Total descuentos', r.totalDescuentos, true, '- ')}
      </table>
    </div>
    <div class="card">
      <h3>Haberes no imponibles</h3>
      <table>
        ${row('Movilización', r.movilizacion)}
        ${row('Colación', r.colacion)}
        ${row('Total no imponibles', r.totalNoImponibles, true)}
      </table>
    </div>
    <div class="card totales">
      <h3>Totales</h3>
      <table>${row('Sueldo bruto', r.sueldoBruto)}</table>
      <div class="liquido"><span>Líquido a pago</span><span>${fmt(r.sueldoLiquido)}</span></div>
    </div>
  </div>
</body>
</html>`;
}

// ── Custom select / picker ────────────────────────────────────────────────────
function SelectField({
  label, options, selected, onSelect,
}: { label: string; options: Option[]; selected: Option; onSelect: (o: Option) => void }) {
  const [visible, setVisible] = useState(false);
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TouchableOpacity style={styles.selectBtn} onPress={() => setVisible(true)}>
        <Text style={styles.selectBtnText}>{selected.label}</Text>
        <Text style={styles.selectArrow}>▾</Text>
      </TouchableOpacity>
      <Modal visible={visible} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setVisible(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{label}</Text>
            {options.map((opt) => (
              <TouchableOpacity
                key={opt.name}
                style={[styles.modalOption, opt.name === selected.name && styles.modalOptionSelected]}
                onPress={() => { onSelect(opt); setVisible(false); }}>
                <Text style={[styles.modalOptionText, opt.name === selected.name && styles.modalOptionTextSelected]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

// ── Result row ────────────────────────────────────────────────────────────────
function Row({ label, value, bold, prefix = '' }: { label: string; value: number; bold?: boolean; prefix?: string }) {
  return (
    <View style={[styles.row, bold && styles.rowBold]}>
      <Text style={[styles.rowLabel, bold && styles.rowLabelBold]}>{label}</Text>
      <Text style={[styles.rowValue, bold && styles.rowValueBold]}>{prefix}{fmt(value)}</Text>
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function SimuladorScreen() {
  const [nombre, setNombre] = useState('Jorge Fuenzalida');
  const [rut, setRut] = useState('12.587.854-4');
  const [cargo, setCargo] = useState('Maestro Cheff');
  const [fechaIngreso, setFechaIngreso] = useState('03/07/2018');
  const [fechaLiquidacion, setFechaLiquidacion] = useState('12/03/2026');
  const [sueldoBase, setSueldoBase] = useState('1650000');
  const [comisiones, setComisiones] = useState('0');
  const [semanaCorrida, setSemanaCorrida] = useState('0');
  const [movilizacion, setMovilizacion] = useState('50000');
  const [colacion, setColacion] = useState('90000');
  const [afp, setAfp] = useState(AFP_OPTIONS.find(a => a.name === 'AFP Modelo') ?? AFP_OPTIONS[0]);
  const [salud, setSalud] = useState(SALUD_OPTIONS[0]); // Fonasa
  const [result, setResult] = useState<ResultData | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  const downloadPdf = async (r: ResultData) => {
    // En web: abrir el HTML en una ventana nueva y disparar su propio print,
    // para que no aparezca la UI de la app en el PDF.
    if (Platform.OS === 'web') {
      const win = window.open('', '_blank');
      if (win) {
        win.document.write(buildHtml(r));
        win.document.close();
        win.focus();
        win.print();
      }
      return;
    }

    // En Android / iOS: generar archivo PDF y compartir.
    setGeneratingPdf(true);
    try {
      const { uri } = await Print.printToFileAsync({ html: buildHtml(r) });
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Guardar liquidación PDF',
          UTI: 'com.adobe.pdf',
        });
      } else {
        Alert.alert('PDF generado', `Archivo guardado en:\n${uri}`);
      }
    } catch (e) {
      Alert.alert('Error', 'No se pudo generar el PDF.');
    } finally {
      setGeneratingPdf(false);
    }
  };

  const toNum = (s: string) => { const n = parseFloat(s.replace(/\./g, '').replace(',', '.')); return isNaN(n) ? 0 : n; };

  const calcular = () => {
    const errs: string[] = [];
    if (!nombre.trim()) errs.push('Nombre es requerido');
    if (!rut.trim()) errs.push('RUT es requerido');
    if (!cargo.trim()) errs.push('Cargo es requerido');
    if (toNum(sueldoBase) <= 0) errs.push('Sueldo base debe ser mayor a 0');
    if (errs.length) { setErrors(errs); return; }
    setErrors([]);

    const sb = toNum(sueldoBase);
    const com = toNum(comisiones);
    const sc = toNum(semanaCorrida);
    const gratificacion = (sb + com + sc) * 0.25;
    const totalImponible = sb + com + sc + gratificacion;

    const descAfp10 = totalImponible * 0.10;
    const descAfpComision = totalImponible * (afp.value / 100);
    const descSalud = totalImponible * (salud.value / 100);
    const descCesantia = totalImponible * 0.03;
    const totalDescuentos = descAfp10 + descAfpComision + descSalud + descCesantia;

    const mov = toNum(movilizacion);
    const col = toNum(colacion);
    const totalNoImponibles = mov + col;
    const sueldoBruto = totalImponible + totalNoImponibles;
    const sueldoLiquido = sueldoBruto - totalDescuentos;

    setResult({
      nombre, rut, cargo, fechaIngreso, fechaLiquidacion,
      sueldoBase: sb, comisiones: com, semanaCorrida: sc, gratificacion, totalImponible,
      afpNombre: afp.name, afpComisionPorc: afp.value,
      descAfp10, descAfpComision,
      saludNombre: salud.name, saludPorc: salud.value,
      descSalud, descCesantia, totalDescuentos,
      movilizacion: mov, colacion: col, totalNoImponibles,
      sueldoBruto, sueldoLiquido,
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

          <Text style={styles.appTitle}>Simulador de Remuneraciones</Text>

          {/* ── Datos personales ── */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Datos de la liquidación</Text>
            <Text style={styles.fieldLabel}>Fecha de liquidación</Text>
            <TextInput style={styles.input} placeholder="DD/MM/AAAA" value={fechaLiquidacion} onChangeText={setFechaLiquidacion} />
            <Text style={styles.fieldLabel}>Nombre completo *</Text>
            <TextInput style={styles.input} placeholder="Nombre Apellido" value={nombre} onChangeText={setNombre} />
            <Text style={styles.fieldLabel}>RUT *</Text>
            <TextInput style={styles.input} placeholder="12.345.678-9" value={rut} onChangeText={setRut} />
            <Text style={styles.fieldLabel}>Cargo *</Text>
            <TextInput style={styles.input} placeholder="Cargo" value={cargo} onChangeText={setCargo} />
            <Text style={styles.fieldLabel}>Fecha de ingreso</Text>
            <TextInput style={styles.input} placeholder="DD/MM/AAAA" value={fechaIngreso} onChangeText={setFechaIngreso} />
          </View>

          {/* ── Haberes imponibles ── */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Haberes imponibles</Text>
            <Text style={styles.fieldLabel}>Sueldo base ($) *</Text>
            <TextInput style={styles.input} placeholder="0" value={sueldoBase} onChangeText={setSueldoBase} keyboardType="numeric" />
            <Text style={styles.fieldLabel}>Comisiones ($)</Text>
            <TextInput style={styles.input} placeholder="0" value={comisiones} onChangeText={setComisiones} keyboardType="numeric" />
            <Text style={styles.fieldLabel}>Semana corrida ($)</Text>
            <TextInput style={styles.input} placeholder="0" value={semanaCorrida} onChangeText={setSemanaCorrida} keyboardType="numeric" />
            <Text style={styles.hint}>La gratificación legal (25%) se calcula automáticamente.</Text>
          </View>

          {/* ── Previsión y salud ── */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Previsión y salud</Text>
            <SelectField label="AFP" options={AFP_OPTIONS} selected={afp} onSelect={setAfp} />
            <SelectField label="Salud" options={SALUD_OPTIONS} selected={salud} onSelect={setSalud} />
          </View>

          {/* ── Haberes no imponibles ── */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Haberes no imponibles</Text>
            <Text style={styles.fieldLabel}>Movilización ($)</Text>
            <TextInput style={styles.input} placeholder="0" value={movilizacion} onChangeText={setMovilizacion} keyboardType="numeric" />
            <Text style={styles.fieldLabel}>Colación ($)</Text>
            <TextInput style={styles.input} placeholder="0" value={colacion} onChangeText={setColacion} keyboardType="numeric" />
          </View>

          {/* ── Errores ── */}
          {errors.length > 0 && (
            <View style={styles.errorBox}>
              {errors.map((e, i) => <Text key={i} style={styles.errorText}>• {e}</Text>)}
            </View>
          )}

          {/* ── Botón calcular ── */}
          <TouchableOpacity style={styles.calcBtn} onPress={calcular}>
            <Text style={styles.calcBtnText}>Calcular liquidación</Text>
          </TouchableOpacity>

          {/* ── Resultado ── */}
          {result && (
            <View style={styles.resultContainer}>
              <Text style={styles.resultTitle}>Liquidación de Sueldo</Text>
              {!!result.fechaLiquidacion && (
                <Text style={styles.resultDate}>Fecha: {result.fechaLiquidacion}</Text>
              )}

              {/* Datos personales */}
              <View style={styles.resultCard}>
                <Text style={styles.resultCardTitle}>Datos personales</Text>
                <View style={styles.dataGrid}>
                  <View style={styles.dataCell}><Text style={styles.dataLabel}>Nombre</Text><Text style={styles.dataValue}>{result.nombre}</Text></View>
                  <View style={styles.dataCell}><Text style={styles.dataLabel}>RUT</Text><Text style={styles.dataValue}>{result.rut}</Text></View>
                  <View style={styles.dataCell}><Text style={styles.dataLabel}>Cargo</Text><Text style={styles.dataValue}>{result.cargo}</Text></View>
                  {!!result.fechaIngreso && <View style={styles.dataCell}><Text style={styles.dataLabel}>Ingreso</Text><Text style={styles.dataValue}>{result.fechaIngreso}</Text></View>}
                </View>
              </View>

              {/* Haberes imponibles */}
              <View style={styles.resultCard}>
                <Text style={styles.resultCardTitle}>Haberes imponibles</Text>
                <Row label="Sueldo base"              value={result.sueldoBase} />
                <Row label="Comisiones"               value={result.comisiones} />
                <Row label="Semana corrida"           value={result.semanaCorrida} />
                <Row label="Gratificación legal (25%)" value={result.gratificacion} />
                <Row label="Total imponible"          value={result.totalImponible} bold />
              </View>

              {/* Descuentos */}
              <View style={styles.resultCard}>
                <Text style={styles.resultCardTitle}>Descuentos</Text>
                <Row label="AFP 10%"                                                           value={result.descAfp10}       prefix="- " />
                <Row label={`Comisión ${result.afpNombre} (${result.afpComisionPorc.toFixed(2)}%)`} value={result.descAfpComision} prefix="- " />
                <Row label={`Salud ${result.saludNombre} (${result.saludPorc}%)`}              value={result.descSalud}       prefix="- " />
                <Row label="Seguro de cesantía (3%)"                                           value={result.descCesantia}    prefix="- " />
                <Row label="Total descuentos"                                                  value={result.totalDescuentos} bold prefix="- " />
              </View>

              {/* No imponibles */}
              <View style={styles.resultCard}>
                <Text style={styles.resultCardTitle}>Haberes no imponibles</Text>
                <Row label="Movilización"       value={result.movilizacion} />
                <Row label="Colación"           value={result.colacion} />
                <Row label="Total no imponibles" value={result.totalNoImponibles} bold />
              </View>

              {/* Totales */}
              <View style={[styles.resultCard, styles.totalesCard]}>
                <Text style={styles.resultCardTitle}>Totales</Text>
                <Row label="Sueldo bruto" value={result.sueldoBruto} />
                <View style={[styles.row, styles.rowEmphasis]}>
                  <Text style={styles.rowLabelEmphasis}>Líquido a pago</Text>
                  <Text style={styles.rowValueEmphasis}>{fmt(result.sueldoLiquido)}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.pdfBtn, generatingPdf && styles.pdfBtnDisabled]}
                onPress={() => downloadPdf(result)}
                disabled={generatingPdf}>
                <Text style={styles.pdfBtnText}>
                  {generatingPdf ? 'Generando PDF…' : '⬇ Descargar PDF'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.resetBtn} onPress={() => setResult(null)}>
                <Text style={styles.resetBtnText}>Nueva liquidación</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: '#f3f4f6' },
  container: { padding: 16 },

  appTitle: {
    fontSize: 22, fontWeight: 'bold', color: '#1e3a5f',
    textAlign: 'center', marginBottom: 20, marginTop: 8,
  },

  // Cards
  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16,
    marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07, shadowRadius: 4, elevation: 2,
  },
  cardTitle: {
    fontSize: 16, fontWeight: '700', color: '#1e3a5f',
    marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#e5e7eb', paddingBottom: 8,
  },

  // Inputs
  fieldGroup: { marginTop: 10 },
  fieldLabel: { fontSize: 14, color: '#374151', marginTop: 10, marginBottom: 4, fontWeight: '500' },
  input: {
    borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8,
    padding: 10, fontSize: 15, color: '#111', backgroundColor: '#fafafa',
  },
  hint: { fontSize: 12, color: '#6b7280', marginTop: 6 },

  // Select
  selectBtn: {
    borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8,
    padding: 10, backgroundColor: '#fafafa',
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  selectBtnText: { fontSize: 15, color: '#111', flex: 1 },
  selectArrow:   { fontSize: 16, color: '#6b7280' },

  // Modal
  modalOverlay:  { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', paddingHorizontal: 24 },
  modalContent:  { backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden' },
  modalTitle:    { fontSize: 16, fontWeight: '700', color: '#1e3a5f', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  modalOption:         { padding: 14, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  modalOptionSelected: { backgroundColor: '#eff6ff' },
  modalOptionText:         { fontSize: 15, color: '#374151' },
  modalOptionTextSelected: { color: '#2563eb', fontWeight: '600' },

  // Errors
  errorBox:  { backgroundColor: '#fee2e2', borderRadius: 8, padding: 12, marginBottom: 12 },
  errorText: { color: '#b91c1c', fontSize: 14 },

  // Calculate button
  calcBtn:     { backgroundColor: '#2563eb', borderRadius: 10, padding: 14, alignItems: 'center', marginBottom: 24 },
  calcBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },

  // Result container
  resultContainer: { marginTop: 4 },
  resultTitle: { fontSize: 20, fontWeight: 'bold', color: '#1e3a5f', textAlign: 'center', marginBottom: 4 },
  resultDate:  { textAlign: 'center', color: '#6b7280', marginBottom: 16, fontSize: 14 },

  resultCard: {
    backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
  },
  totalesCard:     { borderWidth: 2, borderColor: '#2563eb' },
  resultCardTitle: { fontSize: 15, fontWeight: '700', color: '#1e3a5f', marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#e5e7eb', paddingBottom: 6 },

  dataGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  dataCell: { width: '47%' },
  dataLabel: { fontSize: 12, color: '#9ca3af', fontWeight: '500' },
  dataValue: { fontSize: 14, color: '#111827', fontWeight: '600' },

  // Rows
  row:     { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  rowBold: { borderBottomWidth: 0, marginTop: 4, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  rowEmphasis: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6, paddingTop: 8, borderTopWidth: 2, borderTopColor: '#2563eb' },

  rowLabel:         { fontSize: 14, color: '#374151', flex: 1 },
  rowLabelBold:     { fontWeight: '700', color: '#111827' },
  rowLabelEmphasis: { fontSize: 17, fontWeight: 'bold', color: '#1e3a5f', flex: 1 },

  rowValue:         { fontSize: 14, color: '#374151' },
  rowValueBold:     { fontWeight: '700', color: '#111827' },
  rowValueEmphasis: { fontSize: 17, fontWeight: 'bold', color: '#2563eb' },

  // PDF button
  pdfBtn:         { backgroundColor: '#16a34a', borderRadius: 10, padding: 14, alignItems: 'center', marginTop: 16 },
  pdfBtnDisabled: { backgroundColor: '#86efac' },
  pdfBtnText:     { color: '#fff', fontSize: 16, fontWeight: '700' },

  // Reset button
  resetBtn:     { borderWidth: 2, borderColor: '#2563eb', borderRadius: 10, padding: 12, alignItems: 'center', marginTop: 8 },
  resetBtnText: { color: '#2563eb', fontSize: 16, fontWeight: '600' },
});
