# CLAUDE.md — Buscador de estudios (Escola Tecnos, Terrassa)

Instrucciones para Claude Code. Lee este archivo entero antes de empezar.

## Qué hay que construir

Una web de orientación académica para los alumnos de 4º ESO (para elegir Bachillerato/FP) y de Bachillerato (para elegir carrera) de **Escola Tecnos (Terrassa)**, inspirada en stuveo.com pero solo para nuestra escuela y solo con datos de Cataluña. Los datos ya están preparados en `data/`: **no inventes datos**, usa solo lo que hay en esos archivos.

Idioma de la interfaz: **español** (los nombres de grados vienen en catalán de la fuente oficial y deben mostrarse tal cual). Si sobra tiempo, añade selector catalán/español.

## Stack recomendado

- **Vite + React + TypeScript + Tailwind**. Web 100 % estática (sin backend) para la versión 1.
- Los JSON de `data/` se importan directamente o se copian a `public/data/` y se cargan con `fetch`.
- Búsqueda en cliente (los datos caben en memoria: ~700 grados y ~3.000 ofertas de FP). Para búsqueda difusa, `fuse.js`.
- Mapa de FP: `leaflet` + `react-leaflet` (tiles de OpenStreetMap).
- Gráficos (evolución de notas): `recharts`.
- Despliegue: Vercel, Netlify o subir el `dist/` al hosting del colegio.

## Funcionalidades (por orden de prioridad)

### 1. Buscador de grados universitarios (`/grados`)
- Barra de búsqueda por texto (nombre del grado, universidad, centro).
- Filtros: área, universidad, tipo de centro (pública propia / adscrita / privada), municipio, rango de nota de corte (slider 5–14), precio máximo del primer curso, solo dobles grados, admisión (preinscripción vs. propia).
- Orden: relevancia, nota de corte, precio, plazas.
- Tarjeta de resultado: nombre, universidad y centro, municipio, nota de corte 2026, precio 1r curso, plazas, etiqueta de tipo de centro.
- Botón destacado **"Cerca de Terrassa"** que prioriza municipios del Vallès (Terrassa, Sabadell, Sant Cugat del Vallès, Cerdanyola del Vallès, Barcelona).

### 2. Ficha de grado (`/grados/:id`)
- Todos los campos de `grados.json`.
- Gráfico de evolución de la nota de corte 2023 → 2026 (si hay datos).
- Precio: mostrar `precio_1r_curso`, `precio_credito`, `precio_curso_ref` y si incluye tasas. Si `nota` tiene texto, mostrarlo como aviso. Enlace a `precio_fuente` ("Ver fuente oficial").
- Si `admision` es propia (privadas), explicar que no hay nota de corte y que hay proceso de admisión propio.
- Botón "Añadir a mi lista" y "Comparar".

### 3. Comparador (`/comparar`)
- Hasta 4 grados lado a lado: nota, precio, plazas, municipio, tipo de centro, idiomas, duración.
- Coste total estimado de la carrera = `precio_1r_curso × años` (indicar que es aproximado).

### 4. Buscador de FP (`/fp`)
- Filtros: nivel (básico / medio / superior / especialización), familia profesional, municipio, comarca, titularidad, modalidad.
- Vista lista + vista mapa (coordenadas `lat`/`lon`).
- Ficha con contacto del centro (teléfono, email, web, dirección) y enlace a preinscripción.
- Precio: si `precio_curso` es 0 → "Gratuito (centro público)"; si es 360 → "360 €/curso (precio público, 180 € con bonificación)"; si es null → "Consultar al centro".

### 5. Bachilleratos (`/bachillerato`) — para alumnos de 4º ESO
- Datos en `data/bachilleratos.json`: 473 centros con Bachillerato en Barcelonès, Baix Llobregat, Vallès Occidental, Vallès Oriental y Maresme.
- **Por defecto mostrar Terrassa primero** (`es_terrassa`) y ordenar por `km_desde_terrassa`. Filtro de distancia (5 / 10 / 20 / 40 km) y por municipio/comarca.
- Filtros: titularidad (Público / Concertado / Privado), **modalidad** (Ciencias y Tecnología, Humanidades y Ciencias Sociales, Artes, General; usar los booleanos `ciencias_tecnologia`, `humanidades_sociales`, `artes`, `general`), turno.
- En la ficha, gráfico de barras con `alumnos_por_modalidad` (alumnos de 1º y 2º por modalidad, curso `curso_datos_matricula`): da una idea del tamaño de cada modalidad en ese centro.
- Explicar en la página: en Cataluña "tecnológico" no es una modalidad aparte, forma parte de **Ciencias y Tecnología** (cada centro ofrece sus itinerarios: científico-sanitario, tecnológico…; consultar al centro). Artes incluye Artes plásticas, imagen y diseño y/o Música y artes escénicas según el centro.
- Tarjeta: centro, municipio, distancia, titularidad, modalidades, plazas de 1º, precio (`precio_nota`).
- Indicador de demanda: `ocupacion_preinscripcion` (asignados / plazas ofrecidas en la preinscripción del curso `curso_datos_oferta`). ≥0,95 → "Muy solicitado". Explicar que es del curso anterior.
- Mapa con todos los centros (`lat`/`lon`).
- La escuela Tecnos aparece en los datos (código 08029684); no hace falta destacarla.

