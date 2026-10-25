import type { ResultatHabilitats } from '../../types/domain'
import { PREGUNTES_HABILITATS, type CategoriaHabilitat } from './habilitats'

const CATEGORIES: CategoriaHabilitat[] = [
  'numerica',
  'verbal',
  'espacial',
  'social',
  'creativa',
  'manual',
  'organitzativa',
]

export function calcularResultatHabilitats(respostes: Record<string, number>): ResultatHabilitats {
  const sumes: Record<string, number> = {}
  const comptes: Record<string, number> = {}

  for (const pregunta of PREGUNTES_HABILITATS) {
    const valor = respostes[pregunta.id]
    if (valor == null) continue
    sumes[pregunta.categoria] = (sumes[pregunta.categoria] ?? 0) + valor
    comptes[pregunta.categoria] = (comptes[pregunta.categoria] ?? 0) + 1
  }

  const puntuacions: Record<string, number> = {}
  for (const cat of CATEGORIES) {
    puntuacions[cat] = comptes[cat] > 0 ? Math.round((sumes[cat] / comptes[cat] - 1) * 25) : 0 // 1-5 -> 0-100
  }

  return { puntuacions }
}
