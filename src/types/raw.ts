// Tipus que reflecteixen EXACTAMENT els camps dels fitxers de data/.
// No afegim ni inventem camps aquí: només tipem el que hi ha.

export interface GrauRaw {
  id: string
  codigo_preinscripcion: string | null
  grado: string
  universidad: string
  universidad_nombre: string
  centro: string
  tipo_centro: 'Pública (centro propio)' | 'Pública (centro adscrito)' | 'Privada'
  admision: string
  area: string
  municipio: string
  plazas: number | null
  doble: boolean
  nota_corte_2026: number | null
  nota_corte_2025: number | null
  nota_corte_2024: number | null
  nota_corte_2023: number | null
  precio_1r_curso: number | null
  precio_credito: number | null
  precio_curso_ref: string | null
  precio_incluye_tasas: boolean | null
  precio_fuente: string | null
  nota: string | null
  url: string | null
  duracion: string | null
  idiomas: string | null
}

export interface FPRaw {
  id: string
  codigo: string
  ciclo: string
  nivel: 'Grado básico' | 'Grado medio' | 'Grado superior' | 'Especialización (GM)' | 'Especialización (GS)'
  familia: string
  horas: number | null
  titulo: string | null
  centro: string
  codigo_centro: string | null
  titularidad: 'Público' | 'Privado'
  municipio: string
  comarca: string | null
  direccion: string | null
  cp: string | null
  lat: number | null
  lon: number | null
  modalidad: 'Presencial' | 'Virtual'
  precio_curso: number | null
  precio_nota: string | null
  telefono: string | null
  email: string | null
  web: string | null
  preinscripcion: string | null
  info: string | null
}

export interface BachilleratoRaw {
  id: string
  codigo_centro: string
  centro: string
  titularidad: 'Público' | 'Concertado' | 'Privado'
  es_terrassa: boolean
  direccion: string | null
  cp: string | null
  municipio: string
  comarca: string | null
  telefono: string | null
  email: string | null
  web: string | null
  lat: number | null
  lon: number | null
  km_desde_terrassa: number | null
  modalidades: string[]
  ciencias_tecnologia: boolean
  humanidades_sociales: boolean
  artes: boolean
  general: boolean
  alumnos_por_modalidad: Record<string, { '1o': number | null; '2o': number | null }>
  alumnos_1o_total: number | null
  curso_datos_matricula: string | null
  turnos: string[] | null
  regimen: string | null
  grupos_1o: number | null
  plazas_1o: number | null
  plazas_preinscripcion_1o: number | null
  asignados_preinscripcion_1o: number | null
  asignados_1a_opcion_1o: number | null
  ocupacion_preinscripcion: number | null
  curso_datos_oferta: string | null
  precio_curso: number | null
  precio_nota: string | null
}

export interface ArtisticSuperiorRaw {
  id: string
  codigo_centro: string | null
  centro: string
  titularidad: string
  es_terrassa: boolean
  tipo_estudios: string[]
  ensenanzas_superiores: string[]
  especialidades: string[]
  ciclos_superiores_artisticos: string[]
  admision: string
  precio_credito: number | null
  precio_1r_curso: number | null
  precio_ciclos: number | null
  precio_fuente: string | null
  precio_nota: string | null
  direccion: string | null
  cp: string | null
  municipio: string
  comarca: string | null
  telefono: string | null
  email: string | null
  web: string | null
  lat: number | null
  lon: number | null
  km_desde_terrassa: number | null
  destacado: boolean
}

export interface UniversitatRaw {
  siglas: string
  nombre: string
  tipo: 'Pública' | 'Privada'
  num_grados: number
}

export interface MetaRaw {
  generado: string
  curso: string
  num_grados: number
  num_fp: number
  grados_con_precio: number
  num_bachilleratos: number
  num_artisticos: number
  fuentes: Record<string, string>
  centros_sin_precio: string[]
}
