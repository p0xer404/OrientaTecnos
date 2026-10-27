import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Foto } from '../components/ui/Foto'
import { IconChevronDown } from '../components/ui/Icons'
import { ARTICLES_GUIA } from '../content/guia/articles'

export default function Guia() {
  const [obert, setObert] = useState<string | null>(null)

  return (
    <div className="fade-in space-y-5">
      <div className="relative isolate overflow-hidden rounded-2xl bg-[#2a1a0e]">
        <div className="absolute inset-0 -z-20">
          <Foto nom="guia" prioritaria posicio="50% 60%" className="zoom-lent" />
        </div>
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#2a1a0e]/90 via-[#2a1a0e]/70 to-[#2a1a0e]/30" aria-hidden="true" />
        <div className="px-6 py-10 sm:px-10 sm:py-14">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#f0c9a8]">Orientació</p>
          <h1 className="mt-1 text-2xl font-semibold text-[#faf5ea] sm:text-3xl">Guia acadèmica</h1>
          <p className="mt-2 max-w-xl text-sm text-[#efe6d6]">Articles clars i curts per entendre com funciona el procés d'accés als estudis postobligatoris. Toca un tema per desplegar-lo.</p>
        </div>
      </div>

      <div className="stagger space-y-3">
        {ARTICLES_GUIA.map((a, i) => {
          const desplegat = obert === a.slug
          return (
            <div key={a.slug} className={`overflow-hidden rounded-lg border bg-surface shadow-sm transition-[border-color,box-shadow] duration-200 ${desplegat ? 'border-primary/50 shadow-md' : 'border-line'}`}>
              <h2>
                <button
                  type="button"
                  id={`guia-boto-${a.slug}`}
                  aria-expanded={desplegat}
                  aria-controls={`guia-cos-${a.slug}`}
                  onClick={() => setObert(desplegat ? null : a.slug)}
                  className="flex w-full items-center gap-4 p-4 text-left sm:p-5"
                >
                  <span className="font-serif text-xl font-semibold text-accent" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                  <span className="flex-1">
                    <span className="block font-semibold text-ink">{a.titol}</span>
                    <span className="mt-0.5 block text-sm font-normal text-muted">{a.resum}</span>
                  </span>
                  <span className={`shrink-0 text-muted transition-transform duration-300 ${desplegat ? 'rotate-180' : ''}`}>
                    <IconChevronDown width={18} height={18} />
                  </span>
                </button>
              </h2>
              <div
                id={`guia-cos-${a.slug}`}
                role="region"
                aria-labelledby={`guia-boto-${a.slug}`}
                inert={!desplegat}
                className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${desplegat ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
              >
                <div className="overflow-hidden">
                  <div className="space-y-3 border-t border-line px-4 pb-5 pt-4 text-sm leading-relaxed text-ink sm:px-5 sm:pl-[4.25rem]">
                    {a.cos.map((paragraf, k) => (
                      <p key={k}>{paragraf}</p>
                    ))}
                    {a.enllaços && a.enllaços.length > 0 && (
                      <div>
                        <p className="mb-1 font-medium text-ink">Fonts oficials</p>
                        <ul className="space-y-1">
                          {a.enllaços.map((e) => (
                            <li key={e.url}>
                              <a href={e.url} target="_blank" rel="noreferrer" className="text-primary underline">{e.text}</a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <Link to={`/guia/${a.slug}`} className="inline-block text-xs text-muted underline hover:text-ink">Obre l'article en pàgina pròpia</Link>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
