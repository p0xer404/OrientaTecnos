// Tota la interfície ha de ser en català, però algunes etiquetes administratives dels fitxers
// de data/ (tipus de centre, àrea, admissió, notes de preu...) venen en castellà de l'origen.
// Aquest fitxer tradueix NOMÉS aquestes etiquetes fixes (conjunts finits i verificats contra
// data/) — mai el contingut lliure com noms de graus, centres o cicles, que ja venen en català
// i es mostren tal qual, com indica CLAUDE.md.
//
// Si un valor no és a cap diccionari, es retorna tal qual (p. ex. famílies de FP, noms de
// cicles artístics i noms de graus, que ja són en català a l'origen).

const DICCIONARI: Record<string, string> = {
  // tipo_centro (grados.json)
  'Pública (centro propio)': 'Pública (centre propi)',
  'Pública (centro adscrito)': 'Pública (centre adscrit)',
  Privada: 'Privada',

  // admision (grados.json)
  'Preinscripción universitaria (nota de corte)': 'Preinscripció universitària (nota de tall)',
  'Preinscripción universitaria + PAP propia de ESCAC (obligatoria)':
    "Preinscripció universitària + PAP pròpia de l'ESCAC (obligatòria)",
  'Propia (no entra en la preinscripción pública)': 'Pròpia (no entra a la preinscripció pública)',

  // area (grados.json)
  'Artes y diseño': 'Arts i disseny',
  'Artes y humanidades': 'Arts i humanitats',
  Ciencias: 'Ciències',
  'Ciencias de la salud': 'Ciències de la salut',
  'Derecho, economía y ciencias sociales': 'Dret, economia i ciències socials',
  Educación: 'Educació',
  'Ingeniería y arquitectura': 'Enginyeria i arquitectura',
  Otros: 'Altres',

  // nota (grados.json) — observacions de preu, text lliure però finit (8 valors)
  'Doble grado: precio según créditos matriculados (236 €/crédito).':
    'Doble grau: preu segons crèdits matriculats (236 €/crèdit).',
  'Para el curso 2027-28 Esade publica 21.300 €.': 'Per al curs 2027-28 Esade publica 21.300 €.',
  'Para el curso 2027-28 Esade publica 24.500 €.': 'Per al curs 2027-28 Esade publica 24.500 €.',
  'Precio con préstamo condonable de la Generalitat (sin él, 225 €/crédito)':
    'Preu amb préstec condonable de la Generalitat (sense ell, 225 €/crèdit)',
  'Precio estimado por curso según ESCAC (2026-27): parte pública UB + parte Fundació ESCAC. Pago único. Requiere superar la PAP propia de ESCAC (abril o junio, ~110 €) además de la preinscripción. Campus: Plaça de la Farinera 9, Terrassa · 937 361 555 · info@escac.es. Tiene curso Foundation preuniversitario (exime de la PAP) y becas de la Fundació (hasta 100 %).':
    "Preu estimat per curs segons l'ESCAC (2026-27): part pública UB + part Fundació ESCAC. Pagament únic. Cal superar la PAP pròpia de l'ESCAC (abril o juny, ~110 €) a més de la preinscripció. Campus: Plaça de la Farinera 9, Terrassa · 937 361 555 · info@escac.es. Té curs Foundation preuniversitari (eximeix de la PAP) i beques de la Fundació (fins al 100 %).",
  'Precio por 60 créditos del curso 2027-28 (el 2026-27 ya no está publicado).':
    'Preu per 60 crèdits del curs 2027-28 (el 2026-27 ja no està publicat).',
  'Precio publicado por UManresa (puede ser del curso 2025-26)':
    'Preu publicat per UManresa (pot ser del curs 2025-26)',
  'Solo créditos (60). Tasas aprox. +140 €. Los dobles grados tienen más créditos.':
    'Només crèdits (60). Taxes aprox. +140 €. Els dobles graus tenen més crèdits.',

  // idiomas (grados.json)
  'Catalán, castellano': 'Català, castellà',

  // duracion (grados.json)
  '4 años': '4 anys',
  '4 años (240 ECTS)': '4 anys (240 ECTS)',
  '5 años': '5 anys',
  'pendent de revisió': 'Pendent de revisió',

  // nivel (fp.json)
  'Grado básico': 'Grau bàsic',
  'Grado medio': 'Grau mitjà',
  'Grado superior': 'Grau superior',
  'Especialización (GM)': "Curs d'especialització (GM)",
  'Especialización (GS)': "Curs d'especialització (GS)",

  // titularidad (fp.json, bachilleratos.json, artisticos_superiores.json)
  Público: 'Públic',
  Privado: 'Privat',
  Concertado: 'Concertat',
  'Privado (adscrito a la UB)': 'Privat (adscrit a la UB)',

  // precio_nota (fp.json)
  'Consultar al centro': 'Consulta-ho al centre',
  'Precio público Generalitat': 'Preu públic de la Generalitat',

  // modalidades (bachilleratos.json)
  'Ciencias y Tecnología': 'Ciències i Tecnologia',
  'Humanidades y Ciencias Sociales': 'Humanitats i Ciències Socials',
  Artes: 'Arts',
  General: 'General',

  // precio_nota (bachilleratos.json)
  'Concertado: sin cuota de escolaridad (puede haber cuotas voluntarias o actividades complementarias)':
    'Concertat: sense quota d’escolaritat (hi pot haver quotes voluntàries o activitats complementàries)',
  Gratuito: 'Gratuït',
  'Privado: consultar al centro': 'Privat: consulta-ho al centre',

  // admision (artisticos_superiores.json)
  'PAP propia de ESCAC (portfolio + video pitch + prueba audiovisual + entrevista; abril o junio, ~110 €) + preinscripción universitaria. 110 plazas. Nota de corte 5 (2023-2026).':
    "PAP pròpia de l'ESCAC (portafoli + video pitch + prova audiovisual + entrevista; abril o juny, ~110 €) + preinscripció universitària. 110 places. Nota de tall 5 (2023-2026).",
  'Preinscripción de ciclos (Bachillerato o prueba de acceso).':
    "Preinscripció de cicles (Batxillerat o prova d'accés).",
  'Prueba de acceso específica del centro + Bachillerato (o prueba para mayores de 18). No cuenta la nota de la PAU.':
    "Prova d'accés específica del centre + Batxillerat (o prova per a majors de 18). No compta la nota de la PAU.",

  // tipo_estudios (artisticos_superiores.json)
  'Ciclos de grado superior de artes escénicas / técnicas del espectáculo':
    "Cicles de grau superior d'arts escèniques / tècniques de l'espectacle",
  'Ciclos formativos de grado superior de artes plásticas y diseño':
    'Cicles formatius de grau superior d’arts plàstiques i disseny',
  'Grado universitario oficial (UB): Cinematografía, 240 ECTS':
    'Grau universitari oficial (UB): Cinematografia, 240 ECTS',
  'Título superior artístico (equivalente a grado, 240 ECTS)':
    'Títol superior artístic (equivalent a grau, 240 ECTS)',

  // ensenanzas_superiores (artisticos_superiores.json)
  'Arte dramático': 'Art dramàtic',
  'Cine y audiovisuales': 'Cinema i audiovisuals',
  'Conservación y restauración de bienes culturales': 'Conservació i restauració de béns culturals',
  Danza: 'Dansa',
  Diseño: 'Disseny',
  Música: 'Música',

  // precio_nota (artisticos_superiores.json)
  'Centro privado: consultar al centro': 'Centre privat: consulta-ho al centre',
  'Ciclos públicos: 360 €/curso (precio público CFGS)': 'Cicles públics: 360 €/curs (preu públic CFGS)',
  'El CITM imparte grados de la UPC (Videojuegos, Animación, Multimedia): ver buscador de grados, 6.900 €/curso.':
    'El CITM imparteix graus de la UPC (Videojocs, Animació, Multimèdia): vegeu el cercador de graus, 6.900 €/curs.',
  'Precio aprobado por el patronato de la ESMUC; se revisa cada año.':
    "Preu aprovat pel patronat de l'ESMUC; es revisa cada any.",
  'Precio publicado por el Institut del Teatre (puede no estar actualizado). +67,83 € gestión anual.':
    "Preu publicat per l'Institut del Teatre (pot no estar actualitzat). +67,83 € de gestió anual.",
  'Precio público del Departament d\'Educació para títulos superiores artísticos.':
    "Preu públic del Departament d'Educació per a títols superiors artístics.",

  // especialidades (artisticos_superiores.json)
  Arqueología: 'Arqueologia',
  Composición: 'Composició',
  'Coreografía e interpretación': 'Coreografia i interpretació',
  Dirección: 'Direcció',
  'Dirección de arte': "Direcció d'art",
  'Dirección escénica y dramaturgia': 'Direcció escènica i dramatúrgia',
  'Diseño de interiores': "Disseny d'interiors",
  'Diseño de moda': 'Disseny de moda',
  'Diseño de producto': 'Disseny de producte',
  'Diseño gráfico': 'Disseny gràfic',
  Documental: 'Documental',
  'Documento gráfico': 'Document gràfic',
  Escenografía: 'Escenografia',
  Escultura: 'Escultura',
  Fotografía: 'Fotografia',
  Guion: 'Guió',
  Interpretación: 'Interpretació',
  'Interpretación (clásica, jazz y moderna, tradicional…)': 'Interpretació (clàssica, jazz i moderna, tradicional…)',
  Montaje: 'Muntatge',
  Musicología: 'Musicologia',
  Pedagogía: 'Pedagogia',
  'Pedagogía de la danza': 'Pedagogia de la dansa',
  Pintura: 'Pintura',
  Producción: 'Producció',
  'Producción y gestión': 'Producció i gestió',
  Sonido: 'So',
  Sonología: 'Sonologia',
}

export function tr(valor: string | null | undefined): string {
  if (!valor) return ''
  return DICCIONARI[valor] ?? valor
}

/** Tradueix cada element d'una llista de valors fixos. */
export function trLlista(valors: readonly string[] | null | undefined): string[] {
  if (!valors) return []
  return valors.map(tr)
}
