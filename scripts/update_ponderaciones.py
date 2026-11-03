#!/usr/bin/env python3
"""
Descarga i processa la taula oficial de ponderacions de matèries de la fase específica
(PAU) per a l'accés a la universitat a la preinscripció universitària de Catalunya, i la
creua amb data/grados.json per generar data/ponderaciones.json.

Font oficial: universitats.gencat.cat (Oficina d'Accés a la Universitat). És un PDF
A4 apaïsat amb els noms de les matèries escrits en vertical (rotats 90°) com a
capçalera de columna i una fila per grau/universitat amb els valors 0,2 / 0,1 a cada
columna on la matèria pondera (en blanc si no pondera).

Ús:
    python scripts/update_ponderaciones.py              # descarrega el PDF oficial
    python scripts/update_ponderaciones.py --offline     # reutilitza data/raw/Ponderacions.pdf

Requereix pdfplumber (scripts/requirements.txt):
    pip install -r scripts/requirements.txt

Sortida (data/):
    ponderaciones.json  { generado, fuente, curso, materias: [...], por_grado: { <id del grau>: {...} } }
    ponderaciones.csv   mateixes dades en format llarg (id, universidad, grado, materia, ponderacion)
"""
import bisect
import csv
import json
import os
import re
import sys
import unicodedata
import urllib.request
from collections import defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "data")
RAW = os.path.join(DATA, "raw")

PDF_URL = "https://universitats.gencat.cat/web/.content/01_acces_i_admissio/preinscripcions/documentacio/Ponderacions-2026_v4.pdf"
PDF_PATH = os.path.join(RAW, "Ponderacions-2026_v4.pdf")
CURSO_ACTUAL = "2026-2027"

UNI_EQUIVALENTS = {
    "UVic-UCC": "UVic",
}


def descarregar_pdf():
    os.makedirs(RAW, exist_ok=True)
    if "--offline" not in sys.argv or not os.path.exists(PDF_PATH):
        print("descarregant", PDF_URL)
        req = urllib.request.Request(PDF_URL, headers={"User-Agent": "Mozilla/5.0 (orientacio-tecnos data script)"})
        with urllib.request.urlopen(req, timeout=300) as r:
            with open(PDF_PATH, "wb") as f:
                f.write(r.read())
    return PDF_PATH


def _cluster(vals, tol=0.6):
    vals = sorted(vals)
    clusters = []
    for v in vals:
        if clusters and v - clusters[-1][-1] <= tol:
            clusters[-1].append(v)
        else:
            clusters.append([v])
    return [sum(c) / len(c) for c in clusters]


def _capcaleres_materies(pagina):
    """Les capçaleres de matèria estan escrites en vertical (rotades 90°): pdfplumber
    retorna els caràcters en l'ordre de dibuix, no de lectura, així que cal agrupar-los
    per columna (usant les línies verticals de la graella) i invertir cada fragment."""
    vores = [e for e in pagina.edges if e["orientation"] == "v"]
    xs = _cluster([e["x0"] for e in vores])
    limits = [b for b in xs if b >= 326.0]

    def columna(x0):
        i = bisect.bisect_right(limits, x0) - 1
        if i < 0 or i >= len(limits) - 1:
            return None
        return i

    rotats = [c for c in pagina.chars if not c.get("upright", True)]
    per_columna = defaultdict(lambda: defaultdict(list))
    for c in rotats:
        idx = columna(c["x0"])
        if idx is None:
            continue
        per_columna[idx][round(c["x0"], 1)].append(c)

    capcaleres = {}
    for idx in sorted(per_columna.keys()):
        subx = sorted(per_columna[idx].keys())
        parts = []
        for sx in subx:
            lletres = sorted(per_columna[idx][sx], key=lambda c: c["top"])
            text = "".join(c["text"] for c in lletres)[::-1]
            parts.append(text.strip())
        capcaleres[idx] = " ".join(p for p in parts if p)
    return limits, capcaleres, columna


def _normalitza_pes(text):
    t = text.strip().replace("'", ",")
    if t == "0,2":
        return 0.2
    if t == "0,1":
        return 0.1
    return None


def extreu_pdf(path):
    import pdfplumber

    with pdfplumber.open(path) as pdf:
        limits, materies, columna = _capcaleres_materies(pdf.pages[0])
        registres = []
        for pagina in pdf.pages:
            vores_h = [e for e in pagina.edges if e["orientation"] == "h"]
            files_y = _cluster([e["top"] for e in vores_h])
            if len(files_y) < 2:
                continue
            paraules = [w for w in pagina.extract_words(extra_attrs=["upright"]) if w.get("upright", True)]
            for i in range(len(files_y) - 1):
                y0, y1 = files_y[i], files_y[i + 1]
                if y1 - y0 < 5:
                    continue
                fila = [w for w in paraules if y0 - 0.5 <= w["top"] < y1 - 0.5]
                if not fila:
                    continue
                codis = [w for w in fila if w["x0"] < 66 and re.fullmatch(r"\d{4,6}", w["text"])]
                if not codis:
                    continue
                codi = codis[0]["text"]
                nom_paraules = sorted((w for w in fila if 66 <= w["x0"] < 289.5), key=lambda w: (round(w["top"], 0), w["x0"]))
                nom = re.sub(r"\s+", " ", " ".join(w["text"] for w in nom_paraules)).strip()
                uni_paraules = sorted((w for w in fila if 289.5 <= w["x0"] < 326.85), key=lambda w: w["top"])
                universitat = " ".join(w["text"] for w in uni_paraules).strip()

                ponderacions = {}
                for w in fila:
                    if w["x0"] < 344.0:
                        continue
                    idx = columna(w["x0"])
                    if idx is None:
                        continue
                    pes = _normalitza_pes(w["text"])
                    if pes is None:
                        continue
                    materia = materies.get(idx)
                    if materia:
                        ponderacions[materia] = pes
                if ponderacions:
                    registres.append({"codi": codi, "nom": nom, "universitat": universitat, "ponderacions": ponderacions})
        return list(materies.values()), registres


