import { useCallback, useLayoutEffect, useState, type ReactNode } from 'react'
import { ThemeContext, type Tema } from './useTheme'

const CLAU = 'buscador-tecnos-tema'

function temaPreferit(): Tema {
  try {
    const desat = localStorage.getItem(CLAU)
    if (desat === 'light' || desat === 'dark') return desat
  } catch {
    // ignorat
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [tema, setTema] = useState<Tema>(() => temaPreferit())

  useLayoutEffect(() => {
    document.documentElement.classList.toggle('dark', tema === 'dark')
    try {
      localStorage.setItem(CLAU, tema)
    } catch {
      // ignorat
    }
  }, [tema])

  const alternar = useCallback(() => setTema((t) => (t === 'dark' ? 'light' : 'dark')), [])

  return <ThemeContext.Provider value={{ tema, alternar }}>{children}</ThemeContext.Provider>
}
