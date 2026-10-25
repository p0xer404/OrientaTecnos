// Descarrega 1-4 fotos de la web oficial de cada universitat i centre (og:image i imatges grans de la portada),
// les redimensiona a WebP i genera public/media/centres/index.json. S'executa a mà: node scripts/fetch-centre-images.mjs
// Les imatges són propietat dels centres; es mostren amb el seu crèdit i s'han de retirar si ho demanen.
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const run = promisify(execFile)
const SORTIDA = 'public/media/centres'
const UA = 'OrientaTecnosBot/1.0 (+mailto:paugual@escolatecnos.cat; orientacio academica Escola Tecnos)'
const TMP = join(tmpdir(), 'orienta-centres')
mkdirSync(SORTIDA, { recursive: true })
mkdirSync(TMP, { recursive: true })

const UNIVERSITATS = {
  UAB: 'https://www.uab.cat', UB: 'https://www.ub.edu', UPC: 'https://www.upc.edu', UPF: 'https://www.upf.edu',
  UdG: 'https://www.udg.edu', UdL: 'https://www.udl.cat', URV: 'https://www.urv.cat', UVic: 'https://www.uvic.cat',
  URL: 'https://www.url.edu', UAO: 'https://www.uao.es', UIC: 'https://www.uic.es',
}

// Hostings compartits per molts centres (p. ex. agora.xtec.cat/<centre>): la clau inclou el primer tram del camí.
const HOSTS_COMPARTITS = new Set(['agora.xtec.cat', 'xtec.cat', 'blogs.xtec.cat', 'fedac.cat', 'dipta.cat', 'sites.google.com'])