def _normalitza_nom(s):
    s = (s or "").replace("’", "'")
    s = unicodedata.normalize("NFKD", s)
    s = s.lower().replace('"', "")
    return re.sub(r"\s+", " ", s).strip()


def _nucli_nom(s):
    """Nom normalitzat sense parèntesis (campus, "agrupació"/"simultaneïtat"...) i amb les
    abreviatures d'enginyeria esteses, per aparellar noms que només difereixen en aquests
    afegitons. Mai s'usa per decidir semblança de contingut: només per retirar soroll
    purament decoratiu abans de comparar el nom complet."""
    s = re.sub(r"\([^)]*\)", " ", s)
    s = _normalitza_nom(s)
    s = re.sub(r"\beng\.", "enginyeria", s)
    s = re.sub(r"\s+", " ", s).strip(" ,")
    return s


def aparella(registres, grados):
    """Aparella cada grau de preinscripció amb la seva fila de ponderacions pel nom exacte
    (universitat + nom), i només si això falla, pel "nucli" del nom (mateix text un cop
    retirats parèntesis purament decoratius com el campus). No s'usa similitud estadística
    (difflib): amb noms de graus tan semblants entre ells ("Enginyeria Informàtica" vs.
    "Enginyeria Biomèdica", "Dret" vs. "Infermeria" si comparteixen "(Campus Manresa)"...)
    un llindar de similitud no distingeix de manera fiable un aparellament correcte d'un
    d'incorrecte — i una ponderació equivocada pot fer que algú es pensi que arriba a un
    grau quan no hi arriba, o al revés. Davant el dubte, es deixa sense dades."""
    per_uni = defaultdict(list)
    for r in registres:
        uni = UNI_EQUIVALENTS.get(r["universitat"], r["universitat"])
        per_uni[uni].append(r)

    index_exacte = defaultdict(list)
    index_nucli = defaultdict(list)
    for uni, llista in per_uni.items():
        for r in llista:
            index_exacte[(uni, _normalitza_nom(r["nom"]))].append(r)
            index_nucli[(uni, _nucli_nom(r["nom"]))].append(r)

    def desempata(candidats, g):
        if len(candidats) == 1:
            return candidats[0]
        municipi = _normalitza_nom(g.get("municipio", ""))
        exacte = [c for c in candidats if municipi and municipi in _normalitza_nom(c["nom"])]
        return exacte[0] if exacte else candidats[0]

    por_grado = {}
    no_trobats = []

    for g in grados:
        if not g.get("admision", "").startswith("Preinscripci"):
            continue  # admissió pròpia: no hi ha taula de ponderacions PAU
        uni = g["universidad"]
        trobat, confianca = None, "exacta"

        candidats = index_exacte.get((uni, _normalitza_nom(g["grado"])), [])
        if candidats:
            trobat = desempata(candidats, g)
        else:
            candidats = index_nucli.get((uni, _nucli_nom(g["grado"])), [])
            if candidats:
                trobat, confianca = desempata(candidats, g), "aproximada"

        if trobat is None:
            no_trobats.append(g)
            continue
        por_grado[g["id"]] = {
            "ponderaciones": trobat["ponderacions"],
            "confianza": confianca,
        }

    return por_grado, no_trobats


def main():
    pdf_path = descarregar_pdf()
    materies, registres = extreu_pdf(pdf_path)
    print(f"extrets {len(registres)} registres, {len(materies)} matèries", file=sys.stderr)

    with open(os.path.join(DATA, "grados.json"), encoding="utf-8") as f:
        grados = json.load(f)

    por_grado, no_trobats = aparella(registres, grados)
    aproximats = sum(1 for v in por_grado.values() if v["confianza"] == "aproximada")
    print(f"aparellats {len(por_grado)} graus ({aproximats} aproximats); sense taula: {len(no_trobats)}", file=sys.stderr)
    for g in no_trobats:
        print("  sense ponderacions:", g["universidad"], "|", g["grado"], file=sys.stderr)

    sortida = {
        "generado": __import__("datetime").date.today().isoformat(),
        "fuente": PDF_URL,
        "curso": CURSO_ACTUAL,
        "materias": sorted(materies),
        "por_grado": por_grado,
    }
    with open(os.path.join(DATA, "ponderaciones.json"), "w", encoding="utf-8") as f:
        json.dump(sortida, f, ensure_ascii=False, indent=1)

    id_a_grado = {g["id"]: g for g in grados}
    with open(os.path.join(DATA, "ponderaciones.csv"), "w", encoding="utf-8", newline="") as f:
        w = csv.writer(f)
        w.writerow(["id", "universidad", "grado", "materia", "ponderacion", "confianza"])
        for gid, info in sorted(por_grado.items()):
            g = id_a_grado.get(gid, {})
            for materia, pes in sorted(info["ponderaciones"].items()):
                w.writerow([gid, g.get("universidad", ""), g.get("grado", ""), materia, pes, info["confianza"]])

    print("escrit data/ponderaciones.json i data/ponderaciones.csv", file=sys.stderr)


if __name__ == "__main__":
    main()
