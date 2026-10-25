import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'

export default function NotFound() {
  return (
    <div className="fade-in flex flex-col items-center gap-3 py-16 text-center">
      <p className="font-serif text-6xl font-semibold text-primary">404</p>
      <h1 className="text-xl font-semibold text-ink">No hem trobat aquesta pàgina</h1>
      <p className="text-sm text-muted">Potser l'enllaç és incorrecte o l'estudi ja no existeix.</p>
      <Link to="/">
        <Button>Torna a l'inici</Button>
      </Link>
    </div>
  )
}
