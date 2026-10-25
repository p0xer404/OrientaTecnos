/** Fotografies d'estoc allotjades a /public/media (cap petició a tercers). Llicència gratuïta de Freepik/Magnific: exigeix citar l'autoria, vegeu l'Avís legal. */
export interface Imatge {
  fitxer: string
  amplada: number
  alcada: number
  autor: string
  /** Pàgina original de la fotografia (per al crèdit). */
  font: string
  titol: string
}

export const IMATGES = {
  hero: {
    fitxer: '/media/hero.webp',
    amplada: 1600,
    alcada: 1066,
    autor: 'koldo_studio_videos',
    font: 'https://www.magnific.com/free-photo/friends-with-smile-happy-emotions-university_17080541.htm',
    titol: 'Amics somrients a la universitat',
  },
  alumnes: {
    fitxer: '/media/alumnes.webp',
    amplada: 1000,
    alcada: 667,
    autor: 'jcomp',
    font: 'https://www.magnific.com/free-photo/group-happy-friends-student-talking-about-knowledge-cafe_2524771.htm',
    titol: 'Grup d\'amics estudiants parlant en una cafeteria',
  },
  orientadors: {
    fitxer: '/media/orientadors.webp',
    amplada: 1000,
    alcada: 800,
    autor: 'magnific',
    font: 'https://www.magnific.com/free-photo/colleagues-brainstorming-together-office_7816207.htm',
    titol: 'Dues persones treballant juntes davant un portàtil',
  },
  graus: {
    fitxer: '/media/graus.webp',
    amplada: 1000,
    alcada: 667,
    autor: 'zinkevych',
    font: 'https://www.magnific.com/free-photo/boy-girl-communicating-university_24806832.htm',
    titol: 'Noi i noia conversant a la universitat',
  },
  fp: {
    fitxer: '/media/fp.webp',
    amplada: 1000,
    alcada: 667,
    autor: 'magnific',
    font: 'https://www.magnific.com/free-photo/small-business-manager-his-workshop_18266929.htm',
    titol: 'Responsable d\'un taller amb dos aprenents',
  },
  batxillerat: {
    fitxer: '/media/batxillerat.webp',
    amplada: 1000,
    alcada: 563,
    autor: 'magnific',
    font: 'https://www.magnific.com/free-photo/schoolkids-writing-something-down_1233191.htm',
    titol: 'Alumnes d\'institut prenent apunts',
  },
  artistic: {
    fitxer: '/media/artistic.webp',
    amplada: 1000,
    alcada: 667,
    autor: 'silverkblack',
    font: 'https://www.magnific.com/free-photo/portrait-gorgeous-female-artist-working-several-art-projects-her-studio_27507385.htm',
    titol: 'Artista treballant al seu estudi',
  },
  login: {
    fitxer: '/media/login.webp',
    amplada: 900,
    alcada: 1350,
    autor: 'benzoix',
    font: 'https://www.magnific.com/free-photo/vertical-shot-asian-girl-sits-floor-home-working-laptop-studying-cozy-place-using-com_36505422.htm',
    titol: 'Noia estudiant amb un portàtil a casa',
  },
  guia: {
    fitxer: '/media/guia.webp',
    amplada: 1000,
    alcada: 667,
    autor: 'magnific',
    font: 'https://www.magnific.com/free-photo/stationery-desktop_1459909.htm',
    titol: 'Material d\'escriptori sobre una taula',
  },
} satisfies Record<string, Imatge>

export type NomImatge = keyof typeof IMATGES

/** Foto representativa de cada tipus d'estudi (targetes i bàner del cercador). */
export const IMATGE_PER_TIPUS: Record<'grau' | 'fp' | 'batxillerat' | 'artistic', NomImatge> = {
  grau: 'graus',
  fp: 'fp',
  batxillerat: 'batxillerat',
  artistic: 'artistic',
}

