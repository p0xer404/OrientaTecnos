"""Bachilleratos (área metropolitana, con detalle de Terrassa) y Enseñanzas Artísticas Superiores.
Lo llama update_data.py. Fuentes: Dades obertes Generalitat (kvmv-ahh4, ky5m-v7i9, wjaf-jxmt, 8spq-9nx7)."""
import math, collections as C

METRO = ["Barcelonès", "Baix Llobregat", "Vallès Occidental", "Vallès Oriental", "Maresme"]
TERRASSA = (41.5632, 2.0089)
CURSO_DIR = "2026/2027"
CURSO_OFERTA_BATX = "2025/2026"   # último curso con oferta de batxillerat publicada
CURSO_OFERTA_ART = "2026/2027"


def km(lat, lon):
    if lat is None or lon is None:
        return None
    R = 6371
    p1, p2 = math.radians(TERRASSA[0]), math.radians(lat)
    dp, dl = p2 - p1, math.radians(lon - TERRASSA[1])
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return round(2 * R * math.asin(math.sqrt(a)), 1)


ENS_ART = {"esdi": "Diseño", "adr": "Arte dramático", "dans": "Danza", "muss": "Música", "crbc": "Conservación y restauración de bienes culturales"}
ESPECIALIDADES = {
    "Diseño": ["Diseño gráfico", "Diseño de interiores", "Diseño de moda", "Diseño de producto"],
    "Arte dramático": ["Interpretación", "Dirección escénica y dramaturgia", "Escenografía"],
    "Danza": ["Coreografía e interpretación", "Pedagogía de la danza"],
    "Música": ["Interpretación (clásica, jazz y moderna, tradicional…)", "Composición", "Dirección", "Pedagogía", "Musicología", "Producción y gestión", "Sonología"],
    "Conservación y restauración de bienes culturales": ["Arqueología", "Pintura", "Escultura", "Documento gráfico"],
}
# Precios públicos por crédito (1ª matrícula, 60 créditos/curso)
PRECIO_PUBLICO = [
    ("Institut del Teatre", 32.18, "https://www.institutdelteatre.cat/pl637/estudis/matriculacio/esad/id411/taxes-i-preus-publics-de-l-escola-superior-d-art-dramatic.htm", "Precio publicado por el Institut del Teatre (puede no estar actualizado). +67,83 € gestión anual."),
    ("Escola Superior de Música de Catalunya", 25.04, "https://www.esmuc.cat/en/studies/grau/prices-and-payment/", "Precio aprobado por el patronato de la ESMUC; se revisa cada año."),
]
PRECIO_EDU = (21.73, "https://triaeducativa.gencat.cat/ca/artistics-esportius/esportius/taxes-preus-publics/preus-publics/", "Precio público del Departament d'Educació para títulos superiores artísticos.")


def contacto(r, fnum):
    lat, lon = fnum(r.get("coordenades_geo_y")), fnum(r.get("coordenades_geo_x"))
    return dict(direccion=r.get("adre_a"), cp=r.get("codi_postal"), municipio=r.get("nom_municipi"), comarca=r.get("nom_comarca"),
                telefono=r.get("tel_fon"), email=r.get("e_mail_centre"), web=r.get("url"), lat=lat, lon=lon, km_desde_terrassa=km(lat, lon))


