import { demoRepo } from './demoRepo'
import { supabaseRepo } from './supabaseRepo'
import { teCredencialsSupabase } from './supabaseClient'
import type { Repositori } from './types'

// Si hi ha credencials de Supabase a l'entorn (.env.local, vegeu .env.example), es fa
// servir el backend real amb autenticació i Postgres; si no, mode demo (localStorage),
// perquè es pugui ensenyar l'aplicació a l'escola abans de tenir permisos.
export const repo: Repositori = teCredencialsSupabase ? supabaseRepo : demoRepo

export const ESTA_EN_MODE_DEMO = repo.mode === 'demo'

export type { Repositori } from './types'
