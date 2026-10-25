import { createContext, useContext } from 'react'

export type Tema = 'light' | 'dark'

export interface ThemeContextValue {
  tema: Tema
  alternar: () => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme s\'ha de fer servir dins de <ThemeProvider>.')
  return ctx
}