def build(fetch, fnum):
    flags = " OR ".join(f"{k} IS NOT NULL" for k in ["batx", "esdi", "adr", "crbc", "dans", "muss", "escs", "cfas"])
    directorio = fetch("kvmv-ahh4", f"&$where=curs='{CURSO_DIR}' AND ({flags})", name="kvmv-ahh4-postobligatoria")
    oferta = fetch("ky5m-v7i9", "&$where=nom_ensenyament like 'Batxillerat%' OR codi_ensenyament like 'CFAS%'", name="ky5m-v7i9-batx-cfas")
    comarcas = ",".join("'" + c + "'" for c in METRO)
    asign = fetch("wjaf-jxmt", f"&$where=nom_comarca in({comarcas}) AND starts_with(convocatoria,'Batxillerat')", name="wjaf-jxmt-batx-metro")
    mat = fetch("xvme-26kg", f"&$where=codi_estudis='BATX' AND curs='{CURSO_OFERTA_BATX}' AND nom_comarca in({comarcas})", name="xvme-26kg-batx-metro")
    conc = fetch("8spq-9nx7", "&$where=unitats_concertades_batx IS NOT NULL&$select=curs_escolar,codi_centre,unitats_concertades_batx", name="8spq-9nx7-batx")
    ult = max(r["curs_escolar"] for r in conc)
    concertados = {r["codi_centre"] for r in conc if r["curs_escolar"] == ult and fnum(r["unitats_concertades_batx"])}

    # ---------- BACHILLERATOS ----------
    of = C.defaultdict(list)
    for r in oferta:
        if r["curs"] == CURSO_OFERTA_BATX and r["nom_ensenyament"].startswith("Batxillerat") and r["nivell"] == "1":
            of[r["codi_centre"]].append(r)
    asg = C.defaultdict(list)
    for r in asign:
        if r["curs"] == CURSO_OFERTA_BATX and r["nivell"] == "1":
            asg[r["codi_centre"]].append(r)
    MOD = {"CIÈNCIES I TECNOLOGIA": "Ciencias y Tecnología", "HUMANITATS I CIÈNCIES SOCIALS": "Humanidades y Ciencias Sociales", "ARTS": "Artes", "GENERAL": "General"}
    matr = C.defaultdict(lambda: C.defaultdict(lambda: {"1o": 0, "2o": 0}))
    for r in mat:
        nom = r["nom_ensenyament"].upper()
        m = next((v for k, v in MOD.items() if k in nom), None)
        if not m:
            continue
        x = matr[r["codi_centre"]][m]
        x["1o" if r["nivell"] == "1" else "2o"] += int(r.get("matr_cules_total") or 0)
    ORDEN = list(MOD.values())
    bach = []
    for r in directorio:
        if not r.get("batx") or r.get("nom_comarca") not in METRO:
            continue
        cod = r["codi_centre"]
        if r["nom_naturalesa"] == "Públic":
            tit, precio, pnota = "Público", 0, "Gratuito"
        elif cod in concertados:
            tit, precio, pnota = "Concertado", 0, "Concertado: sin cuota de escolaridad (puede haber cuotas voluntarias o actividades complementarias)"
        else:
            tit, precio, pnota = "Privado", None, "Privado: consultar al centro"
        o, a = of.get(cod, []), asg.get(cod, [])
        mm = matr.get(cod, {})
        modal = [m for m in ORDEN if m in mm]
        if not modal and (o or a):  # sin datos de matrícula: solo sabemos Artes / resto
            modal = sorted({"Artes" if "arts" in x["nom_ensenyament"] else "Otras modalidades (consultar)" for x in o + a})
        sumi = lambda rows, k: sum(int(x.get(k) or 0) for x in rows) if rows else None
        plazas_pre = sumi(a, "places_ofertades_a_la")
        asignados = sumi(a, "assignacions")
        primera = sumi(a, "assginacions_1a_peticio")
        bach.append(dict(
            id=f"batx-{cod}", codigo_centro=cod, centro=r["denominaci_completa"], titularidad=tit,
            es_terrassa=r.get("nom_municipi") == "Terrassa", **contacto(r, fnum),
            modalidades=modal or ["Consultar al centro"],
            ciencias_tecnologia="Ciencias y Tecnología" in mm, humanidades_sociales="Humanidades y Ciencias Sociales" in mm,
            artes="Artes" in mm or "Artes" in modal, general="General" in mm,
            alumnos_por_modalidad={m: mm[m] for m in ORDEN if m in mm} or None,
            alumnos_1o_total=sum(v["1o"] for v in mm.values()) if mm else None,
            curso_datos_matricula=CURSO_OFERTA_BATX if mm else None,
            turnos=sorted({x.get("torn") for x in o if x.get("torn")}) or None,
            regimen=sorted({x.get("r_gim") for x in a if x.get("r_gim")}) or None,
            grupos_1o=sumi(o, "nombre_grups"), plazas_1o=sumi(o, "nombre_places"),
            plazas_preinscripcion_1o=plazas_pre, asignados_preinscripcion_1o=asignados, asignados_1a_opcion_1o=primera,
            ocupacion_preinscripcion=round(asignados / plazas_pre, 2) if plazas_pre else None,
            curso_datos_oferta=CURSO_OFERTA_BATX if o or a else None,
            precio_curso=precio, precio_nota=pnota))
    bach.sort(key=lambda x: (not x["es_terrassa"], x["km_desde_terrassa"] if x["km_desde_terrassa"] is not None else 999, x["centro"]))

    # ---------- ENSEÑANZAS ARTÍSTICAS SUPERIORES (+ ciclos superiores artísticos) ----------
    cfas = C.defaultdict(list)
    for r in oferta:
        if r["curs"] == CURSO_OFERTA_ART and r.get("codi_ensenyament", "").startswith("CFAS"):
            cfas[r["codi_centre"]].append(r)
    art = []
    for r in directorio:
        ens = [v for k, v in ENS_ART.items() if r.get(k)]
        ciclos = sorted({x["nom_ensenyament"] for x in cfas.get(r["codi_centre"], [])})
        escs = bool(r.get("escs"))
        if not ens and not ciclos and not escs:
            continue
        publico = r["nom_naturalesa"] == "Públic"
        nombre = r["denominaci_completa"]
        pc, pf, pn = (None, None, "Centro privado: consultar al centro") if not publico else PRECIO_EDU
        if publico:
            for k, c, f, n in PRECIO_PUBLICO:
                if k.lower() in nombre.lower() or ("Teatre" in k and ("Institut del Teatre" in nombre or "Tècniques de les Arts de l'Espectacle" in nombre)):
                    pc, pf, pn = c, f, n
        tipo = []
        if ens:
            tipo.append("Título superior artístico (equivalente a grado, 240 ECTS)")
        if ciclos:
            tipo.append("Ciclos formativos de grado superior de artes plásticas y diseño")
        if escs:
            tipo.append("Ciclos de grado superior de artes escénicas / técnicas del espectáculo")
        art.append(dict(
            id=f"art-{r['codi_centre']}", codigo_centro=r["codi_centre"], centro=nombre, titularidad="Público" if publico else "Privado",
            es_terrassa=r.get("nom_municipi") == "Terrassa", tipo_estudios=tipo, ensenanzas_superiores=ens,
            especialidades=sorted({e for x in ens for e in ESPECIALIDADES.get(x, [])}), ciclos_superiores_artisticos=ciclos,
            admision=("Prueba de acceso específica del centro + Bachillerato (o prueba para mayores de 18). No cuenta la nota de la PAU." if ens else "Preinscripción de ciclos (Bachillerato o prueba de acceso)."),
            precio_credito=pc if ens else None, precio_1r_curso=round(pc * 60, 2) if (ens and pc) else None,
            precio_ciclos=(360 if (ciclos and publico) else None),
            precio_fuente=pf if ens else None, precio_nota=pn if ens else ("Ciclos públicos: 360 €/curso (precio público CFGS)" if publico else "Consultar al centro"),
            **contacto(r, fnum)))
    # ESCAC: es un grado universitario (UB) pero es la escuela de cine de referencia y está en Terrassa
    art.append(dict(id="art-escac", codigo_centro=None, centro="ESCAC – Escola Superior de Cinema i Audiovisuals de Catalunya", titularidad="Privado (adscrito a la UB)",
        es_terrassa=True, tipo_estudios=["Grado universitario oficial (UB): Cinematografía, 240 ECTS"], ensenanzas_superiores=["Cine y audiovisuales"],
        especialidades=["Producción", "Dirección", "Fotografía", "Dirección de arte", "Guion", "Montaje", "Sonido", "Documental"], ciclos_superiores_artisticos=[],
        admision="PAP propia de ESCAC (portfolio + video pitch + prueba audiovisual + entrevista; abril o junio, ~110 €) + preinscripción universitaria. 110 plazas. Nota de corte 5 (2023-2026).",
        precio_credito=None, precio_1r_curso=13500, precio_ciclos=None, precio_fuente="https://escac.com/en/education/bachelor/grado-oficial-en-cinematografia/",
        precio_nota="Precio estimado 2026-27 (parte pública UB + Fundació ESCAC), pago único. Becas de la Fundació hasta 100 %. Curso Foundation preuniversitario exime de la PAP.",
        direccion="Plaça de la Farinera, 9", cp="08222", municipio="Terrassa", comarca="Vallès Occidental", telefono="937361555", email="info@escac.es",
        web="https://escac.com", lat=None, lon=None, km_desde_terrassa=0.0, destacado=True))
    for x in art:
        x.setdefault("destacado", False)
        if "CITM" in x["centro"]:
            x["precio_nota"] = "El CITM imparte grados de la UPC (Videojuegos, Animación, Multimedia): ver buscador de grados, 6.900 €/curso."
    art.sort(key=lambda x: (not x["destacado"], not x["es_terrassa"], -len(x["ensenanzas_superiores"]), x["km_desde_terrassa"] or 999))
    return bach, art
