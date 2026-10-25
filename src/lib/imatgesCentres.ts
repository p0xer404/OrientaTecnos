import { useEffect, useState } from 'react'
import type { Imatge } from './imatges'
import type { EstudiQualsevol } from '../types/estudi'

interface EntradaCentre {
  f: string
  w: number
  h: number
  font: string
}
type IndexCentres = Record<string, EntradaCentre[]>

/** Mateix criteri que scripts/fetch-centre-images.mjs: clau d'una web (amb tram de camí als hostings compartits). */
const HOSTS_COMPARTITS = new Set(['agora.xtec.cat', 'xtec.cat', 'blogs.xtec.cat', 'fedac.cat', 'dipta.cat', 'sites.google.com'])

function clauWeb(url: string | null | undefined): string | null {
  if (!url) return null
  try {
    const u = new URL(/^https?:\/\//i.test(url) ? url : `http://${url}`)
    const host = u.hostname.toLowerCase().replace(/^www\./, '')
    if (!HOSTS_COMPARTITS.has(host)) return host
    const tram = u.pathname.split('/').filter(Boolean)[0]
    return tram ? `${host}/${tram.replace(/\.php$/, '').toLowerCase()}` : null
  } catch {
    return null
  }
}

export function clauCentreDe(e: EstudiQualsevol): string | null {
  if (e.tipus === 'grau') return `uni:${e.raw.universidad}`
  return clauWeb(e.raw.web)
}

let promesa: Promise<IndexCentres> | null = null

function carregarIndex(): Promise<IndexCentres> {
  promesa ??= fetch('/media/centres/index.json')
    .then((r) => (r.ok ? (r.json() as Promise<IndexCentres>) : {}))
    .catch(() => ({}))
  return promesa
}

/** Fotos oficials de les webs de centres i universitats (buit mentre carrega o si no hi ha l'índex). */
export function useImatgesCentres(): IndexCentres | null {
  const [index, setIndex] = useState<IndexCentres | null>(null)
  useEffect(() => {
    let viu = true
    carregarIndex().then((i) => viu && setIndex(i))
    return () => {
      viu = false
    }
  }, [])
  return index
}

function hash(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return h
}

/** Foto de la web del centre d'aquest estudi, si n'hi ha; si no, null (i s'usarà una d'estoc). */
export function imatgeDelCentre(e: EstudiQualsevol, index: IndexCentres | null): Imatge | null {
  if (!index) return null
  const clau = clauCentreDe(e)
  const opcions = clau ? index[clau] : undefined
  if (!opcions?.length) return null
  const o = opcions[hash(e.id) % opcions.length]
  let host = ''
  try {
    host = new URL(o.font).hostname.replace(/^www\./, '')
  } catch {
    host = o.font
  }
  return { fitxer: o.f, amplada: o.w, alcada: o.h, autor: host, font: o.font, titol: 'Foto de la web del centre', delCentre: true }
}