/** Fotos addicionals per variar les targetes dels resultats (mateix tipus d'estudi, imatges diferents). */
export const GALERIA: Record<'grau' | 'fp' | 'batxillerat' | 'artistic', Imatge[]> = {
  grau: [
    { fitxer: '/media/targetes/grau-1.webp', amplada: 640, alcada: 427, autor: 'magnific', font: 'https://www.magnific.com/free-photo/young-students-attending-university-class_12296475.htm', titol: 'Estudiant amb portàtil a l\'aula' },
    { fitxer: '/media/targetes/grau-2.webp', amplada: 640, alcada: 427, autor: 'magnific', font: 'https://www.magnific.com/free-photo/young-students-attending-university-class_12296482.htm', titol: 'Estudiants a classe d\'universitat' },
    { fitxer: '/media/targetes/grau-3.webp', amplada: 640, alcada: 427, autor: 'magnific', font: 'https://www.magnific.com/free-photo/girl-laughing-with-friends-university_1396754.htm', titol: 'Noia rient amb amics a la universitat' },
    { fitxer: '/media/targetes/grau-4.webp', amplada: 640, alcada: 427, autor: 'magnific', font: 'https://www.magnific.com/free-photo/girl-with-notebook-lecture_1396753.htm', titol: 'Noia amb quadern en una classe magistral' },
    { fitxer: '/media/targetes/grau-5.webp', amplada: 640, alcada: 427, autor: 'magnific', font: 'https://www.magnific.com/free-photo/friends-chatting-lecture-hall_1396747.htm', titol: 'Amics conversant a l\'aula' },
    { fitxer: '/media/targetes/grau-6.webp', amplada: 640, alcada: 427, autor: 'futurevision', font: 'https://www.magnific.com/free-photo/indoor-portrait-international-students-waiting-teacher-lecture-hall-blonde-european-girl-sitting-desk-talking-about-test-with-university-mates_22048445.htm', titol: 'Estudiants internacionals esperant el professor' },
  ],
  fp: [
    { fitxer: '/media/targetes/fp-1.webp', amplada: 640, alcada: 427, autor: 'Monkey Business Images', font: 'https://www.magnific.com/free-photo/listening-mentor-with-attention_5399616.htm', titol: 'Aprenents escoltant el mentor al taller' },
    { fitxer: '/media/targetes/fp-2.webp', amplada: 640, alcada: 427, autor: 'Wavebreak Media', font: 'https://www.magnific.com/free-photo/unrecognizable-casually-dressed-people-standing-around-table-brainstorming_5698162.htm', titol: 'Equip treballant al voltant d\'una taula' },
    { fitxer: '/media/targetes/fp-3.webp', amplada: 640, alcada: 427, autor: 'DC Studio', font: 'https://www.magnific.com/free-photo/repairmen-fix-car-battery-together_157526662.htm', titol: 'Mecànics reparant la bateria d\'un cotxe' },
    { fitxer: '/media/targetes/fp-4.webp', amplada: 640, alcada: 427, autor: 'DC Studio', font: 'https://www.magnific.com/free-photo/mechanics-working-fix-car-radiator_134841093.htm', titol: 'Mecànics reparant un radiador' },
    { fitxer: '/media/targetes/fp-5.webp', amplada: 640, alcada: 427, autor: 'teksomolika', font: 'https://www.magnific.com/free-photo/making-handmade-clay-pot-pottery-lesson-hobby_8390111.htm', titol: 'Classe de ceràmica modelant un pot d\'argila' },
    { fitxer: '/media/targetes/fp-6.webp', amplada: 640, alcada: 427, autor: 'magnific', font: 'https://www.magnific.com/free-photo/happy-woman-looking-photo_7570342.htm', titol: 'Dona contenta mirant una fotografia' },
  ],
  batxillerat: [
    { fitxer: '/media/targetes/batxillerat-1.webp', amplada: 640, alcada: 427, autor: 'tereliukv', font: 'https://www.magnific.com/free-photo/young-students-classroom_12930089.htm', titol: 'Alumnes a l\'aula' },
    { fitxer: '/media/targetes/batxillerat-2.webp', amplada: 640, alcada: 959, autor: 'Daniel Dash', font: 'https://www.magnific.com/free-photo/young-cheerful-casual-students-with-notepad-leaning-table-while-happily-looking-camera-study-break-library-university_24288425.htm', titol: 'Estudiants somrients a la biblioteca' },
    { fitxer: '/media/targetes/batxillerat-3.webp', amplada: 640, alcada: 427, autor: 'magnific', font: 'https://www.magnific.com/free-photo/smiling-schoolkids_1233184.htm', titol: 'Alumnes somrients' },
    { fitxer: '/media/targetes/batxillerat-4.webp', amplada: 640, alcada: 427, autor: 'garetsvisual', font: 'https://www.magnific.com/free-photo/young-female-student-with-book-thoughtfully-working-new-study-project-library-university_23177815.htm', titol: 'Estudiant amb un llibre a la biblioteca' },
    { fitxer: '/media/targetes/batxillerat-5.webp', amplada: 640, alcada: 427, autor: 'Wavebreak Media', font: 'https://www.magnific.com/free-photo/young-students-classroom_12930085.htm', titol: 'Grup d\'alumnes a classe' },
    { fitxer: '/media/targetes/batxillerat-6.webp', amplada: 640, alcada: 959, autor: 'magnific', font: 'https://www.magnific.com/free-photo/seminar-high-school_5399600.htm', titol: 'Seminari en un institut' },
  ],
  artistic: [
    { fitxer: '/media/targetes/artistic-1.webp', amplada: 640, alcada: 427, autor: 'tonodiaz', font: 'https://www.magnific.com/free-photo/middle-age-hispanic-woman-smiling-confident-drawing-art-studio_47770317.htm', titol: 'Dona pintant en un estudi d\'art' },
    { fitxer: '/media/targetes/artistic-2.webp', amplada: 640, alcada: 427, autor: 'romanzaiets', font: 'https://www.magnific.com/free-photo/group-young-artist-girls-having-draw-lesson-art-studio_38865838.htm', titol: 'Noies en una classe de dibuix' },
    { fitxer: '/media/targetes/artistic-3.webp', amplada: 640, alcada: 427, autor: 'krakenimages.com', font: 'https://www.magnific.com/free-photo/group-people-smiling-happy-drawing-canvas-standing-art-studio_38866691.htm', titol: 'Grup pintant llenços a l\'estudi' },
    { fitxer: '/media/targetes/artistic-4.webp', amplada: 640, alcada: 427, autor: 'romanzaiets', font: 'https://www.magnific.com/free-photo/rear-view-couple-young-adults-working-their-own-paintings-while-studying-art-school_27507333.htm', titol: 'Joves pintant a l\'escola d\'art' },
    { fitxer: '/media/targetes/artistic-5.webp', amplada: 640, alcada: 427, autor: 'tonodiaz', font: 'https://www.magnific.com/free-photo/portrait-gorgeous-young-female-artist-working-her-most-recent-art-project-studio-smiling_27507426.htm', titol: 'Artista somrient al seu estudi' },
    { fitxer: '/media/targetes/artistic-6.webp', amplada: 640, alcada: 427, autor: 'DC Studio', font: 'https://www.magnific.com/free-photo/young-woman-teacher-having-drawing-lesson-art-school-teaching-different-aged-people-draw-group-diverse-students-learning-sketching-techniques-creative-activities-adults_51110558.htm', titol: 'Professora en una classe de dibuix' },
  ],
}

/** Tria una foto estable per a cada estudi: la principal del tipus o una de la galeria, segons el seu id. */
export function imatgePerEstudi(tipus: keyof typeof GALERIA, id: string): Imatge {
  const opcions = [IMATGES[IMATGE_PER_TIPUS[tipus]], ...GALERIA[tipus]]
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0
  return opcions[hash % opcions.length]
}

/** Totes les fotos de la web, sense repetits (per als crèdits). */
export function totesLesImatges(): Imatge[] {
  const totes = [...Object.values(IMATGES), ...Object.values(GALERIA).flat()]
  return totes.filter((img, i) => totes.findIndex((o) => o.fitxer === img.fitxer) === i)
}
