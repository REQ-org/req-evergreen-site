# REQ Evergreen Income Fund — investor-side

Arbeidsrepo for REQ AI Bootcamp-økten **Claude Code – Intro**. Her bygger vi en interaktiv, REQ-merket investor-side for REQ Evergreen Income Fund. Mottaker er en mulig kunde: pensjonskasse, livselskap eller stiftelse.

Rytmen i økten er enkel. Start en oppgave i Claude Code. Gå rundt og hjelp. Gjenta. Ingen klokkeblokker.

## Formål og leser

Siden skal fungere som markedsmateriell. Den skal bære tesen, vise teamet, og la offentlige tall — demografi, kapasitet, rente — gjøre jobben. Ikke en generisk landing. Ikke et kart alene.

Leseren er en profesjonell investor, ikke retail. Fondet er evigvarende og ubelånt, og det er under etablering (mai 2026). Det som ikke er publisert, skal stå som ikke publisert.

## data/

Seks CSV-er. Bruk dem som de er. Ikke finn på tall.

- `evergreen-fund-facts.csv` — offentlige fakta til hero, faktaboks og disclaimer (Estate Nyheter 26. mai 2026, REQ LinkedIn, req.no).
- `norway-population-80plus.csv` — 80+ i Norge, observert 2010–2026 (SSB 07459) og framskrevet 2027–2050 (SSB 14288 MMMM).
- `norway-age-structure.csv` — 0–19 mot 65+ i 2024, 2031, 2040 og 2050 (SSB 14288 MMMM). I 2031 passerer 65+ barn/unge.
- `norway-care-capacity.csv` — sykehjemsplasser 2021–2025, tilnærmet flate mens 80+ vokser (SSB KOSTRA).
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
1. Hero — navn, evergreen + ubelånt, «under etablering». Foto fra URL-ene i theme/assets/CREDITS.md (req.no), hvit logo.
2. Hvorfor dette — to søyler (demografi / beliggenhet).
3. Avkastningsmål — 6–8 % merket MÅL, ikke historikk.
4. Hvem det er for — pensjon, liv, stiftelse.
5. Team — Per Sverdrup Løken, 14 år NBIM. Ikke fondets track record.
6. Hva som ikke er publisert — NAV, committed, portefølje, gebyr.
7. Risiko / disclaimer — utkast til markedsmateriell, ikke tilbud.
8. Neste steg — kontakt Sommerrogata 17.

Lenk inn theme/tokens.css. Logo: theme/assets/req-logo-navy.svg på hvitt, req-logo-white.svg på foto.
Hvit bakgrunn, navy via token, bokmål, rolig vi-form.
5 mrd. er REQ-plattformen, ikke fondet.
Ingen git, npm, deploy. Ikke pakk TT Hoves Pro. Én HTML + ev. app.js.
Chart-plassholdere med id: chart-80plus, chart-age, chart-care, chart-yield.
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
- **Grafer fra `data/`.** 80+ observert (heltrukket) og framskrevet (stiplet). 0–19 mot 65+ med 2031-krysset. Sykehjemsplasser som flater ut. Statsrente mot mål 6–8 %, med prime office/logistikk merket meglerestimat.
- **Disclaimer.** Utkast til markedsmateriell, ikke et tilbud. Skriv det som ikke er publisert.

Kart eller kort fra sektorfilen er supplement. Hvis noe må kuttes: behold de fire grafene.

## Datagrenser

Bare offentlige fakta. Ikke Drive `1_Inputs`. Ikke upublisert pipeline.

- **6–8 %** er et mål, ikke et resultat. Ingen kurve merket «Evergreen-avkastning».
- Ingen NAV, committed capital, holdings, gebyr, ISIN, første kjøp eller realisert avkastning.
- Radene i `evergreen-real-estate-fund.csv` er referansepunkter, ikke fondets portefølje.
- **5 mrd. kr** er REQ-plattformens AUM siden 2020, ikke Evergreen.
- Fund I og Fund II er andre kjøretøy. Bland dem ikke inn som Evergreen-holdings.
- Prosentallokering er ikke publisert. Ikke finn på en kake.
- JLL/CBRE-yield er andres estimat, ikke «vår yield».
- Skill observert og framskrevet. SSB 07459 og 14288 avviker litt i 2025–26 — si det.

## GitHub og deploy

Valgfritt. Økten krever verken push eller hosting. Claude Code kan kobles til GitHub senere; det er oppfølging, ikke leksen.
