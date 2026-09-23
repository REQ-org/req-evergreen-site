# REQ Evergreen Income Fund — investor-side

Arbeidsrepo for REQ AI Bootcamp-økten **Claude Code – Intro**. Her bygger vi en interaktiv, REQ-merket investor-side for REQ Evergreen Income Fund. Mottaker er en mulig kunde: pensjonskasse, livselskap eller stiftelse.

Rytmen i økten er enkel. Start en oppgave i Claude Code. Gå rundt og hjelp. Gjenta. Ingen klokkeblokker.

## Formål og leser

Siden skal fungere som markedsmateriell. Den skal bære tesen, vise teamet, og la offentlige tall — demografi, kapasitet, rente — gjøre jobben. Ikke en generisk landing. Ikke et kart alene.

Leseren er en profesjonell investor, ikke retail. Fondet er evigvarende og ubelånt, lansert i mai 2026. Siden skal fremstå ferdig: den viser det vi har, og nevner ikke det som mangler.

## data/

Ti CSV-er. Bruk dem som de er. Ikke finn på tall.

- `evergreen-fund-facts.csv` — offentlige fakta til hero, faktaboks og disclaimer (Estate Nyheter 26. mai 2026, REQ LinkedIn, req.no).
- `norway-population-80plus.csv` — 80+ i Norge, observert 2010–2026 (SSB 07459) og framskrevet 2027–2050 (SSB 14288 MMMM).
- `norway-age-structure.csv` — 0–19 mot 65+ i 2024, 2031, 2040 og 2050 (SSB 14288 MMMM). I 2031 passerer 65+ barn/unge.
- `norway-care-capacity.csv` — sykehjemsplasser 2021–2025, tilnærmet flate mens 80+ vokser (SSB KOSTRA). To rader `derived_illustration`: plasser som trengs i 2040 og 2050 for å holde 2025-dekningen. Regneeksempel, ikke SSB-prognose.
- `norway-old-age-support.csv` — personer 20–64 per person 80+, 2024–2050, pluss 90+ (SSB 14288 MMMM). Fra 12,8 til 5,6 i yrkesaktiv alder per 80+.
- `norway-80plus-by-county.csv` — 80+ per fylke 2024, 2030, 2040 og 2050 (SSB 14288 MMMM). Alle fylker dobler seg eller mer innen 2050.
- `norway-dementia.csv` — personer med demens 2025–2050, fra ca. 115 000 til ca. 225 000 (FHI Folkehelserapporten). Over 80 % av langtidsbeboere i sykehjem har demens.
- `norway-cpi.csv` — konsumprisindeksen 2015–2025 og siste 12-månedersendring (SSB 14711 og 14710). +37,7 % fra 2015 til 2025.
- `yield-context.csv` — 10-års statsrente (OECD/FRED, Norges Bank) mot avkastningsmål 6–8 %, pluss prime-yield som meglerestimat (JLL, CBRE).
- `evergreen-real-estate-fund.csv` — seks offentlige referansepunkter for målsektorene. Alle rader har `is_evergreen_holding=nei`.

## theme/

REQ-look: `tokens.css` (farger, type, avstand), `brand.md`, logoer og foto-kilder. Hvordan bruke det: `theme/README.md`.

## Kom i gang med Claude Code

Klon repoet og åpne mappen:

```bash
git clone https://github.com/mainquest-labs/req-evergreen-site.git
cd req-evergreen-site
claude
```

En første prompt:

