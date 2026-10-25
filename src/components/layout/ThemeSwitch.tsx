import { useTheme } from '../../context/useTheme'
import { IconMoon, IconSun } from '../ui/Icons'

/** Interruptor amb el quadradet lliscant (no una simple icona que canvia d'un salt). */
export function ThemeSwitch({ className = '' }: { className?: string }) {
  const { tema, alternar } = useTheme()
  const esFosc = tema === 'dark'

  return (
    <button
      role="switch"
      aria-checked={esFosc}
      aria-label={esFosc ? 'Activar mode clar' : 'Activar mode fosc'}
      onClick={alternar}
      className={`relative h-6 w-11 shrink-0 rounded-full border border-line bg-canvas transition-colors duration-200 ${className}`}
    >
      <span
        className="absolute left-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-contrast shadow-sm transition-transform duration-200 ease-out"
        style={{ transform: esFosc ? 'translateX(20px)' : 'translateX(0)' }}
      >
        {esFosc ? <IconMoon width={11} height={11} /> : <IconSun width={11} height={11} />}
      </span>
    </button>
  )
}
