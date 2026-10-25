import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'
import { IconChevronDown } from '../ui/Icons'

export function UserMenu() {
  const { perfil, logout } = useAuth()
  const navigate = useNavigate()
  const [obert, setObert] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!obert) return
    function onClickFora(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setObert(false)
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setObert(false)
    }
    document.addEventListener('mousedown', onClickFora)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onClickFora)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [obert])

  if (!perfil) return null

  async function sortir() {
    setObert(false)
    await logout()
    navigate('/')
  }

  const inicial = perfil.nom.trim().charAt(0).toUpperCase() || '?'

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setObert((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={obert}
        className="flex items-center gap-2 rounded-md border border-line bg-surface py-1 pl-1 pr-3 text-sm font-medium text-ink transition-colors hover:bg-canvas"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary font-serif text-xs text-primary-contrast" aria-hidden="true">
          {inicial}
        </span>
        <span className="max-w-[9rem] truncate">{perfil.nom}</span>
        <IconChevronDown className="text-muted" />
      </button>

      {obert && (
        <div
          role="menu"
          className="fade-in absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-md border border-line bg-surface py-1 shadow-lg"
        >
          {perfil.rol === 'alumne' && (
            <Link
              to="/perfil"
              role="menuitem"
              onClick={() => setObert(false)}
              className="block px-4 py-2 text-sm text-ink hover:bg-canvas"
            >
              El meu perfil
            </Link>
          )}
          <button
            role="menuitem"
            onClick={sortir}
            className="block w-full px-4 py-2 text-left text-sm text-warning hover:bg-canvas"
          >
            Tanca la sessió
          </button>
        </div>
      )}
    </div>
  )
}
