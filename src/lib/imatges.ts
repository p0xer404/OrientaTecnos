/** Fotografies d'estoc allotjades a /public/media (cap petició a tercers). Llicència gratuïta de Freepik/Magnific: exigeix citar l'autoria, vegeu l'Avís legal. */
export interface Imatge {
  fitxer: string
  amplada: number
  alcada: number
  autor: string
  /** Pàgina original de la fotografia (per al crèdit). */
  font: string
  titol: string
  /** Foto presa de la web oficial del centre (no és d'estoc). */
  delCentre?: boolean
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
    { fitxer: '/media/targetes/grau-7.webp', amplada: 640, alcada: 427, autor: 'magnific', font: 'https://www.magnific.com/free-photo/boy-studying-university-library_12296583.htm', titol: 'Estudiant a la biblioteca de la universitat' },
    { fitxer: '/media/targetes/grau-8.webp', amplada: 640, alcada: 427, autor: 'senivpetro', font: 'https://www.magnific.com/free-photo/student-woman-studying-library_5495022.htm', titol: 'Estudiant llegint a la biblioteca' },
    { fitxer: '/media/targetes/grau-9.webp', amplada: 640, alcada: 427, autor: 'DC Studio', font: 'https://www.magnific.com/free-photo/college-student-borrowing-some-books-study-upcoming-exams_417797909.htm', titol: 'Estudiant consultant llibres per als exàmens' },
    { fitxer: '/media/targetes/grau-10.webp', amplada: 640, alcada: 427, autor: 'zinkevych', font: 'https://www.magnific.com/free-photo/three-students-stylish-clothes-look-laptop-laugh-university-campus_18455020.htm', titol: 'Amics amb portàtil al campus' },
    { fitxer: '/media/targetes/grau-11.webp', amplada: 640, alcada: 427, autor: 'magnific', font: 'https://www.magnific.com/free-photo/college-girl-working-with-laptop-after-lessons_17080707.htm', titol: 'Noia treballant amb el portàtil després de classe' },
    { fitxer: '/media/targetes/grau-12.webp', amplada: 640, alcada: 427, autor: 'Kampus', font: 'https://www.magnific.com/free-photo/happy-university-students-using-laptop-while-sitting-hallway_26608119.htm', titol: 'Estudiants amb portàtil al passadís' },
    { fitxer: '/media/targetes/grau-13.webp', amplada: 640, alcada: 427, autor: 'frimufilms', font: 'https://www.magnific.com/free-photo/group-young-people-doing-experiments-robotics-laboratory-using-tools_68991215.htm', titol: 'Joves experimentant en un laboratori de robòtica' },
    { fitxer: '/media/targetes/grau-14.webp', amplada: 640, alcada: 426, autor: 'DC Studio', font: 'https://www.magnific.com/free-photo/girl-sideways-camera-looking-into-microscope-with-interest_31240141.htm', titol: 'Noia mirant pel microscopi' },
    { fitxer: '/media/targetes/grau-15.webp', amplada: 640, alcada: 427, autor: 'VectorFusionArt', font: 'https://www.magnific.com/free-photo/overhead-portrait-students-trendy-sneakers-chilling-floor-while-preparing-exams-together-university-friends-spending-time-together-using-laptops-writing-abstract_10484520.htm', titol: 'Estudiants preparant exàmens asseguts a terra' },
    { fitxer: '/media/targetes/grau-16.webp', amplada: 640, alcada: 427, autor: 'Wavebreak Media', font: 'https://www.magnific.com/free-photo/group-young-adults-studying-together-having-good-time-school-library_27508303.htm', titol: 'Joves estudiant junts a la biblioteca' },
    { fitxer: '/media/targetes/grau-17.webp', amplada: 640, alcada: 427, autor: 'prostooleh', font: 'https://www.magnific.com/free-photo/group-smiling-international-students-sitting-grass-together-park-university-african-caucasian-girls-indian-boy-talking-outdoors_20399115.htm', titol: 'Estudiants internacionals asseguts a l\'herba' },
    { fitxer: '/media/targetes/grau-18.webp', amplada: 640, alcada: 427, autor: 'creativeart', font: 'https://www.magnific.com/free-photo/medical-students-are-hallway-talking_7368637.htm', titol: 'Estudiants de medicina al passadís' },
  ],
  fp: [
    { fitxer: '/media/targetes/fp-1.webp', amplada: 640, alcada: 427, autor: 'Monkey Business Images', font: 'https://www.magnific.com/free-photo/listening-mentor-with-attention_5399616.htm', titol: 'Aprenents escoltant el mentor al taller' },
    { fitxer: '/media/targetes/fp-2.webp', amplada: 640, alcada: 427, autor: 'Wavebreak Media', font: 'https://www.magnific.com/free-photo/unrecognizable-casually-dressed-people-standing-around-table-brainstorming_5698162.htm', titol: 'Equip treballant al voltant d\'una taula' },
    { fitxer: '/media/targetes/fp-3.webp', amplada: 640, alcada: 427, autor: 'DC Studio', font: 'https://www.magnific.com/free-photo/repairmen-fix-car-battery-together_157526662.htm', titol: 'Mecànics reparant la bateria d\'un cotxe' },
    { fitxer: '/media/targetes/fp-4.webp', amplada: 640, alcada: 427, autor: 'DC Studio', font: 'https://www.magnific.com/free-photo/mechanics-working-fix-car-radiator_134841093.htm', titol: 'Mecànics reparant un radiador' },
    { fitxer: '/media/targetes/fp-5.webp', amplada: 640, alcada: 427, autor: 'teksomolika', font: 'https://www.magnific.com/free-photo/making-handmade-clay-pot-pottery-lesson-hobby_8390111.htm', titol: 'Classe de ceràmica modelant un pot d\'argila' },
    { fitxer: '/media/targetes/fp-6.webp', amplada: 640, alcada: 427, autor: 'magnific', font: 'https://www.magnific.com/free-photo/happy-woman-looking-photo_7570342.htm', titol: 'Dona contenta mirant una fotografia' },
    { fitxer: '/media/targetes/fp-7.webp', amplada: 640, alcada: 427, autor: 'DC Studio', font: 'https://www.magnific.com/free-photo/woodworker-apprentice-wearing-safety-glasses-while-using-bench-vise_226232101.htm', titol: 'Aprenent de fusteria amb ulleres de seguretat' },
    { fitxer: '/media/targetes/fp-8.webp', amplada: 640, alcada: 427, autor: 'pvproductions', font: 'https://www.magnific.com/free-photo/male-electrician-working-switchboard-male-electrician-overalls-working-with-electricity_415093453.htm', titol: 'Electricista treballant en un quadre elèctric' },
    { fitxer: '/media/targetes/fp-9.webp', amplada: 640, alcada: 427, autor: 'magnific', font: 'https://www.magnific.com/free-photo/male-car-mechanic-working-car-repair-shop_41552608.htm', titol: 'Mecànic en un taller de reparacions' },
    { fitxer: '/media/targetes/fp-10.webp', amplada: 640, alcada: 427, autor: 'magnific', font: 'https://www.magnific.com/free-photo/lifestyle-people-learning-make-sushi_33742967.htm', titol: 'Classe d\'aprendre a fer sushi' },
    { fitxer: '/media/targetes/fp-11.webp', amplada: 640, alcada: 427, autor: 'katemangostar', font: 'https://www.magnific.com/free-photo/serious-women-cooking-cutting-vegetables-kitchen_4999699.htm', titol: 'Dones tallant verdures a la cuina' },
    { fitxer: '/media/targetes/fp-12.webp', amplada: 640, alcada: 360, autor: 'DC Studio', font: 'https://www.magnific.com/free-photo/orthodontists-working-team-discussing-dental-operation-clinic-dentist-assistant-standing-stomatological-cabinet-while-talking-about-oral-equipment-teeth-examination_20741969.htm', titol: 'Equip d\'ortodòncia en una clínica dental' },
    { fitxer: '/media/targetes/fp-13.webp', amplada: 640, alcada: 427, autor: 'wavebreakmedia_micro', font: 'https://www.magnific.com/free-photo/nurse-using-digital-tablet-hospital-corridor_9597486.htm', titol: 'Infermera amb una tauleta a l\'hospital' },
    { fitxer: '/media/targetes/fp-14.webp', amplada: 640, alcada: 427, autor: 'magnific', font: 'https://www.magnific.com/free-photo/mechanic-working-car-suspension-repair-shop_38879069.htm', titol: 'Mecànics reparant una suspensió' },
    { fitxer: '/media/targetes/fp-15.webp', amplada: 640, alcada: 959, autor: 'magnific', font: 'https://www.magnific.com/free-photo/male-female-mechanics-working-shop-car_38049332.htm', titol: 'Mecànics treballant al taller' },
    { fitxer: '/media/targetes/fp-16.webp', amplada: 640, alcada: 404, autor: 'magnific', font: 'https://www.magnific.com/free-photo/hairdresser-taking-care-client-s-hair-indoors_13730498.htm', titol: 'Perruquera pentinant una clienta' },
    { fitxer: '/media/targetes/fp-17.webp', amplada: 640, alcada: 427, autor: 'DC Studio', font: 'https://www.magnific.com/free-photo/cabinetmaker-apprentice-inspecting-lumber-block-damages_189317594.htm', titol: 'Aprenent d\'ebenisteria revisant la fusta' },
    { fitxer: '/media/targetes/fp-18.webp', amplada: 640, alcada: 427, autor: 'magnific', font: 'https://www.magnific.com/free-photo/teaching-apprentice-use-electric-drill_5400775.htm', titol: 'Aprenent usant un trepant elèctric' },
    { fitxer: '/media/targetes/fp-19.webp', amplada: 640, alcada: 427, autor: 'gpointstudio', font: 'https://www.magnific.com/free-photo/close-up-experienced-carpenter-his-younger-employee_13250960.htm', titol: 'Fuster amb el seu ajudant' },
    { fitxer: '/media/targetes/fp-20.webp', amplada: 640, alcada: 427, autor: 'ProstoProfi', font: 'https://www.magnific.com/free-photo/young-man-engineer-making-program-analyses_7200232.htm', titol: 'Enginyer analitzant un programa' },
  ],
  batxillerat: [
    { fitxer: '/media/targetes/batxillerat-1.webp', amplada: 640, alcada: 427, autor: 'tereliukv', font: 'https://www.magnific.com/free-photo/young-students-classroom_12930089.htm', titol: 'Alumnes a l\'aula' },
    { fitxer: '/media/targetes/batxillerat-2.webp', amplada: 640, alcada: 959, autor: 'Daniel Dash', font: 'https://www.magnific.com/free-photo/young-cheerful-casual-students-with-notepad-leaning-table-while-happily-looking-camera-study-break-library-university_24288425.htm', titol: 'Estudiants somrients a la biblioteca' },
    { fitxer: '/media/targetes/batxillerat-3.webp', amplada: 640, alcada: 427, autor: 'magnific', font: 'https://www.magnific.com/free-photo/smiling-schoolkids_1233184.htm', titol: 'Alumnes somrients' },
    { fitxer: '/media/targetes/batxillerat-4.webp', amplada: 640, alcada: 427, autor: 'garetsvisual', font: 'https://www.magnific.com/free-photo/young-female-student-with-book-thoughtfully-working-new-study-project-library-university_23177815.htm', titol: 'Estudiant amb un llibre a la biblioteca' },
    { fitxer: '/media/targetes/batxillerat-5.webp', amplada: 640, alcada: 427, autor: 'Wavebreak Media', font: 'https://www.magnific.com/free-photo/young-students-classroom_12930085.htm', titol: 'Grup d\'alumnes a classe' },
    { fitxer: '/media/targetes/batxillerat-6.webp', amplada: 640, alcada: 959, autor: 'magnific', font: 'https://www.magnific.com/free-photo/seminar-high-school_5399600.htm', titol: 'Seminari en un institut' },
    { fitxer: '/media/targetes/batxillerat-7.webp', amplada: 640, alcada: 427, autor: 'magnific', font: 'https://www.magnific.com/free-photo/teenagers-learning-together-stairs_4912230.htm', titol: 'Adolescents aprenent junts a les escales' },
    { fitxer: '/media/targetes/batxillerat-8.webp', amplada: 640, alcada: 427, autor: 'magnific', font: 'https://www.magnific.com/free-photo/teenagers-doing-homework-together-stairs_4912234.htm', titol: 'Adolescents fent els deures a les escales' },
    { fitxer: '/media/targetes/batxillerat-9.webp', amplada: 640, alcada: 427, autor: 'magnific', font: 'https://www.magnific.com/free-photo/teenager-glasses-studying-with-friends_2652743.htm', titol: 'Adolescent amb ulleres estudiant amb amics' },
    { fitxer: '/media/targetes/batxillerat-10.webp', amplada: 640, alcada: 427, autor: 'magnific', font: 'https://www.magnific.com/free-photo/teenagers-studying-together_1302500.htm', titol: 'Adolescents estudiant junts' },
    { fitxer: '/media/targetes/batxillerat-11.webp', amplada: 640, alcada: 640, autor: 'creativeart', font: 'https://www.magnific.com/free-photo/students-doing-homework-park_3222451.htm', titol: 'Alumnes fent els deures al parc' },
    { fitxer: '/media/targetes/batxillerat-12.webp', amplada: 640, alcada: 425, autor: 'magnific', font: 'https://www.magnific.com/free-photo/colleagues-studying-together-group-study_21076658.htm', titol: 'Companys estudiant en grup' },
    { fitxer: '/media/targetes/batxillerat-13.webp', amplada: 640, alcada: 425, autor: 'magnific', font: 'https://www.magnific.com/free-photo/classmates-learning-together-group-study_21076640.htm', titol: 'Companys aprenent junts' },
    { fitxer: '/media/targetes/batxillerat-14.webp', amplada: 640, alcada: 425, autor: 'magnific', font: 'https://www.magnific.com/free-photo/young-students-learning-together-group-study_21076680.htm', titol: 'Joves aprenent en grup' },
    { fitxer: '/media/targetes/batxillerat-15.webp', amplada: 640, alcada: 427, autor: 'magnific', font: 'https://www.magnific.com/free-photo/cheerful-young-girl-classroom_1302443.htm', titol: 'Noia alegre a l\'aula' },
    { fitxer: '/media/targetes/batxillerat-16.webp', amplada: 640, alcada: 427, autor: 'magnific', font: 'https://www.magnific.com/free-photo/youngsters-school-studying-together_1308447.htm', titol: 'Joves estudiant junts a l\'institut' },
    { fitxer: '/media/targetes/batxillerat-17.webp', amplada: 640, alcada: 427, autor: 'magnific', font: 'https://www.magnific.com/free-photo/studying-girl-classroom_1302448.htm', titol: 'Noia estudiant a classe' },
    { fitxer: '/media/targetes/batxillerat-18.webp', amplada: 640, alcada: 959, autor: 'magnific', font: 'https://www.magnific.com/free-photo/side-view-friends-chatting_9471438.htm', titol: 'Amics conversant' },
    { fitxer: '/media/targetes/batxillerat-19.webp', amplada: 640, alcada: 959, autor: 'magnific', font: 'https://www.magnific.com/free-photo/student-gesturing-thumb-up_1363425.htm', titol: 'Estudiant amb el polze amunt' },
    { fitxer: '/media/targetes/batxillerat-20.webp', amplada: 640, alcada: 427, autor: 'Wavebreak Media', font: 'https://www.magnific.com/free-photo/close-up-cheerful-teenagers_863038.htm', titol: 'Adolescents alegres' },
    { fitxer: '/media/targetes/batxillerat-21.webp', amplada: 640, alcada: 427, autor: 'seventyfour', font: 'https://www.magnific.com/free-photo/close-up-teenagers-using-laptop_862465.htm', titol: 'Adolescents amb un portàtil' },
  ],
  artistic: [
    { fitxer: '/media/targetes/artistic-1.webp', amplada: 640, alcada: 427, autor: 'tonodiaz', font: 'https://www.magnific.com/free-photo/middle-age-hispanic-woman-smiling-confident-drawing-art-studio_47770317.htm', titol: 'Dona pintant en un estudi d\'art' },
    { fitxer: '/media/targetes/artistic-2.webp', amplada: 640, alcada: 427, autor: 'romanzaiets', font: 'https://www.magnific.com/free-photo/group-young-artist-girls-having-draw-lesson-art-studio_38865838.htm', titol: 'Noies en una classe de dibuix' },
    { fitxer: '/media/targetes/artistic-3.webp', amplada: 640, alcada: 427, autor: 'krakenimages.com', font: 'https://www.magnific.com/free-photo/group-people-smiling-happy-drawing-canvas-standing-art-studio_38866691.htm', titol: 'Grup pintant llenços a l\'estudi' },
    { fitxer: '/media/targetes/artistic-4.webp', amplada: 640, alcada: 427, autor: 'romanzaiets', font: 'https://www.magnific.com/free-photo/rear-view-couple-young-adults-working-their-own-paintings-while-studying-art-school_27507333.htm', titol: 'Joves pintant a l\'escola d\'art' },
    { fitxer: '/media/targetes/artistic-5.webp', amplada: 640, alcada: 427, autor: 'tonodiaz', font: 'https://www.magnific.com/free-photo/portrait-gorgeous-young-female-artist-working-her-most-recent-art-project-studio-smiling_27507426.htm', titol: 'Artista somrient al seu estudi' },
    { fitxer: '/media/targetes/artistic-6.webp', amplada: 640, alcada: 427, autor: 'DC Studio', font: 'https://www.magnific.com/free-photo/young-woman-teacher-having-drawing-lesson-art-school-teaching-different-aged-people-draw-group-diverse-students-learning-sketching-techniques-creative-activities-adults_51110558.htm', titol: 'Professora en una classe de dibuix' },
    { fitxer: '/media/targetes/artistic-7.webp', amplada: 640, alcada: 959, autor: 'Patramanskyi', font: 'https://www.magnific.com/free-photo/female-student-playing-piano_8402336.htm', titol: 'Estudiant tocant el piano' },
    { fitxer: '/media/targetes/artistic-8.webp', amplada: 640, alcada: 427, autor: 'Wavebreak Media', font: 'https://www.magnific.com/free-photo/female-student-looking-sheet-music-while-playing-piano_8402405.htm', titol: 'Estudiant llegint una partitura al piano' },
    { fitxer: '/media/targetes/artistic-9.webp', amplada: 640, alcada: 427, autor: 'tereliukv', font: 'https://www.magnific.com/free-photo/two-beautiful-slender-girls-doing-dancing-gymnastics-dance-hall_2534072.htm', titol: 'Noies ballant en una sala de dansa' },
    { fitxer: '/media/targetes/artistic-10.webp', amplada: 640, alcada: 427, autor: 'senivpetro', font: 'https://www.magnific.com/free-photo/dancer-team-studio_3204536.htm', titol: 'Equip de ball a l\'estudi' },
    { fitxer: '/media/targetes/artistic-11.webp', amplada: 640, alcada: 427, autor: 'vgstockstudio', font: 'https://www.magnific.com/free-photo/creative-designers-working-project-together_9812463.htm', titol: 'Dissenyadors creatius treballant junts' },
    { fitxer: '/media/targetes/artistic-12.webp', amplada: 640, alcada: 959, autor: 'DC Studio', font: 'https://www.magnific.com/free-photo/graphic-designers-working-their-desk_1005953.htm', titol: 'Dissenyadors gràfics a l\'escriptori' },
    { fitxer: '/media/targetes/artistic-13.webp', amplada: 640, alcada: 427, autor: 'katemangostar', font: 'https://www.magnific.com/free-photo/painting-class-adults_4166940.htm', titol: 'Classe de pintura per a adults' },
    { fitxer: '/media/targetes/artistic-14.webp', amplada: 640, alcada: 427, autor: 'chamanexperience', font: 'https://www.magnific.com/free-photo/young-woman-with-professional-camera-takes-photo-nature_30132966.htm', titol: 'Jove fotògrafa amb càmera professional' },
    { fitxer: '/media/targetes/artistic-15.webp', amplada: 640, alcada: 427, autor: 'benzoix', font: 'https://www.magnific.com/free-photo/young-student-photographer-sits-street-stairs-checks-her-shots-professional-camera-taking_38798070.htm', titol: 'Estudiant de fotografia revisant les seves imatges' },
    { fitxer: '/media/targetes/artistic-16.webp', amplada: 640, alcada: 427, autor: 'magnific', font: 'https://www.magnific.com/free-photo/man-filming-with-professional-camera_17342892.htm', titol: 'Home filmant amb càmera professional' },
    { fitxer: '/media/targetes/artistic-17.webp', amplada: 640, alcada: 959, autor: 'magnific', font: 'https://www.magnific.com/free-photo/people-working-together-new-movie_17342932.htm', titol: 'Equip rodant una pel·lícula' },
    { fitxer: '/media/targetes/artistic-18.webp', amplada: 640, alcada: 426, autor: 'golubovystock', font: 'https://www.magnific.com/free-photo/team-photographers-showing-pictures-screen-camera-twins-models-girls-studio-professional-photographer-work_26284775.htm', titol: 'Fotògrafs revisant imatges en un plató' },
    { fitxer: '/media/targetes/artistic-19.webp', amplada: 640, alcada: 427, autor: 'gpointstudio', font: 'https://www.magnific.com/free-photo/fashion-designers-cooperation-new-collection_13133328.htm', titol: 'Dissenyadors de moda col·laborant' },
    { fitxer: '/media/targetes/artistic-20.webp', amplada: 640, alcada: 959, autor: 'magnific', font: 'https://www.magnific.com/free-photo/female-hands-working-pottery-wheel_28741772.htm', titol: 'Mans modelant en un torn de ceràmica' },
  ],
}

