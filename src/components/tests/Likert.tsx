const ETIQUETES = ["Gens d'acord", 'Poc d\'acord', 'Neutre', "D'acord", 'Totalment d\'acord']

export function Likert({ id, text, valor, onCanvia }: { id: string; text: string; valor: number | undefined; onCanvia: (v: number) => void }) {
  return (
    <fieldset className="border-b border-line py-3 last:border-0">
      <legend className="mb-2 text-sm text-ink">{text}</legend>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={text}>
        {ETIQUETES.map((etiqueta, i) => {
          const puntuacio = i + 1
          const seleccionat = valor === puntuacio
          return (
            <label
              key={puntuacio}
              className={`cursor-pointer rounded-md border px-2.5 py-1.5 text-xs transition-colors ${seleccionat ? 'border-primary bg-info-bg text-primary' : 'border-line text-muted hover:bg-canvas'}`}
            >
              <input
                type="radio"
                name={id}
                value={puntuacio}
                checked={seleccionat}
                onChange={() => onCanvia(puntuacio)}
                className="sr-only"
              />
              {puntuacio}. {etiqueta}
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
