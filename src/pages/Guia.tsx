import { Link } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { Foto } from '../components/ui/Foto'
import { ARTICLES_GUIA } from '../content/guia/articles'

export default function Guia() {
  return (
    <div className="fade-in space-y-5">
      <div className="relative isolate overflow-hidden rounded-2xl bg-[#2a1a0e]">
        <div className="absolute inset-0 -z-20">
          <Foto nom="guia" prioritaria className="object-[50%_60%]" />
        </div>
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#2a1a0e]/90 via-[#2a1a0e]/70 to-[#2a1a0e]/30" aria-hidden="true" />
        <div className="px-6 py-10 sm:px-10 sm:py-14">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#f0c9a8]">Orientació</p>
          <h1 className="mt-1 text-2xl font-semibold text-[#faf5ea] sm:text-3xl">Guia acadèmica</h1>
          <p className="mt-2 max-w-xl text-sm text-[#efe6d6]">Articles clars i curts per entendre com funciona el procés d'accés als estudis postobligatoris.</p>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {ARTICLES_GUIA.map((a) => (
          <Link key={a.slug} to={`/guia/${a.slug}`}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <h2 className="font-semibold text-ink">{a.titol}</h2>
              <p className="mt-1 text-sm text-muted">{a.resum}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
