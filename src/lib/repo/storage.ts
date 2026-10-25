import type { ElementLlista, Grup, Llista, NotaTutor, Perfil, ResultatTest } from '../../types/domain'

const CLAU = 'buscador-tecnos-demo-v1'
const CLAU_SESSIO = 'buscador-tecnos-sessio'

export interface BaseDadesDemo {
  perfils: Perfil[]
  // Contrasenyes en text pla NOMÉS perquè és un mode de demostració 100% local (localStorage),
  // sense servidor. En producció (mode Supabase) l'autenticació real la gestiona Supabase Auth.
  credencials: Record<string, string>
  grups: Grup[]
  llistes: Llista[]
  elementsLlista: ElementLlista[]
  resultatsTests: ResultatTest[]
  notesTutor: NotaTutor[]
}

export function baseDadesBuida(): BaseDadesDemo {
  return {
    perfils: [],
    credencials: {},
    grups: [],
    llistes: [],
    elementsLlista: [],
    resultatsTests: [],
    notesTutor: [],
  }
}

export function llegirBaseDades(): BaseDadesDemo {
  try {
    const text = localStorage.getItem(CLAU)
    if (!text) return baseDadesBuida()
    return { ...baseDadesBuida(), ...JSON.parse(text) }
  } catch {
    return baseDadesBuida()
  }
}

export function desarBaseDades(db: BaseDadesDemo): void {
  try {
    localStorage.setItem(CLAU, JSON.stringify(db))
  } catch {
    // localStorage pot no estar disponible (mode privat, quota superada...); es continua
    // en memòria dins d'aquesta sessió però sense persistència entre recàrregues.
  }
}

export function obtenirSessio(): string | null {
  try {
    return localStorage.getItem(CLAU_SESSIO)
  } catch {
    return null
  }
}

export function desarSessio(userId: string | null): void {
  try {
    if (userId) localStorage.setItem(CLAU_SESSIO, userId)
    else localStorage.removeItem(CLAU_SESSIO)
  } catch {
    // ignorat
  }
}

export function generarId(prefix: string): string {
  const random = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`
  return `${prefix}-${random}`
}

export function generarCodiInvitacio(): string {
  const alfabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let codi = ''
  for (let i = 0; i < 6; i++) codi += alfabet[Math.floor(Math.random() * alfabet.length)]
  return codi
}