export function clauWeb(url) {
  if (!url) return null
  try {
    const u = new URL(/^https?:\/\//i.test(url) ? url : `http://${url}`)
    const host = u.hostname.toLowerCase().replace(/^www\./, '')
    if (!HOSTS_COMPARTITS.has(host)) return host
    const tram = u.pathname.split('/').filter(Boolean)[0]
    return tram ? `${host}/${tram.replace(/\.php$/, '').toLowerCase()}` : null
  } catch {
    return null
  }
}

function carregar(f) {
  return JSON.parse(readFileSync(`data/${f}.json`, 'utf8'))
}

// clau -> url de portada
const llocs = new Map()
for (const [sigla, url] of Object.entries(UNIVERSITATS)) llocs.set(`uni:${sigla}`, { url, max: 4 })
for (const f of ['fp', 'bachilleratos', 'artisticos_superiores']) {
  for (const r of carregar(f)) {
    const clau = clauWeb(r.web)
    if (clau && !llocs.has(clau)) llocs.set(clau, { url: /^https?:\/\//i.test(r.web) ? r.web : `http://${r.web}`, max: 2 })
  }
}

async function obtenir(url, opcions = {}) {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), opcions.timeout ?? 9000)
  try {
    return await fetch(url, { signal: ctrl.signal, redirect: 'follow', headers: { 'user-agent': UA, accept: opcions.accept ?? '*/*' } })
  } finally {
    clearTimeout(t)
  }
}

const EXCLOU = /logo|icon|favicon|sprite|avatar|loader|spacer|pixel|blank|placeholder|flag|badge|banner-cookies|cookie|qr|facebook|twitter|instagram|youtube|linkedin|whatsapp|\.svg|\.gif|\.ico/i

function candidates(html, base) {
  const out = []
  const afegir = (s) => {
    if (!s) return
    try {
      const u = new URL(s.trim().replace(/&amp;/g, '&'), base).href
      if (!/^https?:/.test(u) || EXCLOU.test(u) || out.includes(u)) return
      out.push(u)
    } catch { /* url invàlida */ }
  }
  for (const m of html.matchAll(/<meta[^>]+(?:property|name)=["'](?:og:image|twitter:image)(?::src)?["'][^>]*>/gi)) {
    afegir(m[0].match(/content=["']([^"']+)["']/i)?.[1])
  }
  for (const m of html.matchAll(/<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["'](?:og:image|twitter:image)["']/gi)) afegir(m[1])
  for (const m of html.matchAll(/<img[^>]+>/gi)) {
    const src = m[0].match(/\bsrc=["']([^"']+)["']/i)?.[1] ?? m[0].match(/data-src=["']([^"']+)["']/i)?.[1]
    afegir(src)
    if (out.length >= 14) break
  }
  return out
}

async function dimensions(fitxer) {
  const { stdout } = await run('sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', fitxer])
  const w = Number(stdout.match(/pixelWidth: (\d+)/)?.[1])
  const h = Number(stdout.match(/pixelHeight: (\d+)/)?.[1])
  return { w, h }
}

async function processarImatge(url, desti) {
  const resp = await obtenir(url, { accept: 'image/*', timeout: 12000 })
  if (!resp.ok) return null
  const tipus = resp.headers.get('content-type') ?? ''
  if (!/image\/(jpeg|jpg|png|webp)/i.test(tipus)) return null
  const bytes = Buffer.from(await resp.arrayBuffer())
  if (bytes.length < 25_000 || bytes.length > 8_000_000) return null
  const ext = /png/i.test(tipus) ? 'png' : /webp/i.test(tipus) ? 'webp' : 'jpg'
  const origen = `${desti}.orig.${ext}`
  writeFileSync(origen, bytes)
  try {
    const { w, h } = await dimensions(origen)
    if (!w || !h || w < 560 || h < 300) return null
    const ratio = w / h
    if (ratio < 1.15 || ratio > 2.6) return null
    let entrada = origen
    if (ext === 'webp') {
      entrada = `${desti}.conv.jpg`
      await run('sips', ['-s', 'format', 'jpeg', origen, '--out', entrada])
    }
    const final = `${desti}.webp`
    await run('cwebp', ['-quiet', '-q', '68', '-resize', '640', '0', entrada, '-o', final])
    return { w: 640, h: Math.round((640 * h) / w) }
  } catch {
    return null
  } finally {
    rmSync(origen, { force: true })
    rmSync(`${desti}.conv.jpg`, { force: true })
  }
}

async function processarLloc(clau, { url, max }) {
  let html
  try {
    const resp = await obtenir(url, { accept: 'text/html' })
    if (!resp.ok) return []
    html = (await resp.text()).slice(0, 600_000)
  } catch {
    return []
  }
  const base = url
  const trobades = []
  const slug = clau.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase()
  for (const c of candidates(html, base).slice(0, 10)) {
    if (trobades.length >= max) break
    try {
      const desti = join(SORTIDA, `${slug}-${trobades.length + 1}`)
      const d = await processarImatge(c, desti)
      if (d) trobades.push({ f: `/media/centres/${slug}-${trobades.length + 1}.webp`, w: d.w, h: d.h, font: url })
    } catch { /* imatge no disponible */ }
  }
  return trobades
}

async function main() {
  const index = existsSync(`${SORTIDA}/index.json`) ? JSON.parse(readFileSync(`${SORTIDA}/index.json`, 'utf8')) : {}
  const pendents = [...llocs.entries()].filter(([clau]) => !(clau in index))
  console.log(`${llocs.size} llocs, ${pendents.length} pendents`)
  let fet = 0
  const CONCURRENCIA = 6
  const cua = [...pendents]
  async function treballador() {
    while (cua.length) {
      const [clau, info] = cua.shift()
      index[clau] = await processarLloc(clau, info)
      fet++
      if (fet % 25 === 0) {
        writeFileSync(`${SORTIDA}/index.json`, JSON.stringify(index))
        console.log(`${fet}/${pendents.length} · amb foto: ${Object.values(index).filter((v) => v.length).length}`)
      }
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCIA }, treballador))
  writeFileSync(`${SORTIDA}/index.json`, JSON.stringify(index))
  console.log(`Fet. Llocs amb foto: ${Object.values(index).filter((v) => v.length).length}/${llocs.size}`)
}

main()
