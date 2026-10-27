import { Suspense, useEffect } from 'react'
import { Navigate, Outlet, useLocation, useNavigationType } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'
import { BannerDemo } from '../ui/Misc'
import { BarraComparador } from '../comparador/BarraComparador'
import { ESTA_EN_MODE_DEMO } from '../../lib/repo'
import { esqueletPerRuta } from '../../lib/skeletonPerRuta'
import { useAuth } from '../../context/useAuth'
import { precarregarEnSegonPla } from '../../lib/prefetch'

const TITOLS: [RegExp, string][] = [
  [/^\/$/, 'Orientació acadèmica'],
  [/^\/cercador/, 'Cercador'],
  [/^\/estudi\//, 'Fitxa de l\'estudi'],
  [/^\/comparar/, 'Comparador'],
  [/^\/guia/, 'Guia acadèmica'],
  [/^\/tests/, 'Tests'],
  [/^\/recomanacions/, 'Recomanacions'],
  [/^\/llistes/, 'Les meves llistes'],
  [/^\/perfil/, 'El meu perfil'],
  [/^\/benvinguda/, 'Benvinguda'],
  [/^\/orientador/, 'El meu grup'],
  [/^\/admin/, 'Gestió'],
  [/^\/login/, 'Inicia sessió'],
  [/^\/registre/, 'Registre'],
  [/^\/privacitat/, 'Política de privacitat'],
  [/^\/avis-legal/, 'Avís legal'],
]

export function Layout() {
  const location = useLocation()
  const { perfil, onboardingPendent } = useAuth()
  const bloquejarPerOnboarding = perfil?.rol === 'alumne' && onboardingPendent && location.pathname !== '/benvinguda'
  const tipusNavegacio = useNavigationType()

  // En canviar de pàgina es torna a dalt (si no, s'obria la fitxa d'un estudi a mitja pàgina);
  // amb enrere/endavant (POP) es respecta la posició que restaura el navegador.
  useEffect(() => {
    if (tipusNavegacio !== 'POP') window.scrollTo({ top: 0, behavior: 'instant' })
    const titol = TITOLS.find(([re]) => re.test(location.pathname))?.[1] ?? 'Pàgina no trobada'
    document.title = `${titol} · Orienta Tecnos`
  }, [location.pathname, tipusNavegacio])

  useEffect(() => {
    precarregarEnSegonPla()
  }, [])

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
