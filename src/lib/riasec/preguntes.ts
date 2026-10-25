import type { PerfilRiasec } from '../../types/domain'

export interface AfirmacioRiasec {
  id: string
  text: string
  perfil: PerfilRiasec
}

// 48 afirmacions originals (8 per perfil), escala 1-5 ("Gens d'acord" — "Totalment d'acord").
export const AFIRMACIONS_RIASEC: AfirmacioRiasec[] = [
  // Realista
  { id: 'r1', perfil: 'R', text: "Prefereixo muntar o reparar un objecte amb les mans que explicar com es fa." },
  { id: 'r2', perfil: 'R', text: 'Em sento còmode utilitzant eines, màquines o aparells tècnics.' },
  { id: 'r3', perfil: 'R', text: "M'agrada més estar a l'aire lliure o en un taller que tancat en una oficina." },
  { id: 'r4', perfil: 'R', text: "Gaudeixo fent activitat física o esport de manera habitual." },
  { id: 'r5', perfil: 'R', text: "Si una cosa es trenca a casa, m'agrada intentar arreglar-la jo mateix/a." },
  { id: 'r6', perfil: 'R', text: "Prefereixo veure resultats concrets i tangibles del meu treball." },
  { id: 'r7', perfil: 'R', text: "M'interessa més com funciona un motor o una instal·lació que una teoria abstracta." },
  { id: 'r8', perfil: 'R', text: "No em fa res embrutar-me les mans si cal per acabar una feina." },

  // Investigador
  { id: 'i1', perfil: 'I', text: "M'agrada entendre per què passen les coses abans de prendre una decisió." },
  { id: 'i2', perfil: 'I', text: "Gaudeixo resolent problemes de matemàtiques, física o lògica." },
  { id: 'i3', perfil: 'I', text: "Em passaria hores investigant un tema que m'interessa de debò." },
  { id: 'i4', perfil: 'I', text: "Prefereixo analitzar dades i fets abans de treure conclusions." },
  { id: 'i5', perfil: 'I', text: "Em consideren una persona curiosa que fa moltes preguntes." },
  { id: 'i6', perfil: 'I', text: "M'agraden els documentals o articles científics sobre com funciona el món." },
  { id: 'i7', perfil: 'I', text: "Prefereixo treballar sol/a en un problema complex que en grup en una tasca senzilla." },
  { id: 'i8', perfil: 'I', text: "Quan no entenc com funciona alguna cosa, necessito esbrinar-ho." },

  // Artístic
  { id: 'a1', perfil: 'A', text: "M'agrada dibuixar, escriure, tocar un instrument o crear coses originals." },
  { id: 'a2', perfil: 'A', text: "Prefereixo tenir llibertat per fer les coses a la meva manera que seguir un model fix." },
  { id: 'a3', perfil: 'A', text: "M'emociono amb l'art, el cinema, la música o el disseny." },
  { id: 'a4', perfil: 'A', text: "Se'm donen bé les activitats creatives o d'expressió (teatre, dansa, fotografia...)." },
  { id: 'a5', perfil: 'A', text: "Sovint se m'acudeixen idees originals que els altres no havien pensat." },
  { id: 'a6', perfil: 'A', text: "M'agrada més improvisar que seguir sempre un procediment establert." },
  { id: 'a7', perfil: 'A', text: "Gaudeixo decorant, dissenyant o donant un toc personal a allò que faig." },
  { id: 'a8', perfil: 'A', text: "M'interessa més expressar una idea de manera original que de manera convencional." },

  // Social
  { id: 's1', perfil: 'S', text: "M'agrada ajudar els companys quan tenen un dubte o un problema." },
  { id: 's2', perfil: 'S', text: "Se'm dona bé escoltar i entendre com se senten les altres persones." },
  { id: 's3', perfil: 'S', text: "M'imagino treballant en educació, salut o atenció a les persones." },
  { id: 's4', perfil: 'S', text: "Prefereixo treballar en equip que en solitari." },
  { id: 's5', perfil: 'S', text: "La gent em diu sovint els seus problemes perquè confien en mi." },
  { id: 's6', perfil: 'S', text: "M'agradaria fer de voluntari/a o col·laborar en causes socials." },
  { id: 's7', perfil: 'S', text: "Gaudeixo explicant coses a altres persones i veure que les entenen." },
  { id: 's8', perfil: 'S', text: "Em preocupo pel benestar del grup, no només pel meu." },

  // Emprenedor
  { id: 'e1', perfil: 'E', text: "M'agrada liderar un grup i organitzar com es fan les coses." },
  { id: 'e2', perfil: 'E', text: "Se'm dona bé convèncer altres persones de les meves idees." },
  { id: 'e3', perfil: 'E', text: "M'atrau la idea de crear el meu propi negoci o projecte algun dia." },
  { id: 'e4', perfil: 'E', text: "No em fa por assumir riscos si crec que val la pena." },
  { id: 'e5', perfil: 'E', text: "Gaudeixo parlant en públic o presentant idees davant de molta gent." },
  { id: 'e6', perfil: 'E', text: "M'agrada competir i posar-me objectius ambiciosos." },
  { id: 'e7', perfil: 'E', text: "Prefereixo prendre decisions ràpides que esperar a tenir-ho tot comprovat." },
  { id: 'e8', perfil: 'E', text: "Sovint acabo sent jo qui pren la iniciativa en un grup de treball." },

  // Convencional
  { id: 'c1', perfil: 'C', text: "M'agrada tenir les coses ordenades, planificades i ben organitzades." },
  { id: 'c2', perfil: 'C', text: "Prefereixo seguir un procediment clar que improvisar sobre la marxa." },
  { id: 'c3', perfil: 'C', text: "Se'm dona bé treballar amb dades, xifres, fulls de càlcul o bases de dades." },
  { id: 'c4', perfil: 'C', text: "Em sento còmode complint normes, terminis i horaris." },
  { id: 'c5', perfil: 'C', text: "Reviso els detalls per assegurar-me que no hi ha errors." },
  { id: 'c6', perfil: 'C', text: "Prefereixo tasques estables i predictibles a tasques sempre canviants." },
  { id: 'c7', perfil: 'C', text: "M'agrada classificar, arxivar o posar ordre a la informació." },
  { id: 'c8', perfil: 'C', text: "Em resulta satisfactori completar una llista de tasques punt per punt." },
]