function barrejar<T>(llista: T[]): T[] {
  const copia = [...llista]
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copia[i], copia[j]] = [copia[j], copia[i]]
  }
  return copia
}

/** Ordre barrejat de les fotos de cada tipus; canvia a cada visita perquè la web no sembli sempre igual. */
const ORDRE_PER_TIPUS = Object.fromEntries(
  (Object.keys(GALERIA) as (keyof typeof GALERIA)[]).map((t) => [t, barrejar([IMATGES[IMATGE_PER_TIPUS[t]] as Imatge, ...GALERIA[t]])]),
) as Record<keyof typeof GALERIA, Imatge[]>

/**
 * Reparteix una foto a cada estudi: la de la web del seu centre si n'hi ha (`propia`) i, si no, una d'estoc
 * recorrent, per tipus, l'ordre barrejat (no es repeteix cap foto fins que s'han vist totes les del tipus). Només depèn de l'ordre de la llista, de manera que en afegir
 * més resultats al final les fotos dels primers no canvien.
 */
export function assignarImatges<E extends { id: string; tipus: keyof typeof GALERIA }>(
  estudis: E[],
  propia?: (e: E) => Imatge | null,
): Map<string, Imatge> {
  const cursors: Record<string, number> = {}
  const assignades = new Map<string, Imatge>()
  for (const e of estudis) {
    const delCentre = propia?.(e)
    if (delCentre) {
      assignades.set(e.id, delCentre)
      continue
    }
    const pool = ORDRE_PER_TIPUS[e.tipus]
    const i = cursors[e.tipus] ?? 0
    cursors[e.tipus] = i + 1
    assignades.set(e.id, pool[i % pool.length])
  }
  return assignades
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
