import { getTotsEstudis } from '../data/loaders'

let fet = false

/**
 * Quan el navegador està ociós, avança la descàrrega de l'oferta d'estudis i del codi del cercador,
 * perquè en obrir el cercador o les recomanacions no calgui esperar-los. No es fa si l'usuari té
 * activat l'estalvi de dades.
 */
export function precarregarEnSegonPla(): void {
  if (fet) return
  fet = true
  const connexio = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
  if (connexio?.saveData) return

  const tasca = () => {
    getTotsEstudis().catch(() => {
      /* ja es reintentarà en obrir la pàgina */
    })
    import('../pages/Cercador').catch(() => {})
  }
  if ('requestIdleCallback' in window) window.requestIdleCallback(tasca, { timeout: 4000 })
  else setTimeout(tasca, 2500)
}
