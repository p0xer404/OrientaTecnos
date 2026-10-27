import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { destiPerPerfil } from '../lib/nav'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Label, TextInput } from '../components/ui/Forms'
import { LogoMark } from '../components/ui/Icons'
import { Foto } from '../components/ui/Foto'
import { SkeletonLogin } from '../components/ui/Skeleton'
import { ESTA_EN_MODE_DEMO } from '../lib/repo'

export default function Login() {
  const { login, perfil, carregant: comprovantSessio } = useAuth()
  const navigate = useNavigate()
  const location = useLocation() as { state?: { from?: string } }
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [carregant, setCarregant] = useState(false)

  if (comprovantSessio) return <SkeletonLogin />
  if (perfil) return <Navigate to={location.state?.from ?? destiPerPerfil(perfil)} replace />

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setCarregant(true)
    try {
      const perfil = await login(email, password)
      navigate(location.state?.from ?? destiPerPerfil(perfil))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No s\'ha pogut iniciar la sessió.')
    } finally {
      setCarregant(false)
    }
  }

  return (
    <div className="fade-in mx-auto grid max-w-4xl gap-10 py-6 lg:grid-cols-2 lg:items-center">
      <div className="relative isolate hidden aspect-[3/4] overflow-hidden rounded-2xl bg-[#2a1a0e] lg:block">
        <div className="absolute inset-0 -z-20">
          <Foto nom="login" prioritaria className="zoom-lent" />
        </div>
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#2a1a0e]/90 via-[#2a1a0e]/35 to-transparent" aria-hidden="true" />
        <div className="absolute inset-x-0 bottom-0 p-7">
          <LogoMark className="h-9 w-9 text-[#f0c9a8]" />
          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#f0c9a8]">Benvingut/da de nou</p>
          <h1 className="mt-1 text-3xl font-bold text-[#faf5ea]">Segueix on ho vas deixar</h1>
          <p className="mt-2 text-sm text-[#efe6d6]">
            Les teves llistes, els resultats dels tests i les recomanacions et tornen a esperar tal com els vas deixar.
          </p>
          <ul className="mt-4 space-y-2 border-l-2 border-[#f0c9a8] pl-4 text-sm text-[#efe6d6]">
            <li>Cap dada es comparteix amb ningú més que tu i el teu tutor/a.</li>
            <li>Pots descarregar o esborrar les teves dades quan vulguis.</li>
          </ul>
        </div>
      </div>

      <div>
        <h1 className="mb-4 text-2xl font-semibold text-ink lg:hidden">Inicia sessió</h1>
        <Card className="border-t-4 border-t-primary">
          <form onSubmit={enviar} className="space-y-4">
            <div>
              <Label htmlFor="email">Correu electrònic</Label>
              <TextInput id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
            </div>
            <div>
              <Label htmlFor="password">Contrasenya</Label>
              <TextInput id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
            </div>
            {error && <p role="alert" className="fade-in text-sm text-warning">{error}</p>}
            <Button type="submit" className="w-full" disabled={carregant}>
              {carregant ? 'Entrant…' : 'Inicia sessió'}
            </Button>
          </form>
          <p className="mt-4 text-sm text-muted">
            Encara no tens compte?{' '}
            <Link to="/registre" className="text-primary underline">
              Registra't com a alumne o tutor/a
            </Link>
          </p>
        </Card>

        {ESTA_EN_MODE_DEMO && (
          <Card className="fade-in mt-4 text-sm text-muted">
            <p className="mb-2 font-medium text-ink">Credencials de demostració (dades fictícies)</p>
            <ul className="space-y-1">
              <li><strong>Alumne:</strong> laia.alumna@demo.tecnos.cat</li>
              <li><strong>Tutor/a:</strong> tutor1@demo.tecnos.cat</li>
              <li><strong>Admin:</strong> admin@demo.tecnos.cat</li>
            </ul>
            <p className="mt-2">Contrasenya per a tots: <code>demo1234</code></p>
          </Card>
        )}
      </div>
    </div>
  )
}
