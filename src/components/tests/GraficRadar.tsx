import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from 'recharts'
import { TaulaAccessible } from '../ui/TaulaAccessible'

export function GraficRadar({ dades }: { dades: { etiqueta: string; valor: number }[] }) {
  return (
    <div className="h-72 w-full" role="img" aria-label="Gràfic radar amb les puntuacions per categoria; els valors exactes són a la taula de sota.">
      <ResponsiveContainer>
        <RadarChart data={dades} outerRadius="75%">
          <PolarGrid stroke="var(--color-line)" />
          <PolarAngleAxis dataKey="etiqueta" tick={{ fill: 'var(--color-muted)', fontSize: 12 }} />
          <Radar dataKey="valor" stroke="var(--color-primary)" fill="var(--color-primary)" fillOpacity={0.35} />
        </RadarChart>
      </ResponsiveContainer>
      <TaulaAccessible titol="Puntuacions per categoria" columnes={['Categoria', 'Puntuació']} files={dades.map((d) => [d.etiqueta, d.valor])} />
    </div>
  )
}
