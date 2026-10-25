#!/usr/bin/env python3
"""
Regenera todos los datos del buscador a partir de fuentes oficiales.

Uso:
    python scripts/update_data.py            # descarga datos frescos de la Generalitat y reconstruye todo
    python scripts/update_data.py --offline  # reconstruye usando data/raw/*.json ya descargados

Entradas:
  - Dades obertes Generalitat (Socrata):
      usyn-hngc  notas de corte y plazas (grados, preinscripción pública)
      7vig-4syr  oferta FP (FPCAT)
      kvmv-ahh4  directorio de centros (público/privado)
  - data/precios_manual.json   reglas de precio para universidades públicas y centros adscritos
  - data/privadas_manual.json  grados de universidades privadas (Esade, IQS, La Salle, Blanquerna, UIC, Abat Oliba)

Salidas (data/):
  grados.json, fp.json, universidades.json, meta.json y las mismas tablas en CSV.
"""
import csv, json, re, sys, urllib.request, collections as C, datetime, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "data")
RAW = os.path.join(DATA, "raw")
API = "https://analisi.transparenciacatalunya.cat/resource/{}.json?$limit=50000{}"

CURSO_ACTUAL = "2026-2027"
CURSOS_HIST = ["2026-2027", "2025-2026", "2024-2025", "2023-2024"]


def fetch(ds, extra="", name=None):
    os.makedirs(RAW, exist_ok=True)
    path = os.path.join(RAW, (name or ds) + ".json")
    if "--offline" not in sys.argv:
        url = API.format(ds, extra).replace(" ", "%20")
        print("descargando", url)
        with urllib.request.urlopen(url, timeout=300) as r:
            open(path, "wb").write(r.read())
    return json.load(open(path, encoding="utf-8"))


def fnum(x):
    try:
        return float(x)
    except (TypeError, ValueError):
        return None


# ---------- área de conocimiento (clasificación por palabras clave, ca/es/en) ----------
AREAS = [
    ("Ciencias de la salud", r"medicin|infermer|enfermer|nursing|fisioter|physiother|odontolog|dentist|farmàc|farmac|nutrici|psicolog|psychol|podolog|logop|òptica|optica|veterin|teràpia ocup|terapia ocup|biomèdi|biomédi|biomedic|activitat física|actividad física|biologia humana|audiolog|one health|ciències de la salut"),
    ("Ingeniería y arquitectura", r"enginyer|ingenier|engineer|arquitect|architect|edificació|informàtica|informática|computer|videojoc|videojuego|video game|telecomun|aeroespac|robòt|intel·ligència artificial|inteligencia artificial|artificial intelligence|ciència de dades|ciencia de datos|data science|data analytics|ciberseguretat|tecnolog|multimèdia|multimedia|paisatgisme|interactiv"),
    ("Ciencias", r"matemàt|matemát|mathemat|^física|química|biolog|bioquím|biotecno|geolog|ciències ambientals|estadíst|genètica|microbiolog|ciències del mar|aliments|enologia|bioinformàt|nanociència"),
    ("Educación", r"educació|educación|education|mestre|maestro|pedagog|infantil|primària|primaria"),
    ("Artes y diseño", r"disseny|diseño|design|belles arts|bellas artes|cinem|animació|animación|animation|conservació|música|musicolog|dansa|fotograf|moda|arts escèniques|mitjans audiovisuals|arts digitals|artes digitales|digital arts|art digital"),
    ("Derecho, economía y ciencias sociales", r"dret|derecho|law|economia|economía|economics|empresa|business|administració|administración|management|comptab|finan|màrqueting|marketing|turisme|turismo|criminolog|polítiq|polític|politic|governance|sociolog|treball social|trabajo social|relacions laborals|publicitat|publicidad|advertising|periodisme|periodismo|journalism|comunicació|comunicación|communication|negocis|negocios|gestió|gestión|geografia|antropolog|relacions internacionals|relaciones internacionales|seguretat|seguridad|hotel|gastronòm|culinàr|nàutica|aviació|transport|leadership|esport|deporte|sport"),
    ("Artes y humanidades", r"filolog|llengu|lengu|història|historia|filosof|philosoph|humanitats|humanidades|humanities|traducció|estudis|literatur|anglès|lingüíst|arqueolog|antiguitat"),
]


