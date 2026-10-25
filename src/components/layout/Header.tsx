import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'
import { useTheme } from '../../context/useTheme'
import { destiPerPerfil } from '../../lib/nav'
import { Button } from '../ui/Button'
import { IconMenu, LogoMark } from '../ui/Icons'
import { ThemeSwitch } from './ThemeSwitch'
import { UserMenu } from './UserMenu'

const ENLLAÇ =
  'whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium text-muted transition-colors duration-150 hover:bg-canvas hover:text-ink aria-[current=page]:bg-info-bg aria-[current=page]:text-primary'

export function Header() {
  const { perfil, logout } = useAuth()
  const { tema } = useTheme()
  const navigate = useNavigate()
  const [menuObert, setMenuObert] = useState(false)

  useEffect(() => {
    if (!menuObert) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setMenuObert(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [menuObert])

  async function sortir() {
    await logout()
    setMenuObert(false)
    navigate('/')
  }

  const enllaçosAlumne = [
    { to: '/cercador', text: 'Cercador' },
    { to: '/tests', text: 'Tests' },
    { to: '/recomanacions', text: 'Recomanacions' },
    { to: '/llistes', text: 'Llistes' },
    { to: '/comparar', text: 'Comparador' },
    { to: '/guia', text: 'Guia' },
  ]
  const enllaçosTutor = [
    { to: '/cercador', text: 'Cercador' },
    { to: '/orientador', text: 'El meu grup' },
    { to: '/guia', text: 'Guia' },
  ]
  const enllaçosAdmin = [
    { to: '/cercador', text: 'Cercador' },
    { to: '/admin', text: 'Gestió' },
    { to: '/guia', text: 'Guia' },
  ]
  const enllaçosPublics = [
    { to: '/cercador', text: 'Cercador' },
    { to: '/guia', text: 'Guia' },
  ]

  const enllaços = !perfil
    ? enllaçosPublics
    : perfil.rol === 'alumne'
      ? enllaçosAlumne
      : perfil.rol === 'tutor'
        ? enllaçosTutor
        : enllaçosAdmin

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3">
        <Link to={destiPerPerfil(perfil)} className="flex shrink-0 items-center gap-2 font-serif text-lg font-semibold text-ink">
          <LogoMark className="text-primary" />
          <span>Orienta Tecnos</span>
        </Link>

        <nav aria-label="Navegació principal" className="hidden items-center gap-1 xl:flex">
          {enllaços.map((e) => (
            <NavLink key={e.to} to={e.to} className={ENLLAÇ}>
              {e.text}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 xl:flex">
          <ThemeSwitch />
          {perfil ? (
            <UserMenu />
          ) : (
            <>
              <Button variant="ghost" mida="sm" onClick={() => navigate('/login')}>
                Inicia sessió
              </Button>
              <Button mida="sm" onClick={() => navigate('/registre')}>
                Registra't
              </Button>
            </>
          )}
        </div>

        <button
          className="rounded-md p-2 text-ink xl:hidden"
          aria-label="Obrir el menú"
          aria-expanded={menuObert}
          onClick={() => setMenuObert((v) => !v)}
        >
          <IconMenu />
        </button>
      </div>

      {menuObert && (
        <nav aria-label="Navegació mòbil" className="flex flex-col gap-1 border-t border-line px-4 py-3 xl:hidden">
          {enllaços.map((e) => (
            <NavLink key={e.to} to={e.to} className={ENLLAÇ} onClick={() => setMenuObert(false)}>
              {e.text}
            </NavLink>
          ))}
          {perfil?.rol === 'alumne' && (
            <NavLink to="/perfil" className={ENLLAÇ} onClick={() => setMenuObert(false)}>
              El meu perfil
            </NavLink>
          )}
          <div className="mt-2 flex items-center gap-2 px-3 py-2">
            <ThemeSwitch />
            <span className="text-sm text-muted">{tema === 'dark' ? 'Mode fosc' : 'Mode clar'}</span>
          </div>
          {perfil ? (
            <Button variant="secondary" mida="sm" onClick={sortir} className="mt-2">
              Tanca la sessió
            </Button>
          ) : (
            <div className="mt-2 flex gap-2">
              <Button variant="ghost" mida="sm" onClick={() => { setMenuObert(false); navigate('/login') }}>
                Inicia sessió
              </Button>
              <Button mida="sm" onClick={() => { setMenuObert(false); navigate('/registre') }}>
                Registra't
              </Button>
            </div>
          )}
        </nav>
      )}
    </header>
  )
}
