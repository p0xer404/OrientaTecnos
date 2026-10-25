import { Card } from '../components/ui/Card'

const CORREU = 'paugual@escolatecnos.cat'

const SECCIONS: { titol: string; cos: string; correu?: boolean }[] = [
  {
    titol: 'Responsable del tractament',
    cos: "El responsable del tractament de les dades d'aquesta plataforma d'orientació acadèmica és Pau Gual Ahmad, que l'ha desenvolupada per a l'alumnat de l'Escola Tecnos (Terrassa).",
  },
  {
    titol: 'Finalitat',
    cos: "Les dades es fan servir exclusivament per oferir orientació acadèmica a l'alumnat: resultats de tests vocacionals, llistes d'estudis, recomanacions i seguiment per part del tutor/a. No es fan servir per a cap altra finalitat ni es cedeixen a tercers.",
  },
  {
    titol: 'Dades que es tracten',
    cos: "Nom, correu electrònic, curs, nota mitjana (si l'alumne la introdueix), àrees d'interès, matèries on treu millor i pitjor nota i les que li agraden més i menys, preferències pràctiques (pressupost, distància, universitat o FP), resultats dels tests vocacionals, llistes d'estudis i notes del tutor/a. No es tracten dades de categories especials.",
  },
  {
    titol: 'Conservació',
    cos: "Les dades es conserven mentre l'alumne/a estigui matriculat/a al centre i es limiten al curs escolar en curs; es poden eliminar a petició de l'alumne/a o de la família en qualsevol moment.",
  },
  {
    titol: 'Menors de 14 anys',
    cos: 'Per registrar-se a la plataforma amb menys de 14 anys cal el consentiment dels pares o tutors legals, que es demana explícitament durant el registre.',
  },
  {
    titol: 'Contacte',
    cos: 'Per a qualsevol dubte sobre el tractament de dades, o per exercir els teus drets d\'accés, rectificació o supressió, escriu a paugual@escolatecnos.cat.',
    correu: true,
  },
  {
    titol: 'Drets de les persones usuàries',
    cos: 'Qualsevol alumne/a pot descarregar totes les seves dades o sol·licitar l\'eliminació completa del seu compte des de la pàgina "El meu perfil", sense necessitat de demanar-ho al centre.',
  },
  {
    titol: 'On es guarden les dades',
    cos: "Els comptes i les dades personals es guarden a Supabase (base de dades amb accés restringit: cada alumne/a només veu les seves dades, i el seu tutor/a, les del seu grup), i la web s'allotja a Vercel. Tots dos actuen com a encarregats del tractament. En mode demostració, les dades es desen únicament al navegador (localStorage) i no s'envien a cap servidor.",
  },
  {
    titol: 'Cookies i serveis externs',
    cos: "No s'utilitzen cookies de tercers ni publicitat. Per saber quantes visites té la web i com de ràpid carrega, s'usen Vercel Web Analytics i Speed Insights: no fan servir cookies ni identifiquen persones, i només recullen dades agregades i anònimes (pàgines vistes, tipus de dispositiu i temps de càrrega), mai dades personals ni resultats de tests. Els mapes de les fitxes es carreguen d'OpenStreetMap, que rep l'adreça IP del dispositiu en mostrar-los.",
  },
]

export default function Privacitat() {
  return (
    <div className="fade-in mx-auto max-w-2xl space-y-6">
      <div>
        <p className="eyebrow">Document legal</p>
        <h1 className="mt-1 text-2xl font-semibold text-ink">Política de privacitat</h1>
      </div>
      <div className="stagger space-y-3">
        {SECCIONS.map((s, i) => (
          <Card key={s.titol} className="flex gap-4">
            <span className="font-serif text-xl font-semibold text-accent">{String(i + 1).padStart(2, '0')}</span>
            <div>
              <h2 className="mb-1 text-base font-semibold text-ink">{s.titol}</h2>
              <p className="text-sm text-muted">
                {s.correu ? (
                  <>
                    {s.cos.replace(CORREU + '.', '')}
                    <a href={`mailto:${CORREU}`} className="text-primary underline">{CORREU}</a>.
                  </>
                ) : (
                  s.cos
                )}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
