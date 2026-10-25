# Esquema de datos

## grados.json (lista de objetos)

| Campo | Tipo | Descripción |
|---|---|---|
| id | string | Identificador único (`pre-<código>` para preinscripción, `priv-<n>` para privadas) |
| codigo_preinscripcion | string/null | Código oficial de la oferta en la preinscripción 2026 |
| grado | string | Nombre del grado (catalán para la preinscripción, idioma de la web para privadas) |
| universidad | string | Siglas: UB, UAB, UPC, UPF, UdG, UdL, URV, UVic, URL, UIC, UAO |
| universidad_nombre | string | Nombre completo |
| centro | string | Centro que lo imparte (p. ej. Tecnocampus, EUNCET, CITM, Esade, Blanquerna…) |
| tipo_centro | string | `Pública (centro propio)`, `Pública (centro adscrito)` o `Privada` |
| admision | string | `Preinscripción universitaria (nota de corte)` o admisión propia |
| area | string | Área de conocimiento (clasificación automática por palabras clave) |
| municipio | string | Dónde se imparte |
| plazas | int/null | Plazas de nuevo acceso |
| doble | bool | Doble grado / simultaneidad / grado+máster |
| nota_corte_2026 … nota_corte_2023 | float/null | Nota de corte 1ª asignación de cada año (5 = sin corte) |
| precio_1r_curso | float/null | Precio del primer curso en € (normalmente 60 créditos) |
| precio_credito | float/null | € por crédito en 1ª matrícula |
| precio_curso_ref | string/null | Curso al que se refiere el precio (2026-27 o 2027-28) |
| precio_incluye_tasas | bool/null | Si el precio ya incluye tasas administrativas |
| precio_fuente | string/null | URL de la fuente del precio |
| nota | string/null | Observaciones del precio |
| url, duracion, idiomas | string/null | Solo en algunas privadas |

## fp.json

| Campo | Descripción |
|---|---|
| id, codigo | Identificadores |
| ciclo, nivel, familia, horas, titulo | Datos del ciclo (nivel: Grado básico / medio / superior / Especialización) |
| centro, codigo_centro, titularidad | Centro (Público/Privado) |
| municipio, comarca, direccion, cp, lat, lon | Ubicación |
| modalidad | Presencial / Virtual |
| precio_curso, precio_nota | 0 = gratuito (público GM/GB); 360 = precio público CFGS; null = consultar |
| telefono, email, web | Contacto |
| preinscripcion, info | Enlaces oficiales |

## universidades.json
`siglas`, `nombre`, `tipo`, `num_grados`.

## meta.json
`generado`, `curso`, `num_grados`, `num_fp`, `grados_con_precio`, `fuentes`, `centros_sin_precio`.

## bachilleratos.json

| Campo | Descripción |
|---|---|
| id, codigo_centro, centro | Identificación |
| titularidad | Público / Concertado (conciertos de batxillerat de la Generalitat) / Privado |
| es_terrassa, km_desde_terrassa | Para ordenar por cercanía a Terrassa |
| municipio, comarca, direccion, cp, telefono, email, web, lat, lon | Contacto y ubicación |
| modalidades | Lista: Ciencias y Tecnología, Humanidades y Ciencias Sociales, Artes, General (según alumnos matriculados en 2025-26) |
| ciencias_tecnologia, humanidades_sociales, artes, general | Booleanos para filtrar |
| alumnos_por_modalidad | {modalidad: {"1o": n, "2o": n}} alumnos matriculados en 2025-26 |
| alumnos_1o_total, curso_datos_matricula | Total de 1º y curso de los datos |
| turnos, regimen | Mañana/tarde, diurno/nocturno |
| grupos_1o, plazas_1o | Oferta inicial de 1º (curso `curso_datos_oferta`) |
| plazas_preinscripcion_1o, asignados_preinscripcion_1o, asignados_1a_opcion_1o, ocupacion_preinscripcion | Plazas que salieron a preinscripción y cuántas se asignaron |
| precio_curso, precio_nota | 0 en públicos y concertados; null en privados |

Los centros privados sin concierto no publican oferta: sus campos de plazas son null.

## artisticos_superiores.json

| Campo | Descripción |
|---|---|
| id, codigo_centro, centro, titularidad, destacado | Identificación (ESCAC tiene destacado=true) |
| tipo_estudios | Título superior artístico / ciclos superiores de artes plásticas y diseño / ciclos de artes escénicas / grado (ESCAC) |
| ensenanzas_superiores | Diseño, Música, Arte dramático, Danza, Conservación y restauración, Cine (ESCAC) |
| especialidades | Especialidades habituales de cada enseñanza |
| ciclos_superiores_artisticos | Nombres de los CFGS de artes plásticas y diseño que ofrece el centro (2026-27) |
| admision | Cómo se accede |
| precio_credito, precio_1r_curso, precio_fuente, precio_nota | Títulos superiores públicos: 21,73 €/crédito (Educació), ESMUC 25,04 €, Institut del Teatre 32,18 €; privados: null |
| precio_ciclos | 360 €/curso en ciclos públicos |
| contacto | direccion, cp, municipio, comarca, telefono, email, web, lat, lon, km_desde_terrassa |