def area(name):
    l = name.lower()
    if l.startswith("biotecno") or l == "ciències":
        return "Ciencias"
    if l.startswith("llengües aplicades") or "antiguitat" in l:
        return "Artes y humanidades"
    if "conservació" in l:
        return "Artes y diseño"
    for a, p in AREAS:
        if re.search(p, l):
            return a
    return "Otros"


UNI = {"UB": "Universitat de Barcelona", "UAB": "Universitat Autònoma de Barcelona", "UPC": "Universitat Politècnica de Catalunya",
       "UPF": "Universitat Pompeu Fabra", "UdG": "Universitat de Girona", "UdL": "Universitat de Lleida", "URV": "Universitat Rovira i Virgili",
       "UVic": "Universitat de Vic - Universitat Central de Catalunya", "UVic-UCC": "Universitat de Vic - Universitat Central de Catalunya",
       "UOC": "Universitat Oberta de Catalunya", "URL": "Universitat Ramon Llull", "UIC": "Universitat Internacional de Catalunya",
       "UAO": "Universitat Abat Oliba CEU"}
PUB = {"UB", "UAB", "UPC", "UPF", "UdG", "UdL", "URV"}
ADSCRITOS_SIN_COMILLAS = ["EUIT", "Videojocs (Campus", "Videojocs (docència en Anglès) (Campus", "Disseny, Animació i Art Digital", "Disseny Digital i Tecnologies Multimèdia"]


def tipo_centro(name, u):
    adscrito = '"' in name or (u in PUB and any(k in name for k in ADSCRITOS_SIN_COMILLAS))
    if u in PUB:
        return "Pública (centro adscrito)" if adscrito else "Pública (centro propio)"
    return "Privada"


def centro_de(name, u):
    m = re.search(r'"([^"]+)"', name)
    if m:
        return m.group(1)
    if "EUIT" in name:
        return "EUIT Terrassa"
    if any(k in name for k in ADSCRITOS_SIN_COMILLAS[1:]):
        return "CITM"
    if "Campus Manresa" in name:
        return "UManresa"
    return u


def aplicar_precio(g, P):
    name = g["grado"]
    for r in P["reglas"]:
        if r["univ"] != g["universidad"]:
            continue
        if all(w.lower() in name.lower() for w in r["match"]) and not any(w.lower() in name.lower() for w in r.get("exclude", [])):
            g.update(precio_credito=r.get("credito"), precio_1r_curso=r.get("curso"), precio_incluye_tasas=r.get("incluye_tasas", False),
                     precio_fuente=r["fuente"], precio_curso_ref="2026-27", nota=r.get("nota"))
            return
    if g["tipo_centro"] == "Pública (centro propio)":
        cr = P["publica_credito"]
        g.update(precio_credito=cr, precio_1r_curso=round(cr * 60, 2), precio_incluye_tasas=False, precio_fuente=P["publica_fuente"],
                 precio_curso_ref="2026-27", nota=f"Solo créditos (60). Tasas aprox. +{P['publica_tasas_aprox']} €. Los dobles grados tienen más créditos.")


