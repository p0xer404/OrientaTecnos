import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { repo } from '../lib/repo'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { SkeletonAdmin } from '../components/ui/Skeleton'
import type { Grup, Perfil } from '../types/domain'

export default function Admin() {
  const [tutors, setTutors] = useState<Perfil[] | null>(null)
  const [grups, setGrups] = useState<Grup[]>([])
  const [alumnes, setAlumnes] = useState<Perfil[]>([])
  const [error, setError] = useState<string | null>(null)

  async function carregar() {
    try {
      const [t, g, a] = await Promise.all([repo.totsElsTutors(), repo.totsElsGrups(), repo.totsElsAlumnes()])
      setGrups(g)
      setAlumnes(a)
      setTutors(t)
    } catch {
      setError("No s'han pogut carregar les dades. Recarrega la pàgina.")
      setTutors((actual) => actual ?? [])
    }
  }

  async function ambErrors(accio: () => Promise<void>) {
    setError(null)
    try {
      await accio()
      await carregar()
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : "No s'ha pogut completar l'acció. Torna-ho a provar.")
    }
  }

  useEffect(() => {
    carregar()
  }, [])

  if (!tutors) {
    return <div className="fade-in"><SkeletonAdmin /></div>
  }

  async function regenerarCodi(grupId: string) {
    if (!confirm("El codi antic deixarà de funcionar per a nous registres. Vols generar-ne un de nou?")) return
    await ambErrors(() => repo.regenerarCodiInvitacio(grupId).then(() => undefined))
  }

  async function eliminarGrup(grupId: string) {
    if (!confirm('Vols eliminar aquest grup? Els alumnes deixaran de tenir-hi assignació.')) return
    await ambErrors(() => repo.eliminarGrup(grupId))
  }

  async function donarBaixa(alumneId: string, nom: string) {
    if (!confirm(`Vols donar de baixa ${nom} i esborrar totes les seves dades? Aquesta acció no es pot desfer.`)) return
    await ambErrors(() => repo.donarDeBaixaAlumne(alumneId))
  }

  return (
    <div className="fade-in space-y-6">
      <div>
        <p className="eyebrow">Administració</p>
        <h1 className="mt-1 text-2xl font-semibold text-ink">Gestió del centre</h1>
        <p className="text-sm text-muted">Els tutors i els alumnes creen el seu propi compte des de «Registra't»; aquí només hi ha una vista general i la baixa d'alumnes.</p>
        {error && <p role="alert" className="fade-in mt-2 text-sm text-warning">{error}</p>}
      </div>

      <div className="stagger grid gap-4 sm:grid-cols-3">
        <Card className="border-t-4 border-t-primary text-center">
          <p className="font-serif text-3xl font-semibold text-ink">{tutors.length}</p>
          <p className="text-sm text-muted">Tutors/es</p>
        </Card>
        <Card className="border-t-4 border-t-accent text-center">
          <p className="font-serif text-3xl font-semibold text-ink">{grups.length}</p>
          <p className="text-sm text-muted">Grups</p>
        </Card>
        <Card className="border-t-4 border-t-primary text-center">
          <p className="font-serif text-3xl font-semibold text-ink">{alumnes.length}</p>
          <p className="text-sm text-muted">Alumnes</p>
        </Card>
      </div>

      <Card>
        <h2 className="mb-3 font-semibold text-ink">Tutors/es</h2>
        {tutors.length === 0 ? (
          <p className="text-sm text-muted">Encara no s'ha registrat cap tutor/a.</p>
        ) : (
          <ul className="space-y-1 text-sm">
            {tutors.map((t) => <li key={t.id} className="text-ink">{t.nom} <span className="text-muted">· {t.email}</span></li>)}
          </ul>
        )}
      </Card>

      <Card>
        <h2 className="mb-3 font-semibold text-ink">Grups i codis d'invitació</h2>
        {grups.length === 0 ? (
          <p className="text-sm text-muted">Encara no hi ha cap grup creat (els tutors en creen des de «El meu grup»).</p>
        ) : (
          <div className="space-y-2">
            {grups.map((g) => (
              <div key={g.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-canvas px-3 py-2 transition-colors hover:bg-info-bg">
                <div>
                  <p className="text-sm font-medium text-ink">{g.nom} <span className="text-muted">· {g.curs}</span></p>
                  <p className="text-xs text-muted">Tutor/a: {tutors.find((t) => t.id === g.tutorId)?.nom ?? '—'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tipus="info">Codi: {g.codiInvitacio}</Badge>
                  <Button mida="sm" variant="secondary" onClick={() => regenerarCodi(g.id)}>Regenera el codi</Button>
                  <Button mida="sm" variant="danger" onClick={() => eliminarGrup(g.id)}>Elimina</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="overflow-x-auto">
        <h2 className="mb-3 font-semibold text-ink">Alumnes ({alumnes.length})</h2>
        {alumnes.length === 0 ? (
          <p className="text-sm text-muted">Encara no s'ha registrat cap alumne.</p>
        ) : (
          <table className="w-full min-w-[480px] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-muted">
                <th className="py-2">Nom</th>
                <th className="py-2">Grup</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {alumnes.map((a) => (
                <tr key={a.id} className="border-b border-line transition-colors hover:bg-canvas">
                  <td className="py-2 text-ink"><Link to={`/orientador/alumne/${a.id}`} className="hover:text-primary hover:underline">{a.nom}</Link></td>
                  <td className="py-2 text-muted">{grups.find((g) => g.id === a.groupId)?.nom ?? '—'}</td>
                  <td className="py-2"><Button mida="sm" variant="danger" onClick={() => donarBaixa(a.id, a.nom)}>Dona de baixa</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  )
}
