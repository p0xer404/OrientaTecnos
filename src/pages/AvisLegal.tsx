import { Card } from '../components/ui/Card'
import { IMATGES } from '../lib/imatges'

export default function AvisLegal() {
  return (
    <div className="fade-in mx-auto max-w-2xl space-y-6">
      <div>
        <p className="eyebrow">Document legal</p>
        <h1 className="mt-1 text-2xl font-semibold text-ink">Avís legal</h1>
      </div>
      <Card className="space-y-4 border-t-4 border-t-primary text-sm text-ink">
        <p>Aquesta plataforma és una eina interna d'orientació acadèmica de l'Escola Tecnos (Terrassa), sense ànim de lucre i d'ús exclusiu per al seu alumnat, famílies i equip d'orientació.</p>
        <p>
          Les dades d'estudis (graus, FP, batxillerats i ensenyaments artístics) provenen de fonts oficials de la Generalitat de Catalunya i de les pròpies universitats; consulteu el peu de pàgina per veure'n el detall i la data d'actualització.
        </p>
        <p>
          Aquesta plataforma no substitueix la informació oficial de preinscripció. Davant de qualsevol dubte, consulteu sempre{' '}
          <a href="https://preinscripcio.gencat.cat" target="_blank" rel="noreferrer" className="text-primary underline">preinscripcio.gencat.cat</a>.
        </p>
        <p>
          Contacte:{' '}
          <a href="mailto:paugual@escolatecnos.cat" className="text-primary underline">paugual@escolatecnos.cat</a>.
        </p>
      </Card>
      <Card>
        <h2 className="text-base font-semibold text-ink">Crèdits de les imatges</h2>
        <p className="mt-1 text-sm text-muted">
          Les fotografies són d'estoc, publicades a Freepik (Magnific) amb llicència gratuïta que exigeix citar-ne l'autoria. S'allotgen en aquest mateix servidor.
        </p>
        <ul className="mt-3 space-y-1 text-sm text-muted">
          {Object.values(IMATGES).map((i) => (
            <li key={i.fitxer}>
              <a href={i.font} target="_blank" rel="noreferrer" className="text-primary underline">{i.titol}</a>
              {' '}— {i.autor} / Freepik
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
