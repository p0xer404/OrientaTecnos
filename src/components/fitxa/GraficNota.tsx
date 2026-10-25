import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatNota } from '../../lib/format'
import { TaulaAccessible } from '../ui/TaulaAccessible'

export function GraficNota({ dades }: { dades: { curs: string; nota: number | null }[] }) {
  const valides = dades.filter((d) => d.nota != null)
  if (valides.length < 2) return <p className="text-sm text-muted">No hi ha prou dades històriques per mostrar l'evolució.</p>

  return (
    <div className="h-56 w-full" role="img" aria-label="Gràfic d'evolució de la nota de tall per curs; els valors exactes són a la taula de sota.">
      <ResponsiveContainer>
        <LineChart data={dades} margin={{ top: 8, right: 16, bottom: 0, left: -16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line)" />
          <XAxis dataKey="curs" stroke="var(--color-muted)" fontSize={12} />
          <YAxis domain={[5, 14]} stroke="var(--color-muted)" fontSize={12} />
          <Tooltip
            formatter={(valor) => formatNota(Number(valor))}
            contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-line)', borderRadius: 8, fontSize: 13 }}
          />
          <Line type="monotone" dataKey="nota" stroke="var(--color-primary)" strokeWidth={2} dot connectNulls />
        </LineChart>
      </ResponsiveContainer>
      <TaulaAccessible titol="Evolució de la nota de tall" columnes={['Curs', 'Nota de tall']} files={dades.map((d) => [d.curs, d.nota != null ? formatNota(d.nota) : '—'])} />
    </div>
  )
}
