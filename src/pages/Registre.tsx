import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { destiPerPerfil } from '../lib/nav'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Tabs } from '../components/ui/Tabs'
import { Label, TextInput, Select, Checkbox } from '../components/ui/Forms'
import { SkeletonRegistre } from '../components/ui/Skeleton'

type TipusCompte = 'alumne' | 'tutor'

export default function Registre() {
  const { registrarAlumne, registrarTutor, perfil, carregant: comprovantSessio } = useAuth()
  const navigate = useNavigate()
  const [tipus, setTipus] = useState<TipusCompte>('alumne')
  const [nom, setNom] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [codi, setCodi] = useState('')
  const [curs, setCurs] = useState('4t ESO')
  const [esMenor, setEsMenor] = useState(false)
  const [consentPares, setConsentPares] = useState(false)
  const [accepta, setAccepta] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [carregant, setCarregant] = useState(false)

  if (comprovantSessio) return <SkeletonRegistre />
  if (perfil) return <Navigate to={destiPerPerfil(perfil)} replace />

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!accepta) {
      setError('Cal acceptar la política de privacitat per registrar-te.')
      return
    }
    setCarregant(true)
    try {
      if (tipus === 'alumne') {
        await registrarAlumne({
          nom,
          email,
          password,
          codiInvitacio: codi,
          cursActual: curs,
          esMenorDe14: esMenor,
          consentimentPares: consentPares,
        })
        navigate('/benvinguda')
      } else {
        await registrarTutor({ nom, email, password })
        navigate('/orientador')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No s\'ha pogut completar el registre.')
    } finally {
      setCarregant(false)
    }
  }

  return (
    <div className="fade-in mx-auto max-w-md">
      <p className="eyebrow">Escola Tecnos</p>
      <h1 className="mb-4 mt-1 text-2xl font-semibold text-ink">Crea un compte</h1>
      <Tabs
        pestanyes={[
          { id: 'alumne', etiqueta: 'Sóc alumne' },
          { id: 'tutor', etiqueta: 'Sóc tutor/a' },
        ]}
        activa={tipus}
        onCanvia={(id) => setTipus(id as TipusCompte)}
      />
      <Card className="mt-4 border-t-4 border-t-primary">
        <form onSubmit={enviar} className="space-y-4">
          <div>
            <Label htmlFor="nom">Nom i cognoms</Label>
            <TextInput id="nom" required value={nom} onChange={(e) => setNom(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="email">Correu electrònic</Label>
            <TextInput id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
          </div>
          <div>
            <Label htmlFor="password">Contrasenya</Label>
            <TextInput id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
          </div>

          {tipus === 'alumne' && (
            <>
              <div>
                <Label htmlFor="curs">Curs actual</Label>
                <Select id="curs" value={curs} onChange={(e) => setCurs(e.target.value)}>
                  <option>4t ESO</option>
                  <option>1r Batxillerat</option>
                  <option>2n Batxillerat</option>
                </Select>
              </div>
              <div>
                <Label htmlFor="codi">Codi de la teva classe</Label>
                <TextInput id="codi" required value={codi} onChange={(e) => setCodi(e.target.value.toUpperCase())} placeholder="Demana'l al teu tutor/a" />
                <p className="mt-1 text-xs text-muted">El teu tutor/a et dirà també amb quin domini de correu t'has de registrar.</p>
              </div>

              <Checkbox label="Tinc menys de 14 anys" checked={esMenor} onChange={(e) => setEsMenor(e.target.checked)} />
              {esMenor && (
                <div className="fade-in rounded-md bg-info-bg p-3 text-sm text-primary">
                  <Checkbox
                    label="Confirmo que els meus pares o tutors legals donen el consentiment perquè em registri en aquesta plataforma."
                    checked={consentPares}
                    onChange={(e) => setConsentPares(e.target.checked)}
                  />
                </div>
              )}
            </>
          )}

          {tipus === 'tutor' && (
            <p className="fade-in rounded-md bg-info-bg p-3 text-sm text-primary">
              Un cop creat el compte, podràs crear els teus propis grups i codis de classe des de «El meu grup».
            </p>
          )}

          <Checkbox
            label={
              <span>
                Accepto la{' '}
                <Link to="/privacitat" target="_blank" className="text-primary underline">
                  política de privacitat
                </Link>
              </span>
            }
            checked={accepta}
            onChange={(e) => setAccepta(e.target.checked)}
          />

          {error && <p role="alert" className="fade-in text-sm text-warning">{error}</p>}
          <Button type="submit" className="w-full" disabled={carregant}>
            {carregant ? 'Creant el compte…' : 'Crea el compte'}
          </Button>
        </form>
      </Card>
    </div>
  )
}
