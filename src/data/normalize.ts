import { distanciaATerrassa } from '../lib/geo'
import { tr, trLlista } from '../lib/traduccio'
import type { ArtisticSuperiorRaw, BachilleratoRaw, FPRaw, GrauRaw } from '../types/raw'
import type { Estudi } from '../types/estudi'

export function normalizeGrau(g: GrauRaw): Estudi<'grau'> {
  return {
    id: g.id,
    tipus: 'grau',
    nom: g.grado,
    subtitol: `${g.centro} · ${g.universidad_nombre}`,
    centre: g.centro,
    municipi: g.municipio,
    comarca: null,
    titularitat: tr(g.tipo_centro),
    lat: null,
    lon: null,
    kmTerrassa: null,
    esTerrassa: g.municipio.trim().toLowerCase() === 'terrassa',
    preu: g.precio_1r_curso,
    preuRef: g.precio_curso_ref,
    preuNota: tr(g.nota),
    notaTall2026: g.nota_corte_2026,
    places: g.plazas,
    area: tr(g.area),
    destacat: false,
    raw: g,
  }
}

export function normalizeFP(f: FPRaw): Estudi<'fp'> {
  const kmTerrassa = distanciaATerrassa(f.lat, f.lon)
  return {
    id: f.id,
    tipus: 'fp',
    nom: f.ciclo,
    subtitol: f.centro,
    centre: f.centro,
    municipi: f.municipio,
    comarca: f.comarca,
    titularitat: tr(f.titularidad),
    lat: f.lat,
    lon: f.lon,
    kmTerrassa,
    esTerrassa: f.municipio.trim().toLowerCase() === 'terrassa',
    preu: f.precio_curso,
    preuRef: null,
    preuNota: tr(f.precio_nota),
    notaTall2026: null,
    places: null,
    area: f.familia,
    destacat: false,
    raw: f,
  }
}

export function normalizeBachillerato(b: BachilleratoRaw): Estudi<'batxillerat'> {
  return {
    id: b.id,
    tipus: 'batxillerat',
    nom: b.centro,
    subtitol: trLlista(b.modalidades).join(' · '),
    centre: b.centro,
    municipi: b.municipio,
    comarca: b.comarca,
    titularitat: tr(b.titularidad),
    lat: b.lat,
    lon: b.lon,
    kmTerrassa: b.km_desde_terrassa,
    esTerrassa: b.es_terrassa,
    preu: b.precio_curso,
    preuRef: b.curso_datos_oferta ?? b.curso_datos_matricula,
    preuNota: tr(b.precio_nota),
    notaTall2026: null,
    places: b.plazas_1o,
    area: trLlista(b.modalidades).join(' · '),
    destacat: false,
    raw: b,
  }
}

export function normalizeArtistic(a: ArtisticSuperiorRaw): Estudi<'artistic'> {
  return {
    id: a.id,
    tipus: 'artistic',
    nom: a.centro,
    subtitol: trLlista(a.ensenanzas_superiores).join(', '),
    centre: a.centro,
    municipi: a.municipio,
    comarca: a.comarca,
    titularitat: tr(a.titularidad),
    lat: a.lat,
    lon: a.lon,
    kmTerrassa: a.km_desde_terrassa,
    esTerrassa: a.es_terrassa,
    preu: a.precio_1r_curso ?? a.precio_ciclos,
    preuRef: null,
    preuNota: tr(a.precio_nota),
    notaTall2026: null,
    places: null,
    area: trLlista(a.ensenanzas_superiores).join(' · '),
    destacat: a.destacado,
    raw: a,
  }
}
