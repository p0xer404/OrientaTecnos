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
