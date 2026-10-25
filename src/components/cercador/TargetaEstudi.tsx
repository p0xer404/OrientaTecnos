import { Link } from 'react-router-dom'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { formatKm, formatNota, formatPreu } from '../../lib/format'
import type { EstudiQualsevol } from '../../types/estudi'

const ETIQUETA_TIPUS: Record<EstudiQualsevol['tipus'], string> = {
  grau: 'Grau universitari',
  fp: 'Formació Professional',
  batxillerat: 'Batxillerat',
  artistic: 'Ensenyament artístic',
}

interface Props {
  estudi: EstudiQualsevol
  onAfegirALlista?: () => void
  onAfegirAComparador?: () => void
  esAlComparador?: boolean
  etiquetaMatch?: string
  explicacioMatch?: string
}

export function TargetaEstudi({ estudi, onAfegirALlista, onAfegirAComparador, esAlComparador, etiquetaMatch, explicacioMatch }: Props) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-line bg-surface p-4 shadow-sm transition-[box-shadow,transform] duration-150 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs font-medium text-muted">{ETIQUETA_TIPUS[estudi.tipus]}</p>
          <Link to={`/estudi/${estudi.id}`} className="font-serif text-base font-semibold text-ink hover:text-primary">
            {estudi.nom}
          </Link>
          <p className="text-sm text-muted">{estudi.subtitol || estudi.centre}</p>
        </div>
        {etiquetaMatch && <Badge tipus={etiquetaMatch === 'Match' ? 'accent' : etiquetaMatch === 'Bona opció' ? 'success' : 'info'}>{etiquetaMatch}</Badge>}
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        <Badge>{estudi.municipi}</Badge>
        <Badge>{estudi.titularitat}</Badge>
        {estudi.tipus === 'grau' && estudi.notaTall2026 != null && <Badge tipus="info">Nota de tall {formatNota(estudi.notaTall2026)}</Badge>}
        {estudi.kmTerrassa != null && <Badge>{formatKm(estudi.kmTerrassa)} de Terrassa</Badge>}
        {estudi.destacat && <Badge tipus="accent">Destacat</Badge>}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <p className="font-medium text-ink">{formatPreu(estudi.preu)}</p>
        {estudi.places != null && <p className="text-muted">{estudi.places} places</p>}
      </div>

      {explicacioMatch && <p className="rounded-lg bg-info-bg px-3 py-2 text-xs text-primary">{explicacioMatch}</p>}

      <div className="mt-auto flex flex-wrap gap-2 pt-1">
        <Link
          to={`/estudi/${estudi.id}`}
          className="inline-flex items-center justify-center gap-2 rounded-md border border-line bg-surface px-3 py-1.5 text-sm font-medium text-ink transition-colors duration-150 hover:bg-canvas"
        >
          Veure fitxa
        </Link>
        {onAfegirALlista && (
          <Button variant="secondary" mida="sm" onClick={onAfegirALlista}>
            + Llista
          </Button>
        )}
        {onAfegirAComparador && (
          <Button variant={esAlComparador ? 'primary' : 'secondary'} mida="sm" onClick={onAfegirAComparador}>
            {esAlComparador ? '✓ Al comparador' : '+ Comparar'}
          </Button>
        )}
      </div>
    </div>
  )
}
