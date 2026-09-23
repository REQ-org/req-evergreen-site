# theme/

REQ-temaet for investor-siden. Offentlig materiale fra [req-design-pack](https://github.com/mainquest-labs/req-bootcamp/tree/main/req-design-pack) og [req.no](https://req.no).

## Innhold

| Fil | Bruk |
|---|---|
| `tokens.css` | Farger, typografi, avstand, diagramserier. Lenk den inn i `site/`. |
| `brand.md` | Regler: hvit bakgrunn, navy som én sterk aksent, logo, anti-slop. |
| `assets/req-logo-navy.svg` | Logo på hvit flate. |
| `assets/req-logo-white.svg` | Logo på navy, petrol eller foto. |
| `assets/CREDITS.md` | Kilde og lisens for hero-foto. URL-ene peker på req.no (binære WebP er ikke i repoet). |

Hero-foto fra req.no (klatrer, fjord): se `assets/CREDITS.md` for URL og `curl`. Bruk dem som full-bleed bakgrunn, eller last ned til `theme/assets/` før økten.

## I siden

```html
<link rel="stylesheet" href="../theme/tokens.css">
```

Bruk variablene, ikke hardkodede farger:

```css
.hero { background: var(--req-petrol-deep); color: var(--req-white); }
h1, a, .kpi { color: var(--req-navy); }
.chart-2 { color: var(--req-chart-2); }
```

- Hero: full-bleed foto, hvit logo nederst til venstre, kort tittel over. Navy på hvit i resten av siden.
- Én HTML + `tokens.css`. Chart.js eller uPlot fra CDN. Ingen npm, ingen gradient, ingen lilla, ingen emoji.
- **TT Hoves Pro** er lisensiert til REQ. Ikke last ned eller pakk fontfilene. Stacken i `tokens.css` faller tilbake til Open Sans / Arial.

Se `brand.md` for det fulle regelsettet.
