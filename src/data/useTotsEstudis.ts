import { useCallback, useEffect, useState } from 'react'
import { getTotsEstudis } from './loaders'
import type { EstudiQualsevol } from '../types/estudi'

/** Referència estable per a components que prefereixen un array buit a `null` mentre es carrega. */
export const ESTUDIS_BUIT: EstudiQualsevol[] = []

export function useTotsEstudis(): { estudis: EstudiQualsevol[] | null; error: string | null; retry: () => void } {
  const [estudis, setEstudis] = useState<EstudiQualsevol[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [intent, setIntent] = useState(0)

  useEffect(() => {
    let actiu = true
    setError(null)
    getTotsEstudis()
      .then((tots) => {
        if (actiu) setEstudis(tots)
      })
      .catch(() => {
        if (actiu) setError('No s\'han pogut carregar les dades dels estudis. Comprova la connexió i torna-ho a provar.')
      })
    return () => {
      actiu = false
    }
  }, [intent])

  const retry = useCallback(() => setIntent((i) => i + 1), [])

  return { estudis, error, retry }
}
