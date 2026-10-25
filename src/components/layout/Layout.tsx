import { Suspense } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'
import { BannerDemo } from '../ui/Misc'
import { BarraComparador } from '../comparador/BarraComparador'
import { ESTA_EN_MODE_DEMO } from '../../lib/repo'
import { esqueletPerRuta } from '../../lib/skeletonPerRuta'
import { useAuth } from '../../context/useAuth'

export function Layout() {
  const location = useLocation()
  const { perfil, onboardingPendent } = useAuth()
  const bloquejarPerOnboarding = perfil?.rol === 'alumne' && onboardingPendent && location.pathname !== '/benvinguda'

  return (
    <>
      <a href="#contingut-principal" className="skip-link sr-only">
        Salta al contingut principal
      </a>
      {ESTA_EN_MODE_DEMO && <BannerDemo />}
      <Header />
      <main id="contingut-principal" key={location.pathname} tabIndex={-1} className="page-fade mx-auto w-full max-w-6xl flex-1 px-4 py-6 outline-none">
        <Suspense fallback={esqueletPerRuta(location.pathname)}>
          {bloquejarPerOnboarding ? <Navigate to="/benvinguda" replace /> : <Outlet />}
        </Suspense>
      </main>
      <Footer />
      <BarraComparador />
    </>
  )
}
