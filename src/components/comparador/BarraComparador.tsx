import { useLocation, useNavigate } from 'react-router-dom'
import { buidarComparador, useComparador } from '../../lib/comparador'
import { Button } from '../ui/Button'

/** Barra flotant que es veu des de qualsevol pàgina mentre hi hagi estudis al
 * comparador, perquè sigui evident que "+ Comparar" ha fet alguna cosa. */
export function BarraComparador() {
  const items = useComparador()
  const navigate = useNavigate()
  const location = useLocation()

  if (items.length === 0 || location.pathname === '/comparar') return null

  return (
    <div className="entra-baix fixed inset-x-0 bottom-4 z-30 flex justify-center px-4" role="status">
      <div className="flex items-center gap-3 rounded-md border border-line bg-surface px-4 py-2.5 shadow-lg">
        <span className="text-sm text-ink">
          <strong>{items.length}</strong> {items.length === 1 ? 'estudi' : 'estudis'} al comparador
        </span>
        <Button mida="sm" variant="ghost" onClick={buidarComparador}>
          Buida
        </Button>
        <Button mida="sm" onClick={() => navigate('/comparar')}>
          Veure comparador
        </Button>
      </div>
    </div>
  )
}
