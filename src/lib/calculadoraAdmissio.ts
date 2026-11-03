// Fórmula oficial de la preinscripció universitària a Catalunya:
//   Nota d'accés (0-10)    = 0,6 × nota mitjana de Batxillerat + 0,4 × qualificació fase general PAU
//   Nota d'admissió (0-14) = Nota d'accés + fins a 2 matèries de la fase específica (aprovades,
//                            nota ≥ 5), cadascuna multiplicada per la seva ponderació (0,2 o 0,1)
// Si l'alumne presenta més de 2 matèries específiques, compten les 2 que donin més punts.

export interface MateriaEspecifica {
  materia: string
  nota: number
}

export interface MateriaComptada extends MateriaEspecifica {
  pes: number
  punts: number
}

export function calcularNotaAcces(notaMitjanaBatxillerat: number, faseGeneral: number): number {
  return notaMitjanaBatxillerat * 0.6 + faseGeneral * 0.4
}

export function calcularNotaAdmissio(
  notaAcces: number,
  materies: MateriaEspecifica[],
  ponderacions: Record<string, number>,
): { notaAdmissio: number; comptades: MateriaComptada[] } {
  const comptades = materies
    .filter((m) => m.materia && Number.isFinite(m.nota) && m.nota >= 5 && ponderacions[m.materia] != null)
    .map((m) => ({ ...m, pes: ponderacions[m.materia], punts: ponderacions[m.materia] * m.nota }))
    .sort((a, b) => b.punts - a.punts)
    .slice(0, 2)
  const extra = comptades.reduce((suma, m) => suma + m.punts, 0)
  return { notaAdmissio: notaAcces + extra, comptades }
}
