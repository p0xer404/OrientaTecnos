import type { Perfil } from '../types/domain'

/** On ha d'anar cadascú en fer clic al logotip o en aterrar a "/" ja havent iniciat sessió. */
export function destiPerPerfil(perfil: Perfil | null): string {
  if (!perfil) return '/'
  if (perfil.rol === 'tutor') return '/orientador'
  if (perfil.rol === 'admin') return '/admin'
  return '/cercador'
}
