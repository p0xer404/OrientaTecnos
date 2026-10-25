export type CategoriaHabilitat =
  | 'numerica'
  | 'verbal'
  | 'espacial'
  | 'social'
  | 'creativa'
  | 'manual'
  | 'organitzativa'

export const NOM_CATEGORIA_HABILITAT: Record<CategoriaHabilitat, string> = {
  numerica: 'Numèrica',
  verbal: 'Verbal',
  espacial: 'Espacial',
  social: 'Social',
  creativa: 'Creativa',
  manual: 'Manual',
  organitzativa: 'Organitzativa',
}

export interface PreguntaHabilitat {
  id: string
  text: string
  categoria: CategoriaHabilitat
}

// 30 preguntes originals, escala 1-5 ("Se'm dona molt malament" — "Se'm dona molt bé").
export const PREGUNTES_HABILITATS: PreguntaHabilitat[] = [
  // Numèrica (4)
  { id: 'n1', categoria: 'numerica', text: 'Calcular percentatges o repartiments de diners mentalment.' },
  { id: 'n2', categoria: 'numerica', text: 'Interpretar gràfics, taules o estadístiques.' },
  { id: 'n3', categoria: 'numerica', text: 'Resoldre problemes matemàtics o de lògica numèrica.' },
  { id: 'n4', categoria: 'numerica', text: 'Portar els comptes o el pressupost d\'una activitat.' },

  // Verbal (4)
  { id: 'v1', categoria: 'verbal', text: 'Redactar textos clars i ben estructurats.' },
  { id: 'v2', categoria: 'verbal', text: 'Explicar una idea complexa perquè tothom l\'entengui.' },
  { id: 'v3', categoria: 'verbal', text: 'Debatre o argumentar un punt de vista.' },
  { id: 'v4', categoria: 'verbal', text: 'Aprendre idiomes nous.' },

  // Espacial (4)
  { id: 'e1', categoria: 'espacial', text: 'Llegir plànols, mapes o esquemes.' },
  { id: 'e2', categoria: 'espacial', text: 'Imaginar com quedarà un objecte en 3D abans de construir-lo.' },
  { id: 'e3', categoria: 'espacial', text: 'Orientar-te en llocs que no coneixes.' },
  { id: 'e4', categoria: 'espacial', text: 'Encaixar peces, muntar mobles o fer trencaclosques.' },

  // Social (5)
  { id: 's1', categoria: 'social', text: 'Escoltar algú que té un problema i fer-lo sentir millor.' },
  { id: 's2', categoria: 'social', text: 'Treballar en equip i repartir tasques de manera justa.' },
  { id: 's3', categoria: 'social', text: 'Mediar en un conflicte entre dues persones.' },
  { id: 's4', categoria: 'social', text: 'Fer que algú nou se senti benvingut en un grup.' },
  { id: 's5', categoria: 'social', text: 'Donar feedback a algú sense que se senti malament.' },

  // Creativa (5)
  { id: 'c1', categoria: 'creativa', text: 'Tenir idees originals per a un projecte o un treball.' },
  { id: 'c2', categoria: 'creativa', text: 'Dibuixar, dissenyar o fer composicions visuals.' },
  { id: 'c3', categoria: 'creativa', text: 'Escriure històries, cançons o guions.' },
  { id: 'c4', categoria: 'creativa', text: 'Improvisar una solució quan no hi ha un model a seguir.' },
  { id: 'c5', categoria: 'creativa', text: 'Combinar idees de llocs diferents per crear-ne una de nova.' },

  // Manual (4)
  { id: 'm1', categoria: 'manual', text: 'Fer servir eines, màquines o aparells amb precisió.' },
  { id: 'm2', categoria: 'manual', text: 'Reparar o muntar objectes amb les mans.' },
  { id: 'm3', categoria: 'manual', text: 'Fer una feina manual de manera minuciosa durant una bona estona.' },
  { id: 'm4', categoria: 'manual', text: 'Seguir instruccions tècniques pas a pas per construir alguna cosa.' },

  // Organitzativa (4)
  { id: 'o1', categoria: 'organitzativa', text: 'Planificar un horari o un calendari de tasques.' },
  { id: 'o2', categoria: 'organitzativa', text: "Mantenir l'ordre en els teus apunts, carpetes o espai de treball." },
  { id: 'o3', categoria: 'organitzativa', text: 'Complir terminis sense deixar-ho tot per a l\'últim moment.' },
  { id: 'o4', categoria: 'organitzativa', text: 'Coordinar un grup de persones perquè una tasca surti bé.' },
]