def main():
    P = json.load(open(os.path.join(DATA, "precios_manual.json"), encoding="utf-8"))

    # ---------------- GRADOS (preinscripción pública) ----------------
    notes = [r for r in fetch("usyn-hngc") if r.get("tipus_d_estudi") == "Grau"]
    key = lambda r: (r["nom_de_l_oferta"].strip(), r["sigles_universitat_responsable"], r["municipi"])  # los códigos cambian entre años
    hist = C.defaultdict(dict)
    for r in notes:
        hist[key(r)][r["curs_acad_mic"]] = fnum(r["nota_de_tall"])
    actuales = {key(r): r for r in notes if r["curs_acad_mic"] == CURSO_ACTUAL}
    grados = []
    for k, r in actuales.items():
        name, u = r["nom_de_l_oferta"].strip(), r["sigles_universitat_responsable"]
        h = hist[k]
        g = dict(id=f"pre-{r['codi_oferta']}", codigo_preinscripcion=r["codi_oferta"], grado=name, universidad=u, universidad_nombre=UNI.get(u, u),
                 centro=centro_de(name, u), tipo_centro=tipo_centro(name, u), admision="Preinscripción universitaria (nota de corte)",
                 area=area(name), municipio=r["municipi"], plazas=int(r["nombre_de_places"]) if str(r.get("nombre_de_places", "")).isdigit() else None,
                 doble=bool(re.search(r"simultaneïtat|/|\+ Màster", name)),
                 **{f"nota_corte_{c[:4]}": h.get(c) for c in CURSOS_HIST},
                 precio_credito=None, precio_1r_curso=None, precio_incluye_tasas=None, precio_curso_ref=None, precio_fuente=None, nota=None,
                 url=None, duracion=None, idiomas=None)
        aplicar_precio(g, P)
        if g["centro"] == "ESCAC":
            g.update(url="https://escac.com/formacion/grado/grado-oficial-en-cinematografia/", duracion="4 años (240 ECTS)", idiomas="Catalán, castellano",
                     admision="Preinscripción universitaria + PAP propia de ESCAC (obligatoria)")
        grados.append(g)

    # ---------------- GRADOS universidades privadas ----------------
    for i, p in enumerate(json.load(open(os.path.join(DATA, "privadas_manual.json"), encoding="utf-8"))):
        g = dict(id=f"priv-{i+1}", codigo_preinscripcion=None, grado=None, universidad=None, universidad_nombre=None, centro=None,
                 tipo_centro="Privada", admision=None, area=area(p["grado"]), municipio=None, plazas=None,
                 doble=bool(re.search(r"doble|double|\+", p["grado"], re.I)), **{f"nota_corte_{c[:4]}": None for c in CURSOS_HIST},
                 precio_credito=None, precio_1r_curso=None, precio_incluye_tasas=None, precio_curso_ref=None, precio_fuente=None, nota=None,
                 url=None, duracion=None, idiomas=None)
        g.update(p)
        grados.append(g)
    grados.sort(key=lambda x: (x["grado"].lower(), x["universidad"]))

    # ---------------- FP ----------------
    directorio = {r["codi_centre"]: r.get("nom_naturalesa") for r in fetch("kvmv-ahh4", "&$where=curs='2025/2026'&$select=codi_centre,nom_naturalesa")}
    KEEP = {"Cicles formatius de grau superior": "Grado superior", "Cicles formatius de grau mitjà": "Grado medio", "Cicles formatius de grau bàsic": "Grado básico",
            "Cursos d'especialització de grau superior": "Especialización (GS)", "Cursos d'especialització de grau mitjà": "Especialización (GM)"}
    fp, seen = [], set()
    for r in fetch("7vig-4syr"):
        nivel = KEEP.get(r.get("tipus_de_formaci"))
        if not nivel:
            continue
        k = (r["codi_curs"], r.get("codi_centre"), r.get("modalitat_oferta_curs_centre"))
        if k in seen:
            continue
        seen.add(k)
        publico = directorio.get(r.get("codi_centre")) == "Públic" or r.get("finan_p_blic_oferta_curs") == "Sí"
        precio = None
        if publico:
            precio = {"Grado básico": P["fp"]["publico_grado_basico"], "Grado medio": P["fp"]["publico_grado_medio"], "Grado superior": P["fp"]["publico_grado_superior"]}.get(nivel)
        fp.append(dict(id=f"fp-{len(fp)+1}", codigo=r["codi_curs"], ciclo=r["nom_del_curs"], nivel=nivel, familia=r.get("familia_professional"),
                       horas=int(r["durada"]) if str(r.get("durada", "")).isdigit() else None, titulo=r.get("acreditaci_titulaci"),
                       centro=r.get("nom_centre"), codigo_centro=r.get("codi_centre"), titularidad="Público" if publico else "Privado",
                       municipio=r.get("municipi_centre"), comarca=r.get("comarca_centre"), modalidad=r.get("modalitat_oferta_curs_centre"),
                       precio_curso=precio, precio_nota=("Precio público Generalitat" if precio is not None else "Consultar al centro"),
                       telefono=r.get("tel_fon_centre"), email=r.get("correu_electr_nic_centre"), web=r.get("p_gina_web_centre") or None,
                       direccion=r.get("adre_a_centre"), cp=r.get("codi_postal_centre"), lat=fnum(r.get("posicionament_y_centre")), lon=fnum(r.get("posicionament_x_centre")),
                       preinscripcion=r.get("preinscripci_oferta_curs"), info=r.get("descripci_del_curs")))
    fp.sort(key=lambda x: (x["nivel"], x["familia"] or "", x["ciclo"], x["municipio"] or ""))

    # ---------------- BACHILLERATOS + ARTÍSTICOS SUPERIORES ----------------
    import extras
    bachilleratos, artisticos = extras.build(fetch, fnum)

    # ---------------- UNIVERSIDADES ----------------
    cnt = C.Counter(g["universidad"] for g in grados)
    universidades = [dict(siglas=k, nombre=UNI.get(k, k), tipo="Pública" if k in PUB else "Privada", num_grados=v) for k, v in sorted(cnt.items())]

    meta = dict(generado=datetime.date.today().isoformat(), curso=CURSO_ACTUAL, num_grados=len(grados), num_fp=len(fp),
                grados_con_precio=sum(1 for g in grados if g["precio_1r_curso"]), num_bachilleratos=len(bachilleratos), num_artisticos=len(artisticos),
                fuentes={"notas_corte": "https://analisi.transparenciacatalunya.cat/d/usyn-hngc", "fp": "https://analisi.transparenciacatalunya.cat/d/7vig-4syr",
                         "centros": "https://analisi.transparenciacatalunya.cat/d/kvmv-ahh4", "oferta_postobligatoria": "https://analisi.transparenciacatalunya.cat/d/ky5m-v7i9", "preinscripcion_asignaciones": "https://analisi.transparenciacatalunya.cat/d/wjaf-jxmt", "conciertos": "https://analisi.transparenciacatalunya.cat/d/8spq-9nx7", "matricula_por_modalidad": "https://analisi.transparenciacatalunya.cat/d/xvme-26kg", "precio_publico": P["publica_fuente"], "precios_privados": "ver campo precio_fuente de cada grado"},
                centros_sin_precio=P.get("sin_precio_localizado", []))

    for name, obj in [("grados", grados), ("fp", fp), ("universidades", universidades), ("bachilleratos", bachilleratos), ("artisticos_superiores", artisticos), ("meta", meta)]:
        json.dump(obj, open(os.path.join(DATA, name + ".json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    for name, rows in [("grados", grados), ("fp", fp), ("universidades", universidades), ("bachilleratos", bachilleratos), ("artisticos_superiores", artisticos)]:
        with open(os.path.join(DATA, name + ".csv"), "w", newline="", encoding="utf-8-sig") as f:
            w = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
            rows = [{k: (", ".join(v) if isinstance(v, list) else (json.dumps(v, ensure_ascii=False) if isinstance(v, dict) else v)) for k, v in r.items()} for r in rows]
            w.writeheader()
            w.writerows(rows)
    print(json.dumps({k: v for k, v in meta.items() if k != "centros_sin_precio"}, ensure_ascii=False, indent=1))


if __name__ == "__main__":
    main()
