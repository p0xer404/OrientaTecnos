import { useState } from 'react'
import { IMATGES, type NomImatge } from '../../lib/imatges'

interface Props {
  nom: NomImatge
  /** Text alternatiu; buit (per defecte) si la foto és purament decorativa. */
  alt?: string
  className?: string
  /** Carrega-la de seguida (fotos que es veuen sense fer scroll). */
  prioritaria?: boolean
}

/** Foto d'estoc amb fons d'esquelet i aparició suau en carregar-se; omple el contenidor pare. */
export function Foto({ nom, alt = '', className = '', prioritaria = false }: Props) {
  const [carregada, setCarregada] = useState(false)
  const img = IMATGES[nom]
  return (
    <img
      src={img.fitxer}
      width={img.amplada}
      height={img.alcada}
      alt={alt}
      loading={prioritaria ? 'eager' : 'lazy'}
      fetchPriority={prioritaria ? 'high' : 'auto'}
      decoding="async"
      onLoad={() => setCarregada(true)}
      ref={(el) => {
        if (el?.complete && el.naturalWidth > 0) setCarregada(true)
      }}
      className={`h-full w-full object-cover transition-opacity duration-500 ${carregada ? 'opacity-100' : 'opacity-0'} ${className}`}
    />
  )
}
