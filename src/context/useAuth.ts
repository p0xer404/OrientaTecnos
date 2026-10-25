import { createContext, useContext } from 'react'
import type { DadesRegistreAlumne, DadesRegistreTutor } from '../lib/repo/types'
import type { Perfil } from '../types/domain'

export interface AuthContextValue {
  perfil: Perfil | null
  carregant: boolean
  /** Cert si l'alumne acaba de registrar-se (o torna a entrar) i encara no ha completat
   * el qüestionari inicial de preferències a /benvinguda. Mentre sigui cert, la resta de
   * l'aplicació el redirigeix allà. */
  onboardingPendent: boolean
  login: (email: string, password: string) => Promise<Perfil>
  registrarAlumne: (dades: DadesRegistreAlumne) => Promise<Perfil>
  registrarTutor: (dades: DadesRegistreTutor) => Promise<Perfil>
  logout: () => Promise<void>
  refrescar: () => Promise<void>
  marcarOnboardingFet: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth s\'ha de fer servir dins de <AuthProvider>.')
  return ctx
}
