import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMeta } from '../../data/loaders'
import { formatData } from '../../lib/format'
import type { MetaRaw } from '../../types/raw'

export function Footer() {
  const [meta, setMeta] = useState<MetaRaw | null>(null)
  const [errorMeta, setErrorMeta] = useState(false)

  useEffect(() => {
    getMeta().then(setMeta).catch(() => setErrorMeta(true))
  }, [])

  return (
    <footer className="mt-auto border-t border-line bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-muted">
        <div className="grid gap-6 sm:grid-cols-3">
          <div>
            <p className="mb-2 font-semibold text-ink">Orienta Tecnos</p>
            <p>Orientació acadèmica per a l'alumnat de l'Escola Tecnos (Terrassa).</p>
          </div>
          <div>
            <p className="mb-2 font-semibold text-ink">Enllaços</p>
            <ul className="space-y-1">
              <li><Link to="/privacitat" className="hover:text-ink">Política de privacitat</Link></li>
              <li><Link to="/avis-legal" className="hover:text-ink">Avís legal</Link></li>
              <li><a href="https://preinscripcio.gencat.cat" target="_blank" rel="noreferrer" className="hover:text-ink">Preinscripció (Generalitat)</a></li>
              <li><a href="https://universitats.gencat.cat" target="_blank" rel="noreferrer" className="hover:text-ink">Universitats de Catalunya</a></li>
              <li><a href="mailto:paugual@escolatecnos.cat" className="hover:text-ink">Contacte: paugual@escolatecnos.cat</a></li>
            </ul>
          </div>
          <div>
            <p className="mb-2 font-semibold text-ink">Fonts de dades</p>
            {meta ? (
              <>
                <p>Dades actualitzades el {formatData(meta.generado)} (curs {meta.curso}).</p>
                <p>{meta.num_grados} graus · {meta.num_fp} ofertes de FP · {meta.num_bachilleratos} batxilleratos · {meta.num_artisticos} ensenyaments artístics.</p>
                <p className="mt-1">Font: Departament d'Educació i universitats.gencat.cat.</p>
              </>
            ) : errorMeta ? (
              <p>Font: Departament d'Educació i universitats.gencat.cat.</p>
            ) : (
              <p>Carregant informació de les fonts…</p>
            )}
          </div>
        </div>
      </div>
    </footer>
  )
}
