import { Link, useParams } from 'react-router-dom'
import { ARTICLES_GUIA } from '../content/guia/articles'
import { Card } from '../components/ui/Card'
import NotFound from './NotFound'

export default function GuiaArticle() {
  const { slug } = useParams()
  const article = ARTICLES_GUIA.find((a) => a.slug === slug)
  if (!article) return <NotFound />

  return (
    <div className="fade-in mx-auto max-w-2xl space-y-4">
      <Link to="/guia" className="text-sm text-primary underline">← Tornar a la guia</Link>
      <h1 className="text-2xl font-semibold text-ink">{article.titol}</h1>
      <Card className="space-y-4 text-sm leading-relaxed text-ink">
        {article.cos.map((paragraf, i) => (
          <p key={i}>{paragraf}</p>
        ))}
        {article.enllaços && article.enllaços.length > 0 && (
          <div className="border-t border-line pt-3">
            <p className="mb-1 font-medium text-ink">Fonts oficials</p>
            <ul className="space-y-1">
              {article.enllaços.map((e) => (
                <li key={e.url}>
                  <a href={e.url} target="_blank" rel="noreferrer" className="text-primary underline">{e.text}</a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>
    </div>
  )
}
