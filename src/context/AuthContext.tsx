import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { repo } from '../lib/repo'
import type { DadesRegistreAlumne, DadesRegistreTutor } from '../lib/repo/types'
import type { Perfil } from '../types/domain'
import { AuthContext } from './useAuth'

async function calcularOnboardingPendent(p: Perfil | null): Promise<boolean> {
  if (!p || p.rol !== 'alumne') return false
  try {
    const resultat = await repo.ultimResultat(p.id, 'preferencies')
    return !resultat
  } catch {
    // Si la comprovació falla (xarxa), no es bloqueja l'accés a tota l'aplicació.
    return false
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [carregant, setCarregant] = useState(true)
  const [onboardingPendent, setOnboardingPendent] = useState(false)

  useEffect(() => {
    repo
      .usuariActual()
      .then(async (p) => {
        setOnboardingPendent(await calcularOnboardingPendent(p))
        setPerfil(p)
      })
      .catch(() => setPerfil(null))
      .finally(() => setCarregant(false))
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const p = await repo.login(email, password)
    setOnboardingPendent(await calcularOnboardingPendent(p))
    setPerfil(p)
    return p
  }, [])

  const registrarAlumne = useCallback(async (dades: DadesRegistreAlumne) => {
    const p = await repo.registrarAlumne(dades)
    setOnboardingPendent(true)
    setPerfil(p)
    return p
  }, [])

  const registrarTutor = useCallback(async (dades: DadesRegistreTutor) => {
    const p = await repo.registrarTutor(dades)
    setPerfil(p)
    setOnboardingPendent(false)
    return p
  }, [])

  const logout = useCallback(async () => {
    await repo.logout()
    setPerfil(null)
    setOnboardingPendent(false)
  }, [])

  const refrescar = useCallback(async () => {
    if (!perfil) return
    const actualitzat = await repo.obtenirPerfil(perfil.id)
    setPerfil(actualitzat)
  }, [perfil])

  const marcarOnboardingFet = useCallback(() => setOnboardingPendent(false), [])

  return (
    <AuthContext.Provider
      value={{ perfil, carregant, onboardingPendent, login, registrarAlumne, registrarTutor, logout, refrescar, marcarOnboardingFet }}
    >
      {children}
    </AuthContext.Provider>
  )
}
