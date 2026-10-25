import type { PerfilRiasec, ResultatRiasec } from '../../types/domain'
import { AFIRMACIONS_RIASEC } from './preguntes'

const PERFILS: PerfilRiasec[] = ['R', 'I', 'A', 'S', 'E', 'C']

/** `respostes` associa l'id de cada afirmació a una puntuació 1-5. */
export function calcularResultatRiasec(respostes: Record<string, number>): ResultatRiasec {
  const sumes: Record<PerfilRiasec, number> = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 }
  const comptes: Record<PerfilRiasec, number> = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 }

  for (const afirmacio of AFIRMACIONS_RIASEC) {
    const valor = respostes[afirmacio.id]
    if (valor == null) continue
    sumes[afirmacio.perfil] += valor
    comptes[afirmacio.perfil] += 1
  }

  const puntuacions = PERFILS.reduce((acc, p) => {
    acc[p] = comptes[p] > 0 ? Math.round((sumes[p] / comptes[p] - 1) * 25) : 0 // escala 1-5 -> 0-100
    return acc
  }, {} as Record<PerfilRiasec, number>)

  const ordenats = [...PERFILS].sort((a, b) => puntuacions[b] - puntuacions[a])
  const maxim = puntuacions[ordenats[0]]
  // Dominants: el primer, i el segon si queda a prop (dins de 15 punts) del primer.
  const dominants = ordenats.slice(0, maxim - puntuacions[ordenats[1]] <= 15 ? 2 : 1)

  return { puntuacions, dominants }
}
