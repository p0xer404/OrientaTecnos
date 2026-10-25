// Copia els JSON públics de data/ a public/data/ perquè la web els pugui carregar amb fetch().
// No copia raw/, *.csv ni els fitxers *_manual.json (són interns del pipeline de dades).
import { mkdirSync, copyFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const src = path.join(root, 'data')
const dest = path.join(root, 'public', 'data')

const files = [
  'grados.json',
  'fp.json',
  'bachilleratos.json',
  'artisticos_superiores.json',
  'universidades.json',
  'meta.json',
]

mkdirSync(dest, { recursive: true })
for (const file of files) {
  copyFileSync(path.join(src, file), path.join(dest, file))
}
console.log(`Dades sincronitzades a public/data/ (${files.length} fitxers).`)
