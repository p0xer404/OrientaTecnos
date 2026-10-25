import { Card } from '../components/ui/Card'

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
      </Card>
    </div>
  )
}
