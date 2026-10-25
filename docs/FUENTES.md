# Fuentes

## Datos oficiales (se descargan automáticamente con `scripts/update_data.py`)
- Notas de corte y plazas (convocatorias 2023 → 2026): Generalitat, Dades obertes, dataset `usyn-hngc` — https://analisi.transparenciacatalunya.cat/d/usyn-hngc
- Oferta de FP (FPCAT): dataset `7vig-4syr` — https://analisi.transparenciacatalunya.cat/d/7vig-4syr
- Directorio de centros docentes: dataset `kvmv-ahh4` — https://analisi.transparenciacatalunya.cat/d/kvmv-ahh4

- Oferta inicial de plazas post-obligatorias (Bachillerato, ciclos artísticos): dataset `ky5m-v7i9` — https://analisi.transparenciacatalunya.cat/d/ky5m-v7i9
- Asignación de plazas de la preinscripción (demanda de Bachillerato): dataset `wjaf-jxmt` — https://analisi.transparenciacatalunya.cat/d/wjaf-jxmt
- Alumnos matriculados por modalidad de Bachillerato (Ciencias y Tecnología, Humanidades y CC. Sociales, Artes, General): dataset `xvme-26kg` — https://analisi.transparenciacatalunya.cat/d/xvme-26kg
- Conciertos educativos (Bachillerato concertado): dataset `8spq-9nx7` — https://analisi.transparenciacatalunya.cat/d/8spq-9nx7

## Precios
- Universidades públicas: Decret 96/2026 (DOGC 18/06/2026), 17,69 €/crédito — https://universitats.gencat.cat/ca/acces-universitat/sobre-preus-beques/preus-estudis-universitaris/
- FP pública: CFGS 360 €/curso (180 € bonificado); CFGM y grado básico sin precio público de matrícula.
- Centros adscritos y privadas: cada registro tiene su URL en `precio_fuente`. Recogidos en octubre de 2026 de: Tecnocampus, EUNCET, EUIT Terrassa, CITM, UVic-UCC / UManresa, Esade, IQS, La Salle, Blanquerna, UIC Barcelona y Abat Oliba CEU.
- Enseñanzas artísticas superiores públicas: 21,73 €/crédito (https://triaeducativa.gencat.cat/ca/artistics-esportius/esportius/taxes-preus-publics/preus-publics/); ESMUC 25,04 €/crédito (https://www.esmuc.cat/en/studies/grau/prices-and-payment/); Institut del Teatre 32,18 €/crédito (página de 2021, puede haber cambiado).
- ESCAC: 13.500 €/curso estimado 2026-27 (https://escac.com/en/education/bachelor/grado-oficial-en-cinematografia/).
- Esade: el precio 2026-27 procede de Infobae (11/06/2026); la web de Esade ya muestra el 2027-28 (21.300 € / 24.500 €).

## Limitaciones conocidas
- Faltan precios de algunos centros adscritos (lista en `meta.json → centros_sin_precio`).
- La lista de grados de IQS se ha montado a partir de su web pública; su precio es 236 €/crédito (14.160 €/curso).
- No están: UOC (online, 20,42 €/crédito) ni universidades fuera de Cataluña.
- Precios de escuelas artísticas privadas (Liceu, Taller de Músics, IED, LCI, Eòlia…): no publicados, "consultar".
- Bachillerato: la oferta por modalidad es del curso 2025-26 (el 2026-27 aún no está publicado) ; las modalidades salen de los alumnos matriculados en 2025-26 (si una modalidad no tuvo alumnos ese curso no aparece). Artes no distingue entre plásticas/diseño y música/escénicas. Los privados sin concierto no tienen datos de plazas.
- El área de conocimiento es automática: revisa casos raros.
- La oferta FPCAT puede no incluir algún centro concertado/privado.
