import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { destiPerPerfil } from '../lib/nav'
import { Card } from '../components/ui/Card'
import { SkeletonHome } from '../components/ui/Skeleton'
import { Foto } from '../components/ui/Foto'
import type { NomImatge } from '../lib/imatges'

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

const ESTUDIS: { nom: NomImatge; tipus: string; titol: string; text: string }[] = [
  { nom: 'graus', tipus: 'grau', titol: 'Graus universitaris', text: 'Notes de tall, preus i places de les universitats catalanes.' },
  { nom: 'fp', tipus: 'fp', titol: 'Cicles formatius', text: 'FP bàsica, mitjana i superior amb mapa i dades de contacte.' },
  { nom: 'batxillerat', tipus: 'batxillerat', titol: 'Batxillerat', text: 'Centres propers, modalitats i nivell de demanda.' },
  { nom: 'artistic', tipus: 'artistic', titol: 'Ensenyaments artístics', text: 'Disseny, música, cinema, art dramàtic i dansa.' },
]

export default function Home() {
  const { perfil, carregant } = useAuth()
  const [obert, setObert] = useState<number | null>(0)

  if (carregant) return <SkeletonHome />
  if (perfil) return <Navigate to={destiPerPerfil(perfil)} replace />

  return (
    <div className="fade-in space-y-16">
      <section className="relative isolate overflow-hidden rounded-2xl bg-[#2a1a0e] text-center">
        <div className="absolute inset-0 -z-20">
          <Foto nom="hero" prioritaria />
        </div>
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#2a1a0e]/70 via-[#2a1a0e]/75 to-[#2a1a0e]/90" aria-hidden="true" />
        <div className="px-5 py-16 sm:px-10 sm:py-24">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#f0c9a8]">Escola Tecnos · Terrassa</p>
          <h1 className="mx-auto mt-3 max-w-3xl text-3xl font-bold text-[#faf5ea] sm:text-5xl">Tria els teus estudis amb confiança</h1>
          <p className="mx-auto mt-4 max-w-2xl text-[#efe6d6]">
            El cercador d'orientació acadèmica de l'Escola Tecnos: graus universitaris, FP, batxillerats i ensenyaments
            artístics de Catalunya, amb tests vocacionals i recomanacions sense intel·ligència artificial.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/cercador"
              className="inline-flex items-center justify-center rounded-md bg-[#faf5ea] px-5 py-3 text-base font-medium !text-[#3b2a1a] transition-[background-color,transform] duration-150 hover:bg-white active:scale-[0.98]"
            >
              Explora el cercador
            </Link>
            <Link
              to="/registre"
              className="inline-flex items-center justify-center rounded-md border border-[#faf5ea]/70 px-5 py-3 text-base font-medium !text-[#faf5ea] transition-[background-color,transform] duration-150 hover:bg-[#faf5ea]/15 active:scale-[0.98]"
            >
              Registra't com a alumne
            </Link>
          </div>
        </div>
      </section>

      <section>
        <p className="eyebrow text-center">Què pots estudiar</p>
        <h2 className="mb-6 mt-1 text-center text-2xl font-semibold text-ink">Quatre camins, un sol cercador</h2>
        <div className="stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ESTUDIS.map((e) => (
            <Link
              key={e.tipus}
              to={`/cercador?tipus=${e.tipus}`}
              className="group overflow-hidden rounded-lg border border-line bg-surface shadow-sm transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="skeleton aspect-[4/3] overflow-hidden rounded-none">
                <Foto nom={e.nom} className="transition-transform duration-500 group-hover:scale-105" />
              </div>
              <div className="p-4">
                <h3 className="text-base font-semibold text-ink">{e.titol}</h3>
                <p className="mt-1 text-sm text-muted">{e.text}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="stagger grid gap-6 sm:grid-cols-2">
        <Card className="overflow-hidden !p-0 border-t-4 border-t-primary transition-[box-shadow,transform] duration-150 hover:-translate-y-0.5 hover:shadow-md">
          <div className="skeleton aspect-[16/7] overflow-hidden rounded-none">
            <Foto nom="alumnes" />
          </div>
          <div className="p-4 sm:p-5">
            <p className="eyebrow">Alumnes</p>
            <h2 className="mb-2 mt-1 text-xl font-semibold text-ink">Pensat per a tu</h2>
            <ul className="list-disc space-y-2 pl-5 text-sm text-muted marker:text-accent">
              <li>Un sol cercador per a graus, FP, batxillerat i artístics.</li>
              <li>Tests vocacionals originals (RIASEC, habilitats i preferències).</li>
              <li>Recomanacions amb "match" explicat, sense IA.</li>
              <li>Llistes il·limitades i comparador fins a 4 estudis.</li>
              <li>Guia acadèmica sobre preinscripció, notes de tall i beques.</li>
            </ul>
          </div>
        </Card>
        <Card className="overflow-hidden !p-0 border-t-4 border-t-accent transition-[box-shadow,transform] duration-150 hover:-translate-y-0.5 hover:shadow-md">
          <div className="skeleton aspect-[16/7] overflow-hidden rounded-none">
            <Foto nom="orientadors" className="object-[50%_35%]" />
          </div>
          <div className="p-4 sm:p-5">
            <p className="eyebrow">Orientadors</p>
            <h2 className="mb-2 mt-1 text-xl font-semibold text-ink">Pensat per al teu equip</h2>
            <ul className="list-disc space-y-2 pl-5 text-sm text-muted marker:text-accent">
              <li>Dashboard del grup amb perfils RIASEC i àrees d'interès.</li>
              <li>Fitxa individual de cada alumne/a amb notes privades.</li>
              <li>Catàleg d'alumnes amb cerca i filtres.</li>
              <li>Exportació a CSV per a reunions i informes.</li>
              <li>Accés limitat només als alumnes del teu grup.</li>
            </ul>
          </div>
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
