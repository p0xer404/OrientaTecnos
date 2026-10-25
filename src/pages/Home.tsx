import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { destiPerPerfil } from '../lib/nav'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { SkeletonHome } from '../components/ui/Skeleton'

const FAQ: { pregunta: string; resposta: string }[] = [
  {
    pregunta: 'D\'on surten les dades?',
    resposta: 'De fonts oficials: el Departament d\'Educació i les universitats catalanes (preinscripció universitària, oferta de FP, batxilleratos i ensenyaments artístics). Pots veure les fonts i la data d\'actualització al peu de pàgina.',
  },
  {
    pregunta: 'Fa servir intel·ligència artificial?',
    resposta: 'No. Totes les recomanacions es calculen amb regles i puntuacions deterministes a partir dels teus tests i preferències, sense cap xat ni model d\'IA.',
  },
  {
    pregunta: 'Qui pot veure les meves dades?',
    resposta: 'Només tu, el teu tutor/a d\'orientació i la direcció del centre poden veure els teus resultats i llistes. Pots descarregar-les o esborrar el teu compte en qualsevol moment des del teu perfil.',
  },
  {
    pregunta: 'Necessito cap aplicació?',
    resposta: 'No, funciona directament des del navegador, també al mòbil.',
  },
]

export default function Home() {
  const { perfil, carregant } = useAuth()
  const [obert, setObert] = useState<number | null>(0)

  if (carregant) return <SkeletonHome />
  if (perfil) return <Navigate to={destiPerPerfil(perfil)} replace />

  return (
    <div className="fade-in space-y-16">
      <section className="py-10 text-center">
        <p className="eyebrow">Escola Tecnos · Terrassa</p>
        <h1 className="mt-2 text-3xl font-bold text-ink sm:text-5xl">Tria els teus estudis amb confiança</h1>
        <p className="mx-auto mt-4 max-w-2xl text-muted">
          El cercador d'orientació acadèmica de l'Escola Tecnos: graus universitaris, FP, batxillerats i ensenyaments
          artístics de Catalunya, amb tests vocacionals i recomanacions sense intel·ligència artificial.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/cercador"><Button mida="lg">Explora el cercador</Button></Link>
          <Link to="/registre"><Button mida="lg" variant="secondary">Registra't com a alumne</Button></Link>
        </div>
        <div className="mx-auto mt-10 h-px w-24 bg-accent" />
      </section>

      <section className="stagger grid gap-6 sm:grid-cols-2">
        <Card className="border-t-4 border-t-primary transition-[box-shadow,transform] duration-150 hover:-translate-y-0.5 hover:shadow-md">
          <p className="eyebrow">Alumnes</p>
          <h2 className="mb-2 mt-1 text-xl font-semibold text-ink">Pensat per a tu</h2>
          <ul className="list-disc space-y-2 pl-5 text-sm text-muted marker:text-accent">
            <li>Un sol cercador per a graus, FP, batxillerat i artístics.</li>
            <li>Tests vocacionals originals (RIASEC, habilitats i preferències).</li>
            <li>Recomanacions amb "match" explicat, sense IA.</li>
            <li>Llistes il·limitades i comparador fins a 4 estudis.</li>
            <li>Guia acadèmica sobre preinscripció, notes de tall i beques.</li>
          </ul>
        </Card>
        <Card className="border-t-4 border-t-accent transition-[box-shadow,transform] duration-150 hover:-translate-y-0.5 hover:shadow-md">
          <p className="eyebrow">Orientadors</p>
          <h2 className="mb-2 mt-1 text-xl font-semibold text-ink">Pensat per al teu equip</h2>
          <ul className="list-disc space-y-2 pl-5 text-sm text-muted marker:text-accent">
            <li>Dashboard del grup amb perfils RIASEC i àrees d'interès.</li>
            <li>Fitxa individual de cada alumne/a amb notes privades.</li>
            <li>Catàleg d'alumnes amb cerca i filtres.</li>
            <li>Exportació a CSV per a reunions i informes.</li>
            <li>Accés limitat només als alumnes del teu grup.</li>
          </ul>
        </Card>
      </section>

      <section>
        <p className="eyebrow text-center">Dubtes habituals</p>
        <h2 className="mb-4 mt-1 text-center text-2xl font-semibold text-ink">Preguntes freqüents</h2>
        <div className="stagger mx-auto max-w-2xl space-y-2">
          {FAQ.map((f, i) => (
            <Card key={i} className="cursor-pointer transition-shadow duration-150 hover:shadow-md" onClick={() => setObert(obert === i ? null : i)}>
              <button className="flex w-full items-center justify-between text-left font-medium text-ink" aria-expanded={obert === i}>
                {f.pregunta}
                <span
                  aria-hidden="true"
                  className="flex h-5 w-5 shrink-0 items-center justify-center text-lg text-accent transition-transform duration-200"
                  style={{ transform: obert === i ? 'rotate(45deg)' : 'rotate(0deg)' }}
                >
                  +
                </span>
              </button>
              {obert === i && <p className="fade-in mt-2 text-sm text-muted">{f.resposta}</p>}
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
