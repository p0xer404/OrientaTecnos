/**
 * Converteix una adreça de les dades oficials en un enllaç extern segur, o null si no ho és.
 * Algunes webs venen sense protocol ("www.ifp.es"): sense afegir-l'hi, el navegador les tracta
 * com a ruta relativa i porta a una pàgina interna inexistent. Només s'accepten http(s), així
 * que un valor com "javascript:..." mai no acaba en un href.
 */
export function urlExterna(valor: string | null | undefined): string | null {
  const net = valor?.trim()
  if (!net) return null
  const ambProtocol = /^https?:\/\//i.test(net) ? net : /^[a-z0-9-]+(\.[a-z0-9-]+)+(\/\S*)?$/i.test(net) ? `https://${net}` : null
  if (!ambProtocol) return null
  try {
    const u = new URL(ambProtocol)
    return u.protocol === 'http:' || u.protocol === 'https:' ? u.href : null
  } catch {
    return null
  }
}

/** Text curt per mostrar una web (sense protocol ni barra final). */
export function textWeb(url: string): string {
  return url.replace(/^https?:\/\//i, '').replace(/\/$/, '')
}

/** Separa un text de font com "Decret 96/2026 (...): ... https://..." en la part descriptiva i l'enllaç. */
export function separarFont(valor: string): { text: string; url: string | null } {
  const directa = /^\S+$/.test(valor.trim()) ? urlExterna(valor) : null
  if (directa) return { text: '', url: directa }
  const trobada = valor.match(/https?:\/\/\S+/i)?.[0]
  const url = trobada ? urlExterna(trobada.replace(/[).,;]+$/, '')) : null
  const text = (trobada ? valor.replace(trobada, '') : valor).trim().replace(/[\s.:]+$/, '')
  return { text, url }
}
