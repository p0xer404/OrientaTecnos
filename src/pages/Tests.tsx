import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { repo } from '../lib/repo'
import { useAuth } from '../context/useAuth'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import type { TestId } from '../types/domain'

const TESTS: { id: TestId; nom: string; descripcio: string; durada: string }[] = [
  { id: 'riasec', nom: "Test d'interessos (RIASEC)", descripcio: '48 afirmacions per descobrir els teus perfils d\'interès dominants: Realista, Investigador, Artístic, Social, Emprenedor i Convencional.', durada: '10-15 min' },
  { id: 'habilitats', nom: 'Test d\'habilitats percebudes', descripcio: '30 preguntes sobre com et sents davant de tasques numèriques, verbals, espacials, socials, creatives, manuals i organitzatives.', durada: '8-10 min' },
  { id: 'preferencies', nom: 'Test de preferències pràctiques', descripcio: '15 preguntes sobre universitat vs. FP, públic vs. privat, pressupost, disposició a desplaçar-te i importància de la nota i l\'idioma.', durada: '5 min' },
]

const VORES = ['border-t-primary', 'border-t-accent', 'border-t-primary']

export default function Tests() {
  const { perfil } = useAuth()
  const [fets, setFets] = useState<Set<TestId>>(new Set())

  useEffect(() => {
    if (!perfil) return
    repo.resultatsDeLAlumne(perfil.id).then((resultats) => setFets(new Set(resultats.map((r) => r.testId))))
  }, [perfil])

  return (
    <div className="fade-in space-y-5">
      <div>
        <p className="eyebrow">Coneix-te millor</p>
        <h1 className="mt-1 text-2xl font-semibold text-ink">Tests vocacionals</h1>
        <p className="text-sm text-muted">Tests originals, sense intel·ligència artificial: els resultats es calculen amb regles i puntuacions, i els veu el teu tutor/a.</p>
      </div>
      <div className="stagger grid gap-4 sm:grid-cols-3">
        {TESTS.map((t, i) => (
          <Card key={t.id} className={`flex flex-col border-t-4 ${VORES[i]}`}>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-semibold text-ink">{t.nom}</h2>
              {fets.has(t.id) && <Badge tipus="success">Fet</Badge>}
            </div>
            <p className="flex-1 text-sm text-muted">{t.descripcio}</p>
            <p className="mt-2 text-xs font-medium uppercase tracking-wide text-muted">Durada aprox.: {t.durada}</p>
            <Link to={`/tests/${t.id}`} className="mt-3">
              <Button className="w-full">{fets.has(t.id) ? 'Torna a fer-lo' : 'Comença'}</Button>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  )
}