### 6. Enseñanzas artísticas superiores (`/artes`)
- Datos en `data/artisticos_superiores.json`: escuelas de diseño (ESDAP, Llotja, Deià, Pau Gargallo, IED, LCI…), música (ESMUC, Liceu, Taller de Músics…), arte dramático y danza (Institut del Teatre, Eòlia), conservación-restauración (ESCRBC) y ciclos superiores de artes plásticas y diseño y de artes escénicas.
- **ESCAC (escuela de cine, Terrassa) va destacada arriba** (`destacado: true`) con su ficha completa: PAP, precio, becas, especialidades. Enlazar también a su grado en `/grados` (centro `ESCAC`).
- Explicar en la página la diferencia: título superior artístico (equivale a grado, admisión por prueba específica, no cuenta la PAU) vs. grado universitario vs. ciclo superior artístico.
- Filtros: disciplina (`ensenanzas_superiores`), titularidad, municipio, tipo de estudios.

### 7. Test vocacional (`/test`)
- Test tipo **RIASEC (Holland)**: 6 perfiles (Realista, Investigador, Artístico, Social, Emprendedor, Convencional), ~36–48 afirmaciones con escala 1–5. Las preguntas las redactas tú (originales, no copies tests con copyright).
- Resultado: los 2–3 perfiles dominantes con explicación y **recomendaciones de grados y ciclos reales** del dataset usando este mapeo de áreas:
  - Realista → Ingeniería y arquitectura; FP de familias técnicas (Electricitat, Fabricació mecànica, Transport, Edificació…)
  - Investigador → Ciencias; Ciencias de la salud; Ingeniería
  - Artístico → Artes y diseño; Artes y humanidades; enseñanzas artísticas superiores (`/artes`, incluida ESCAC); FP Imatge i so, Arts gràfiques; Bachillerato de Artes
  - Social → Educación; Ciencias de la salud; FP Serveis socioculturals, Sanitat
  - Emprendedor → Derecho, economía y ciencias sociales; FP Comerç i màrqueting
  - Convencional → Derecho/economía (Comptabilitat, ADE); FP Administració i gestió, Informàtica
- Guardar el resultado en `localStorage` para mostrarlo en "Mi perfil".

### 8. Mis listas (`/mis-listas`)
- Favoritos de grados y ciclos guardados en `localStorage` (sin cuentas en la versión 1).

### 9. (Opcional, v2) Orientador IA
- Chat que responde dudas usando como contexto los grados filtrados. Requiere backend (la API key nunca puede ir en el front). Dejar preparado pero desactivado.

### 10. (Opcional, v2) Panel para orientadores
- Login, grupos, resultados agregados de tests. **Requiere backend y cumplir RGPD con datos de menores** (consentimiento de padres si <14 años, aprobación del colegio). No hacer en v1.

## Datos (`data/`)

Lee `docs/ESQUEMA_DATOS.md` para el detalle de cada campo. Resumen:

| Archivo | Contenido |
|---|---|
| `grados.json` | ~680 grados: todos los de la preinscripción pública 2026-27 (UB, UAB, UPC, UPF, UdG, UdL, URV, UVic y centros adscritos) + privadas con admisión propia (Esade, IQS, La Salle, Blanquerna, UIC, Abat Oliba). |
| `fp.json` | ~3.000 ofertas de FP (ciclo × centro) con contacto, coordenadas y precio. |
| `bachilleratos.json` | 473 centros con Bachillerato del área metropolitana (Terrassa primero), con plazas, demanda, titularidad, contacto y coordenadas. |
| `artisticos_superiores.json` | 62 centros de enseñanzas artísticas superiores y ciclos superiores artísticos de Cataluña + ESCAC destacada. |
| `universidades.json` | Siglas, nombre, tipo y nº de grados. |
| `meta.json` | Fecha de generación, fuentes y centros sin precio localizado. |
| `*.csv` | Lo mismo en CSV. |
| `precios_manual.json`, `privadas_manual.json` | Entradas manuales que usa el script. No los cargues en la web. |
| `raw/` | Descargas originales. No los cargues en la web. |

Reglas importantes al mostrar datos:
- `nota_corte_*` = 5 significa que entraron todos los que lo pidieron (no hubo corte). Mostrarlo como "5,000 (sin corte)".
- `precio_1r_curso` null → mostrar "Consultar en el centro" con enlace a `url` si existe.
- No muestres un precio sin el curso al que se refiere (`precio_curso_ref`).
- Muestra siempre en el pie de página: fuentes (de `meta.json`) y fecha de actualización.

## Actualizar los datos

```bash
python scripts/update_data.py      # descarga datos frescos de la Generalitat y regenera data/
python scripts/build_excel.py      # regenera el Excel
```
Las notas de corte salen cada julio; los precios de privadas hay que revisarlos a mano en `data/privadas_manual.json` y `data/precios_manual.json` (cada entrada tiene su URL de fuente).

## Calidad

- Responsive (los alumnos lo usarán desde el móvil).
- Accesible: contraste, etiquetas en formularios, navegación con teclado.
- Sin cookies de terceros ni analytics en la v1 (son menores de edad).
- Antes de terminar: `npm run build` sin errores y prueba manual de búsqueda, filtros, ficha, comparador, FP con mapa y test.