```
Bygg en investor-side for REQ Evergreen Income Fund i site/.
Mottaker: profesjonell investor (pensjonskasse / liv / stiftelse).

Les theme/README.md, theme/tokens.css og theme/brand.md. Bruk det temaet.
Les data/evergreen-fund-facts.csv. Bruk bare den.

Seksjoner, i denne rekkefølgen:
1. Hero — navn, evergreen + ubelånt, lansert mai 2026. Foto: theme/assets/hero-climber.webp, hvit logo.
2. Hvorfor dette — to søyler (demografi / beliggenhet).
3. Avkastningsmål — 6–8 % merket MÅL, ikke historikk.
4. Hvem det er for — pensjon, liv, stiftelse.
5. Team — Per Sverdrup Løken, 14 år NBIM. Ikke fondets track record.
6. Risiko / disclaimer — markedsmateriell, ikke tilbud.
7. Neste steg — kontakt Sommerrogata 17.

Lenk inn theme/tokens.css. Logo: theme/assets/req-logo-navy.svg på hvitt, req-logo-white.svg på foto.
Hvit bakgrunn, navy via token, bokmål, rolig vi-form.
5 mrd. er REQ-plattformen, ikke fondet.
Ingen git, npm, deploy. Ikke pakk TT Hoves Pro. Én HTML + ev. app.js.
Chart-plassholdere med id: chart-80plus, chart-age, chart-care, chart-support, chart-county, chart-dementia, chart-cpi, chart-yield.
Stopp når siden åpner.
```

Forhåndsvis lokalt når `site/` finnes:

```bash
cd site && python3 -m http.server 8765
```

Åpne [http://127.0.0.1:8765](http://127.0.0.1:8765). Port opptatt: `8766`.

Grafer: Chart.js eller uPlot fra CDN. Farger og avstand fra `theme/tokens.css`. Ingen lilla.

## Hva siden skal vise

- **Tese.** Demografi og strategisk beliggenhet. Sektorer: eldre/omsorg/helse, forskning/utdanning, beredskap, dagligvare, forsyning.
- **Team.** Per Sverdrup Løken, 14 år NBIM eiendom. Det er hans historikk, ikke fondets.
- **Grafer fra `data/`.** 80+ observert (heltrukket) og framskrevet (stiplet). 0–19 mot 65+ med 2031-krysset. Sykehjemsplasser som flater ut, mot plassene som trengs for å holde 2025-dekningen (merket regneeksempel). Yrkesaktive per 80+ som faller fra 12,8 til 5,6. 80+-vekst per fylke 2024–2050. Personer med demens mot 2050. KPI-vekst som inflasjonsbakteppe for leieinntekt. Statsrente mot mål 6–8 %, med prime office/logistikk merket meglerestimat.
- **Disclaimer.** Markedsmateriell, ikke et tilbud.

Kart eller kort fra sektorfilen er supplement. Hvis noe må kuttes: behold grafene.

## Datagrenser

Bare offentlige fakta. Ikke Drive `1_Inputs`. Ikke upublisert pipeline.

- **6–8 %** er et mål, ikke et resultat. Ingen kurve merket «Evergreen-avkastning».
- NAV, committed capital, holdings, gebyr, ISIN, første kjøp og realisert avkastning: ikke oppgi tall, og ikke nevn dem på siden. Ingen «ikke publisert», «ennå» eller «under etablering».
- Radene i `evergreen-real-estate-fund.csv` er referansepunkter, ikke fondets portefølje.
- **5 mrd. kr** er REQ-plattformens AUM siden 2020, ikke Evergreen.
- Fund I og Fund II er andre kjøretøy. Bland dem ikke inn som Evergreen-holdings.
- Ingen prosentallokering. Ikke finn på en kake.
- JLL/CBRE-yield er andres estimat, ikke «vår yield».
- Regneeksempel på sykehjemsplasser er ikke en SSB-prognose. Merk det.
- Demenstallene er FHIs estimat og framskriving, ikke SSB-tall. Oppgi FHI som kilde.
- KPI er inflasjon i Norge, ikke fondets leieinntekt. Ikke påstå at fondets kontrakter er KPI-regulert.
- Skill observert og framskrevet. SSB 07459 og 14288 avviker litt i 2025–26 — si det.

## GitHub og deploy

Valgfritt. Økten krever verken push eller hosting. Claude Code kan kobles til GitHub senere; det er oppfølging, ikke leksen.
