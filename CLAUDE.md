# REQ Evergreen Income Fund — investor-side

## Oppdraget

Bygg en investor-side for REQ Evergreen Income Fund i `site/`. Leseren er en profesjonell investor: pensjonskasse, livselskap eller stiftelse. Siden skal overbevise om tesen — demografi og strategisk beliggenhet gir langsiktig, ubelånt leieinntekt — og la offentlige tall gjøre jobben. Fondet er evigvarende og ubelånt, lansert mai 2026. Teamet bærer historikken: Per Sverdrup Løken, 14 år i NBIM eiendom.

Struktur, rekkefølge, grafer og interaksjon velger du selv. Siden skal fremstå ferdig: vis det vi har, nevn ikke det som mangler.

## Kvalitetsnivå

- Høy kvalitet, ikke AI-slop. Tenk årsrapport eller finansmagasin, ikke SaaS-landingsside.
- Se bildene i `theme/references/` hvis mappen har innhold. De viser nivået og stilen vi sikter mot. REQ-profilen gjelder likevel: fra andre merkevarer låner vi håndverk, rytme og luft, ikke logo, farger eller font.
- Visuelt: følg `theme/brand.md` og `theme/tokens.css`. Bruk bildene og logoene i `theme/assets/`.
- Tekst: bokmål, rolig vi-form, korte setninger. Tallene gjør jobben. Overskrifter påstår noe («I 2031 er det flere over 65 enn under 20»), de navngir ikke tema («Demografi»). Ingen salgsadjektiver.
- Interaktivitet skal hjelpe leseren å forstå, ikke pynte: hover på grafer, veksling mellom visninger, fylkesvalg og lignende.
- Før du sier du er ferdig: se på siden, nevn de tre tingene som ser mest generiske ut, og fiks dem.

## Harde regler

Dette er markedsmateriell for et fond. Reglene er ikke forhandlbare.

- Tall kun fra `data/`. Ikke finn på tall. Oppgi kilde ved hver graf. Les `notes`-kolonnen.
- Skill observert fra framskrevet (for eksempel heltrukket mot stiplet). SSB 07459 og 14288 avviker litt i 2025–26 — si det.
- **6–8 %** er et avkastningsmål, ikke et resultat. Ingen kurve eller KPI som ser ut som fondets avkastning.
- **5 mrd. kr** er REQ-plattformens forvaltning siden 2020, ikke fondet. Fund I og Fund II er andre fond.
- Radene i `evergreen-real-estate-fund.csv` er offentlige referansepunkter, ikke fondets eiendommer.
- Ikke nevn NAV, innhentet kapital, beholdning, gebyr, ISIN, første kjøp, realisert avkastning eller allokering. Heller ikke «ikke publisert», «ennå» eller «under etablering».
- Sykehjemsplasser som trengs i 2040/2050 er et regneeksempel, ikke en SSB-prognose — merk det. Demenstall er FHIs estimat. JLL/CBRE-yield er meglerestimat, ikke vår yield. KPI er inflasjon, ikke fondets leieinntekt.
- Siden må ha en disclaimer: markedsmateriell, ikke et tilbud.

## Teknisk

- Deltakeren sitter på Windows. Siden skal åpnes ved å dobbeltklikke `site/index.html` — ingen server, ingen installasjon, ingen byggesteg.
- Derfor: les CSV-ene og skriv tallene til en `site/data.js` (`window.DATA = {...}`), lastet med vanlig `<script>`. Ikke `fetch()` og ikke `type="module"` — begge feiler fra `file://`.
- Biblioteker fra CDN (cdnjs, jsdelivr) er greit, for eksempel Chart.js.
- Font: velg en Google Font som ligger nær TT Hoves Pro (ren grotesk), med fallback til systemfont. Ikke pakk eller last ned TT Hoves Pro.
- Når siden fungerer, åpne den i deltakerens standard nettleser.
