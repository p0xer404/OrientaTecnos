import { lazy } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { ErrorBoundary } from './components/layout/ErrorBoundary'
import { Layout } from './components/layout/Layout'
import { RutaProtegida } from './components/layout/RutaProtegida'

const Home = lazy(() => import('./pages/Home'))
const Cercador = lazy(() => import('./pages/Cercador'))
const EstudiDetall = lazy(() => import('./pages/EstudiDetall'))
const Benvinguda = lazy(() => import('./pages/Benvinguda'))
const Llistes = lazy(() => import('./pages/Llistes'))
const Comparar = lazy(() => import('./pages/Comparar'))
const Tests = lazy(() => import('./pages/Tests'))
const TestDetall = lazy(() => import('./pages/TestDetall'))
const Recomanacions = lazy(() => import('./pages/Recomanacions'))
const Guia = lazy(() => import('./pages/Guia'))
const GuiaArticle = lazy(() => import('./pages/GuiaArticle'))
const Perfil = lazy(() => import('./pages/Perfil'))
const Login = lazy(() => import('./pages/Login'))
const Registre = lazy(() => import('./pages/Registre'))
const OrientadorDashboard = lazy(() => import('./pages/OrientadorDashboard'))
const OrientadorAlumne = lazy(() => import('./pages/OrientadorAlumne'))
const Admin = lazy(() => import('./pages/Admin'))
const Privacitat = lazy(() => import('./pages/Privacitat'))
const AvisLegal = lazy(() => import('./pages/AvisLegal'))
const NotFound = lazy(() => import('./pages/NotFound'))

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="cercador" element={<Cercador />} />
                <Route path="estudi/:id" element={<EstudiDetall />} />
                <Route path="comparar" element={<Comparar />} />
                <Route path="guia" element={<Guia />} />
                <Route path="guia/:slug" element={<GuiaArticle />} />
                <Route path="login" element={<Login />} />
                <Route path="registre" element={<Registre />} />
                <Route path="privacitat" element={<Privacitat />} />
                <Route path="avis-legal" element={<AvisLegal />} />

                <Route path="benvinguda" element={<RutaProtegida rols={['alumne']}><Benvinguda /></RutaProtegida>} />
                <Route path="llistes" element={<RutaProtegida rols={['alumne']}><Llistes /></RutaProtegida>} />
                <Route path="tests" element={<RutaProtegida rols={['alumne']}><Tests /></RutaProtegida>} />
                <Route path="tests/:testId" element={<RutaProtegida rols={['alumne']}><TestDetall /></RutaProtegida>} />
                <Route path="recomanacions" element={<RutaProtegida rols={['alumne']}><Recomanacions /></RutaProtegida>} />
                <Route path="perfil" element={<RutaProtegida rols={['alumne']}><Perfil /></RutaProtegida>} />

                <Route path="orientador" element={<RutaProtegida rols={['tutor']}><OrientadorDashboard /></RutaProtegida>} />
                <Route path="orientador/alumne/:id" element={<RutaProtegida rols={['tutor', 'admin']}><OrientadorAlumne /></RutaProtegida>} />

                <Route path="admin" element={<RutaProtegida rols={['admin']}><Admin /></RutaProtegida>} />

                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
          <Analytics />
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}
