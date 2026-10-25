import { Link } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { ARTICLES_GUIA } from '../content/guia/articles'

export default function Guia() {
  return (
    <div className="fade-in space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Guia acadèmica</h1>
        <p className="text-sm text-muted">Articles clars i curts per entendre com funciona el procés d'accés als estudis postobligatoris.</p>
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
