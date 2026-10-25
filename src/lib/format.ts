const numberFmt = new Intl.NumberFormat('ca-ES')
const decimalFmt = new Intl.NumberFormat('ca-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const notaFmt = new Intl.NumberFormat('ca-ES', { minimumFractionDigits: 3, maximumFractionDigits: 3 })
const currencyFmt = new Intl.NumberFormat('ca-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })
const dateFmt = new Intl.DateTimeFormat('ca-ES', { day: 'numeric', month: 'long', year: 'numeric' })

export function formatNumero(n: number): string {
  return numberFmt.format(n)
}

export function formatDecimal(n: number): string {
  return decimalFmt.format(n)
}

/** Nota de tall/admissió amb 3 decimals, com surt a la preinscripció (ex: 7,766). */
export function formatNota(n: number): string {
  if (n <= 5) return `${notaFmt.format(n)} (sense tall)`
  return notaFmt.format(n)
}

export function formatPreu(n: number | null): string {
  if (n == null) return 'Consulta-ho al centre'
  return currencyFmt.format(n)
}

export function formatData(iso: string): string {
  return dateFmt.format(new Date(iso))
}

export function formatKm(km: number | null): string {
  if (km == null) return 'Consulta-ho al centre'
  return `${formatDecimal(km).replace(',00', '')} km`
}

export function formatPercentatge(fraccio: number): string {
  return `${Math.round(fraccio * 100)} %`
}
