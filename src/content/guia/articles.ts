export interface ArticleGuia {
  slug: string
  titol: string
  resum: string
  cos: string[] // paràgrafs
  enllaços?: { text: string; url: string }[]
}

export const ARTICLES_GUIA: ArticleGuia[] = [
  {
    slug: 'preinscripcio-universitaria',
    titol: 'Com funciona la preinscripció universitària',
    resum: 'El procés que cal seguir per accedir a un grau universitari públic a Catalunya.',
    cos: [
      'La preinscripció universitària és el procés únic a través del qual l\'alumnat de Catalunya sol·licita plaça als graus de les universitats públiques i als centres adscrits. Es fa en línia, en un període concret (normalment entre maig i juliol), i permet demanar fins a 8 opcions ordenades per preferència.',
      'Un cop fetes les proves d\'accés (PAU o altres vies), s\'assigna una nota d\'admissió a cada sol·licitud. Les places es reparteixen seguint l\'ordre de nota d\'admissió entre totes les persones que han triat aquell estudi, fins a exhaurir les places disponibles.',
      'Hi ha diverses convocatòries d\'assignació durant l\'estiu: si no s\'obté la primera opció, es manté la sol·licitud per a la resta de llistes fins que surt plaça o s\'esgoten les opcions triades.',
      'Les universitats privades i els estudis amb admissió pròpia (com l\'ESCAC o Esade) no passen per aquest procés: cada centre gestiona el seu propi calendari i proves d\'accés.',
    ],
    enllaços: [{ text: 'Portal oficial de preinscripció', url: 'https://preinscripcio.gencat.cat' }],
  },
  {
    slug: 'nota-admissio',
    titol: "Què és la nota d'accés i com es calcula la nota d'admissió",
    resum: 'La diferència entre la nota que obres amb el Batxillerat i la que compta realment per entrar a cada grau.',
    cos: [
      'La nota d\'accés a la universitat (sobre 14) es calcula a partir de la qualificació mitjana del Batxillerat (fase general, amb un pes del 60%) i la qualificació de les proves d\'accés (PAU, amb un pes del 40%).',
      'A partir d\'aquesta nota d\'accés es calcula la nota d\'admissió específica per a cada grau, que pot pujar fins a 14 gràcies a la fase específica: es poden presentar fins a 3 matèries de les PAU que, si estan vinculades a l\'estudi triat, es ponderen amb un factor de 0,1 o 0,2 segons la universitat i el grau.',
      'Per això, dues persones amb la mateixa nota d\'accés poden tenir notes d\'admissió diferents per a un mateix grau, depenent de quines matèries específiques s\'hagin presentat i com s\'hagin ponderat.',
    ],
    enllaços: [{ text: 'Preus i accés a la universitat', url: 'https://universitats.gencat.cat' }],
  },
  {
    slug: 'nota-de-tall',
    titol: 'Què és la nota de tall',
    resum: 'Per què algunes notes de tall pugen cada any i com interpretar-les.',
    cos: [
      'La nota de tall d\'un grau és la nota d\'admissió de l\'última persona admesa a la primera assignació, un cop repartides totes les places disponibles entre totes les sol·licituds rebudes aquell any.',
      'No és un llistó fixat prèviament per la universitat, sinó un resultat de l\'oferta i la demanda d\'aquell curs: si un grau té poques places i molta demanda, la nota de tall puja; si en té moltes o hi ha menys demanda, pot baixar fins al mínim (5, que vol dir que van entrar totes les persones que ho van demanar).',
      'Per això és útil mirar l\'evolució dels últims anys (a la fitxa de cada grau en aquesta web) més que no pas fixar-se només en l\'últim valor: una nota de tall pot variar bastant d\'un any a l\'altre.',
    ],
  },
  {
    slug: 'pap',
    titol: 'Què són les PAP',
    resum: "Les proves d'admissió pròpies que exigeixen alguns centres, més enllà de la nota de tall.",
    cos: [
      'Algunes titulacions, sobretot vinculades a les arts, l\'audiovisual o el disseny, exigeixen superar una Prova d\'Aptitud Personal (PAP) a més (o en lloc) de la preinscripció universitària. És el cas, per exemple, de l\'ESCAC (cinema) o de diversos ensenyaments artístics superiors.',
      'Les PAP solen incloure un portafoli de treballs propis, una prova pràctica, una entrevista personal o una combinació d\'aquests elements, i tenen un calendari i un cost propis, independents de la preinscripció.',
      'És important informar-se amb temps de les dates de cada PAP, ja que solen ser abans que la preinscripció general i, si no se superen, no es pot accedir a l\'estudi encara que la nota sigui suficient.',
    ],
  },
  {
    slug: 'grau-fp-artistics',
    titol: 'Diferència entre grau, FP i ensenyaments artístics superiors',
    resum: 'Tres camins diferents, amb durades, títols i formes d\'accés diferents.',
    cos: [
      'Un grau universitari dura normalment 4 anys (240 crèdits ECTS) i s\'obté a través de la preinscripció universitària (nota de tall) o d\'un procés d\'admissió propi en el cas de moltes universitats privades.',
      'Un cicle de Formació Professional (FP) té una orientació molt més pràctica i professionalitzadora. Els cicles de grau mitjà i superior duren normalment 2 cursos; també hi ha cursos d\'especialització més curts. S\'hi accedeix amb l\'ESO (grau mitjà) o amb el Batxillerat o un grau mitjà (grau superior), sense nota de tall en la majoria de casos.',
      'Un títol superior artístic (dansa, música, art dramàtic, disseny, conservació i restauració...) equival a un grau (240 ECTS) però s\'imparteix en escoles especialitzades i s\'hi accedeix normalment amb una prova específica, no amb la nota de la PAU.',
      'Els tres camins són títols oficials reconeguts; la tria depèn més de l\'orientació (teòrica vs. pràctica), la durada i la forma d\'accés que no pas del "prestigi" d\'un sobre l\'altre.',
    ],
  },
  {
    slug: 'modalitats-batxillerat',
    titol: 'Modalitats de Batxillerat',
    resum: 'Com està organitzat el Batxillerat a Catalunya i quines sortides obre cada modalitat.',
    cos: [
      'A Catalunya, el Batxillerat s\'organitza en quatre modalitats: Ciències i Tecnologia, Humanitats i Ciències Socials, Arts i la modalitat General.',
      'Dins de Ciències i Tecnologia, cada centre pot oferir itineraris diferents (científico-sanitari, tecnològic...) que no són modalitats a part, sinó variants de la mateixa modalitat: cal consultar-ho amb cada institut.',
      'La modalitat d\'Arts pot incloure itineraris d\'Arts plàstiques, imatge i disseny, o de Música i arts escèniques, segons el centre.',
      'La modalitat tria no tanca portes de manera absoluta (es pot accedir a molts graus des de diverses modalitats, sobretot si no es necessiten matèries específiques concretes), però sí que facilita cursar les matèries que després es ponderaran a la fase específica de la PAU.',
    ],
  },
  {
    slug: 'beques',
    titol: 'Beques: general del Ministeri, Equitat i beques pròpies',
    resum: "On mirar per saber si pots tenir ajuda econòmica per estudiar.",
    cos: [
      'La beca general del Ministeri d\'Educació cobreix matrícula i, segons la renda familiar, una quantia fixa i variable addicional, tant per a graus universitaris com per a alguns cicles de FP.',
      'A Catalunya, l\'AGAUR gestiona beques d\'equitat i altres ajuts propis per a l\'alumnat universitari amb necessitats econòmiques específiques.',
      'Moltes universitats i centres privats (com l\'ESCAC o Esade) tenen les seves pròpies beques i ajuts, que poden arribar a cobrir una part molt important de la matrícula; cal consultar-ho directament amb cada centre, ja que les condicions varien molt.',
      'Recomanació: sol·licita la beca general encara que no estiguis segur/a de complir els requisits de renda, ja que el càlcul és automàtic i no té cap cost ni compromís previ.',
    ],
    enllaços: [{ text: 'Beques del Ministeri d\'Educació', url: 'https://www.becaseducacion.gob.es' }, { text: 'AGAUR', url: 'https://agaur.gencat.cat' }],
  },
  {
    slug: 'public-adscrit-privat',
    titol: 'Públic vs. adscrit vs. privat',
    resum: 'Tres tipus de centre, amb preus i processos d\'accés diferents.',
    cos: [
      'Un centre públic (propi) pertany directament a una universitat pública: el preu del crèdit el fixa la Generalitat i és el mateix a totes les universitats públiques catalanes.',
      'Un centre adscrit imparteix titulacions oficials d\'una universitat pública (per exemple, Tecnocampus amb la UPF), però és de gestió privada: per això sol tenir un preu diferent (normalment més alt) que el de la universitat pública a la qual s\'adscriu, encara que el títol final sigui el mateix.',
      'Un centre privat (una universitat privada pròpiament) fixa els seus propis preus i, en molts casos, el seu propi procés d\'admissió, sense passar per la preinscripció universitària pública.',
    ],
  },
  {
    slug: 'calendari-orientatiu',
    titol: 'Calendari orientatiu de l\'any',
    resum: 'Els grans moments de l\'any per a qui ha de decidir estudis, en ordre aproximat.',
    cos: [
      'Tardor i hivern: és un bon moment per fer els tests vocacionals, explorar el cercador amb calma i parlar amb el tutor/a d\'orientació sobre les primeres opcions.',
      'Hivern i primavera: calendari de proves d\'admissió pròpies (PAP) de moltes titulacions artístiques i de privades, que solen ser anteriors a la preinscripció general.',
      'Primavera: sol·licitud de la beca general i obertura dels terminis de preinscripció de Batxillerat i FP.',
      'Finals de primavera i estiu: preinscripció universitària, publicació de notes de tall i assignacions successives durant l\'estiu.',
      'Aquestes dates poden variar cada curs: consulta sempre el calendari oficial actualitzat a preinscripcio.gencat.cat.',
    ],
    enllaços: [{ text: 'Calendari oficial de preinscripció', url: 'https://preinscripcio.gencat.cat' }],
  },
]
