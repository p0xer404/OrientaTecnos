export type DimensioPreferencia =
  | 'universitatVsFp'
  | 'publicVsPrivat'
  | 'importanciaNota'
  | 'importanciaIdioma'

export interface PreguntaLikert {
  tipus: 'likert'
  id: string
  text: string
  dimensio: DimensioPreferencia
}

export interface PreguntaNumero {
  tipus: 'numero'
  id: string
  text: string
  dimensio: 'pressupostMax'
  unitat: string
  min: number
  max: number
  step: number
  valorPerDefecte: number
}

export interface PreguntaSlider {
  tipus: 'slider'
  id: string
  text: string
  dimensio: 'disposatDesplacar'
  unitat: string
  min: number
  max: number
  step: number
  valorPerDefecte: number
}

export type PreguntaPreferencia = PreguntaLikert | PreguntaNumero | PreguntaSlider

// 15 preguntes: 13 escala 1-5 ("Gens d'acord" — "Totalment d'acord") + 2 d'entrada directa.
// Totes les afirmacions de cada dimensió estan formulades en el mateix sentit per facilitar
// la puntuació: una mitjana alta indica preferència per universitat / privat / nota / idioma.
export const PREGUNTES_PREFERENCIES: PreguntaPreferencia[] = [
  // Universitat vs FP (3)
  { tipus: 'likert', id: 'uf1', dimensio: 'universitatVsFp', text: 'Prefereixo un itinerari llarg i teòric abans d\'especialitzar-me, encara que tardi més a treballar.' },
  { tipus: 'likert', id: 'uf2', dimensio: 'universitatVsFp', text: "M'atrau més la vida universitària (campus, graus de 4 anys, intercanvis) que un cicle curt i molt pràctic." },
  { tipus: 'likert', id: 'uf3', dimensio: 'universitatVsFp', text: 'Per a mi és important acabar amb un títol de grau universitari, no només un certificat professional.' },

  // Públic vs privat (3)
  { tipus: 'likert', id: 'pp1', dimensio: 'publicVsPrivat', text: "Estic disposat/a a pagar més per un centre privat si m'ofereix millors instal·lacions o atenció més personalitzada." },
  { tipus: 'likert', id: 'pp2', dimensio: 'publicVsPrivat', text: "El prestigi o la marca del centre m'importa més que el fet que sigui públic o privat." },
  { tipus: 'likert', id: 'pp3', dimensio: 'publicVsPrivat', text: "Prefereixo un procés d'admissió propi (entrevista, prova) que no dependre només d'una nota de tall." },

  // Importància de la nota de tall (4)
  { tipus: 'likert', id: 'in1', dimensio: 'importanciaNota', text: "Em preocupa bastant si la meva nota serà suficient per entrar on vull." },
  { tipus: 'likert', id: 'in2', dimensio: 'importanciaNota', text: "Prefereixo tenir diverses opcions de reserva (plan B) per si la nota de tall puja." },
  { tipus: 'likert', id: 'in3', dimensio: 'importanciaNota', text: "Consulto o he consultat l'evolució de la nota de tall dels estudis que m'interessen." },
  { tipus: 'likert', id: 'in4', dimensio: 'importanciaNota', text: 'Triaria un estudi amb nota de tall més alta encara que sigui més exigent.' },

  // Importància de l'idioma (3)
  { tipus: 'likert', id: 'ii1', dimensio: 'importanciaIdioma', text: "M'agradaria que una part de les classes fossin en anglès o en un altre idioma estranger." },
  { tipus: 'likert', id: 'ii2', dimensio: 'importanciaIdioma', text: "El fet que uns estudis es facin en català o castellà influeix en la meva tria." },
  { tipus: 'likert', id: 'ii3', dimensio: 'importanciaIdioma', text: "M'interessa poder fer un intercanvi o una estada a l'estranger durant els estudis." },

  // Entrada directa (2)
  {
    tipus: 'numero',
    id: 'pressupost',
    dimensio: 'pressupostMax',
    text: 'Quin pressupost màxim anual tens pensat (aproximadament) per als estudis?',
    unitat: '€/any',
    min: 0,
    max: 20000,
    step: 100,
    valorPerDefecte: 2000,
  },
  {
    tipus: 'slider',
    id: 'desplacament',
    dimensio: 'disposatDesplacar',
    text: "Fins a quina distància de Terrassa estàs disposat/a a desplaçar-te cada dia (o a viure-hi a prop)?",
    unitat: 'km',
    min: 0,
    max: 100,
    step: 5,
    valorPerDefecte: 30,
  },
]
