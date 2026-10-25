import type { ResultatPreferencies } from '../../types/domain'
import { PREGUNTES_PREFERENCIES } from './preferencies'

function mitjanaDimensio(respostes: Record<string, number>, dimensio: string): number {
  const valors = PREGUNTES_PREFERENCIES.filter(
    (p) => p.tipus === 'likert' && p.dimensio === dimensio,
  ).map((p) => respostes[p.id])
  const valids = valors.filter((v): v is number => v != null)
  if (valids.length === 0) return 50
  const mitjana = valids.reduce((a, b) => a + b, 0) / valids.length
  // 1-5 -> 0-100, amb el "Neutre" (3) exactament a 50: amb l'escala anterior (×20) un
  // alumne que responia tot neutre quedava a 60 i es classificava com a "cap a la universitat".
  return Math.round((mitjana - 1) * 25)
}

export function calcularResultatPreferencies(respostes: Record<string, number>): ResultatPreferencies {
  return {
    universitatVsFp: mitjanaDimensio(respostes, 'universitatVsFp'),
    publicVsPrivat: mitjanaDimensio(respostes, 'publicVsPrivat'),
    importanciaNota: mitjanaDimensio(respostes, 'importanciaNota'),
    importanciaIdioma: mitjanaDimensio(respostes, 'importanciaIdioma'),
    pressupostMax: respostes['pressupost'] ?? 2000,
    disposatDesplacar: respostes['desplacament'] ?? 30,
  }
}
