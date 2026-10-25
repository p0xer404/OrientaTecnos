# Orienta Tecnos

Web d'orientació acadèmica per a l'alumnat de l'**Escola Tecnos** (Terrassa): un cercador de graus universitaris, Formació Professional, Batxillerat i ensenyaments artístics superiors de Catalunya, amb tests vocacionals i recomanacions calculades amb regles deterministes (sense cap intel·ligència artificial).

Interfície 100% en català. Dades 100% reals, preses de `data/` (Departament d'Educació i universitats catalanes) — mai inventades.

## Funcionalitats

- **Cercador** (`/cercador`): graus, FP, Batxillerat i artístics en una sola cerca, amb filtres per tipus, pestanyes, xips de filtres actius i botó «A prop de Terrassa».
- **Fitxa d'estudi** (`/estudi/:id`): totes les dades disponibles, evolució de la nota de tall, mapa del centre (quan hi ha coordenades), contacte i estudis similars.
- **Llistes** (`/llistes`): llistes il·limitades, reordenables arrossegant, amb una marcada com a «preferències de preinscripció».
- **Comparador** (`/comparar`): fins a 4 estudis costat a costat.
- **Tests vocacionals** (`/tests`): RIASEC, habilitats percebudes i preferències pràctiques — preguntes originals.
- **Recomanacions** (`/recomanacions`): puntuació 0-100 («match») calculada amb regles a partir del perfil RIASEC, la nota, el pressupost i la distància — mai amb IA.
- **Guia acadèmica** (`/guia`): articles sobre preinscripció, nota de tall, PAP, beques, etc.
- **Perfil de l'alumne** (`/perfil`): dades personals, estat de la decisió, descàrrega i esborrat de les pròpies dades.
- **Orientador/tutor** (`/orientador`): es registren sols des de «Registra't», creen els seus propis grups i codis de classe, i tenen un dashboard del grup (perfils RIASEC, àrees d'interès, exportació CSV) i fitxa individual de cada alumne/a amb notes privades.
- **Admin** (`/admin`): només una vista general de tutors, grups i alumnes, i la baixa d'alumnes — no cal per crear tutors ni grups.

## Stack

Vite + React + TypeScript + Tailwind CSS v4 + React Router. Leaflet/react-leaflet per als mapes, Recharts per als gràfics, Fuse.js per a la cerca difusa. Supabase (Auth + Postgres amb RLS) per a comptes i dades de persones; **mode demo** amb `localStorage` quan no hi ha Supabase configurat.

## Posada en marxa

```bash
npm install
npm run dev
```

L'aplicació arrenca en **mode demo**: no cal cap configuració ni compte de Supabase. Les dades d'alumnes, grups i resultats que hi veuràs són **fictícies** (marcades amb un avís a la pàgina) i pensades per ensenyar l'eina a l'escola abans de tenir permís per fer-hi servir dades reals.

Credencials de demostració (contrasenya `demo1234` per a totes):

| Rol | Correu |
|---|---|
| Alumne | `laia.alumna@demo.tecnos.cat` |
| Tutor/a | `tutor1@demo.tecnos.cat` |
| Admin | `admin@demo.tecnos.cat` |

Per registrar un alumne nou en mode demo, fes servir el codi de classe `DEMO4A` o `DEMOB1` a `/registre`.

### Altres ordres

```bash
npm run build      # compila per a producció (dist/)
npm run preview     # serveix el build de producció en local
npm run sync-data   # copia data/*.json a public/data/ (s'executa sol abans de dev/build)
npm run lint        # oxlint
```

## Connectar Supabase (opcional, per sortir del mode demo)

1. Crea un projecte a [supabase.com](https://supabase.com).
2. A **SQL Editor**, executa tot el contingut de [`supabase/schema.sql`](supabase/schema.sql): crea les taules (`profiles`, `groups`, `lists`, `list_items`, `test_results`, `tutor_notes`), les funcions auxiliars i totes les polítiques de Row Level Security.
3. Copia `.env.example` com a `.env.local` i omple-hi la URL i la clau anònima del projecte (**Project Settings > API**):
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=xxxx
   ```
4. Reinicia `npm run dev`. L'aplicació detecta les credencials i deixa de fer servir `localStorage`.
5. Els **alumnes i els tutors/es es registren sols** des de «Registra't» (cal triar «Sóc tutor/a» o «Sóc alumne»): un tutor/a pot crear el seu compte directament i, un cop dins, crear els seus propis grups i codis de classe des de «El meu grup». Només el teu compte d'**admin** s'ha de crear a mà des de Supabase Studio (*Authentication > Users > Add user*), i després cal editar la fila corresponent a la taula `profiles` i posar `role = 'admin'` (per registre públic, el rol només pot sortir com `alumne` o `tutor`, mai `admin`).

### Limitacions conegudes del mode Supabase (v1)

Amb només la clau anònima (sense un backend propi), una acció no es pot fer del tot des del client:
- **«Esborrar el meu compte»**: esborra totes les dades de perfil, llistes, tests i notes (en cascada), però l'usuari d'autenticació de Supabase només es pot eliminar del tot amb la *service role key*, des d'una Edge Function (no implementada en aquesta v1).

Com que el registre de tutors és obert (sense codi ni aprovació), qualsevol persona amb l'enllaç de l'app es pot crear un compte de tutor/a. Si vols limitar-ho més endavant (per exemple amb un domini de correu concret de l'escola), es pot afegir una comprovació a `handle_new_user()` dins de `supabase/schema.sql`.

## Dades (`data/`)

Els fitxers de `data/` ja venen preparats (graus, FP, batxilleratos, artístics, universitats i metadades); l'aplicació no n'inventa cap camp. Per actualitzar-los amb dades fresques de la Generalitat:

```bash
python scripts/update_data.py
python scripts/build_excel.py   # opcional: regenera l'Excel de revisió
```

Les notes de tall surten cada juliol; els preus de les universitats privades cal revisar-los a mà a `data/privadas_manual.json` i `data/precios_manual.json`.

## Desplegament a Vercel

```bash
npm i -g vercel
vercel          # desplegament de prova
vercel --prod   # desplegament a producció
```

El fitxer [`vercel.json`](vercel.json) ja inclou la reescriptura necessària perquè les rutes de React Router (p. ex. `/estudi/pre-1394`) funcionin en recarregar la pàgina. Si connectes Supabase, afegeix `VITE_SUPABASE_URL` i `VITE_SUPABASE_ANON_KEY` a les variables d'entorn del projecte a Vercel abans de desplegar.

## Privacitat

L'aplicació tracta dades d'alumnes menors d'edat. Vegeu `/privacitat` i `/avis-legal` dins de la web, i `supabase/schema.sql` per a les polítiques de Row Level Security que limiten l'accés de cada rol a les seves pròpies dades.
