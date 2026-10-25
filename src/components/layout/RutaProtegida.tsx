import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'
import { esqueletPerRuta } from '../../lib/skeletonPerRuta'
import type { Rol } from '../../types/domain'

export function RutaProtegida({ rols, children }: { rols: Rol[]; children: ReactNode }) {
  const { perfil, carregant } = useAuth()
  const location = useLocation()

  if (carregant) return esqueletPerRuta(location.pathname)
  if (!perfil) return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />
  if (!rols.includes(perfil.rol)) return <Navigate to="/" replace />
  return <>{children}</>
}
