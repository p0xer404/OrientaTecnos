import { useState } from 'react'
import { IMATGES, type Imatge, type NomImatge } from '../../lib/imatges'

interface Props {
  /** Foto principal de la web (per nom) o bé una foto concreta de la galeria. */
  nom?: NomImatge
  imatge?: Imatge
  /** Text alternatiu; buit (per defecte) si la foto és purament decorativa. */
  alt?: string
  className?: string
  /** Carrega-la de seguida (fotos que es veuen sense fer scroll). */
  prioritaria?: boolean
  /** Valor CSS d'object-position (p. ex. '50% 30%') per encuadrar la foto. */
  posicio?: string
}

/** Foto d'estoc amb fons d'esquelet i aparició suau en carregar-se; omple el contenidor pare. */
export function Foto({ nom, imatge, alt = '', className = '', prioritaria = false, posicio }: Props) {
  const [carregada, setCarregada] = useState(false)
  const img = imatge ?? IMATGES[nom ?? 'hero']
  return (
    <img
      src={img.fitxer}
      width={img.amplada}
      height={img.alcada}
      alt={alt}
      loading={prioritaria ? 'eager' : 'lazy'}
      fetchPriority={prioritaria ? 'high' : 'auto'}
      decoding="async"
      style={posicio ? { objectPosition: posicio } : undefined}
      onLoad={() => setCarregada(true)}
      ref={(el) => {
        if (el?.complete && el.naturalWidth > 0) setCarregada(true)
      }}
      className={`h-full w-full object-cover transition-opacity duration-500 ${carregada ? 'opacity-100' : 'opacity-0'} ${className}`}
    />
  )
}
