import {
  SkeletonAdmin,
  SkeletonBenvinguda,
  SkeletonCercador,
  SkeletonComparar,
  SkeletonFitxa,
  SkeletonGuia,
  SkeletonGuiaArticle,
  SkeletonHome,
  SkeletonLlistes,
  SkeletonLogin,
  SkeletonOrientadorDashboard,
  SkeletonPagina,
  SkeletonPerfil,
  SkeletonRecomanacions,
  SkeletonRegistre,
  SkeletonTestDetall,
  SkeletonTests,
  SkeletonTextPage,
} from '../components/ui/Skeleton'
import { obtenirComparador } from './comparador'

/** Retorna l'esquelet amb la mateixa silueta que el contingut real de cada ruta,
 * perquè la transició entre l'esquelet i la pàgina carregada sigui suau i reconeixible. */
export function esqueletPerRuta(pathname: string) {
  if (pathname === '/') return <SkeletonHome />
  if (pathname === '/cercador') return <SkeletonCercador />
  if (pathname.startsWith('/estudi/')) return <SkeletonFitxa />
  if (pathname === '/comparar') return <SkeletonComparar columnes={Math.max(obtenirComparador().length, 1)} />
  if (pathname === '/guia') return <SkeletonGuia />
  if (pathname.startsWith('/guia/')) return <SkeletonGuiaArticle />
  if (pathname === '/login') return <SkeletonLogin />
  if (pathname === '/registre') return <SkeletonRegistre />
  if (pathname === '/privacitat' || pathname === '/avis-legal') return <SkeletonTextPage />
  if (pathname === '/benvinguda') return <SkeletonBenvinguda />
  if (pathname === '/llistes') return <SkeletonLlistes />
  if (pathname === '/tests') return <SkeletonTests />
  if (pathname.startsWith('/tests/')) return <SkeletonTestDetall />
  if (pathname === '/recomanacions') return <SkeletonRecomanacions />
  if (pathname === '/perfil') return <SkeletonPerfil />
  if (pathname === '/orientador') return <SkeletonOrientadorDashboard />
  if (pathname.startsWith('/orientador/alumne/')) return <SkeletonFitxa />
  if (pathname === '/admin') return <SkeletonAdmin />
  return <SkeletonPagina />
}
