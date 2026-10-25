import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const teCredencialsSupabase = Boolean(url && anonKey)

// Si no hi ha credencials, no s'arriba a instanciar aquest client (repo/index.ts fa
// servir demoRepo en aquest cas), però exportem igualment un valor per no trencar imports.
export const supabase = teCredencialsSupabase ? createClient(url, anonKey) : null
