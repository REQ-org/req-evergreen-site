# REQ visual identity — brand spec

> Extracted 2026-08-13 from public material only: req.no (live CSS), the REQ logo, and the
> Half Year Investment Report 2026 (req.no/2026/07/half-year-investment-report-2026/).
> GitHub issue #4. Nothing confidential.

## Colors

| Token | Hex | Source / use |
|---|---|---|
| `req-navy` | `#001D6C` | The logo color (verified programmatically from the vector file). Primary brand color — headings, accents, links in documents. |
| `req-petrol` | `#005070` | req.no header/section background. Dark surfaces, dashboard headers. |
| `req-petrol-deep` | `#062533` | req.no darkest sections. Near-black surfaces, footer. |
| `req-petrol-blue` | `#007C9D` | req.no accent. Secondary accent, data series 2. |
| `req-teal` | `#82C0C7` | req.no soft accent. Highlights, chart fills, table stripes. |
| `req-mist` | `#C8D8DF` | req.no pale tint. Subtle backgrounds, callout boxes. |
| `req-ink` | `#1A1A1A` | Body text on white. |
| `req-grey` | `#666666` | Secondary text (req.no body grey). |
| `req-hairline` | `#E5E5E5` | Rules, borders, table lines. |
| `req-white` | `#FFFFFF` | Default background — REQ documents are white. |

Rules of thumb: white background, navy as the *single* strong accent, petrol/teal only as
supporting tones (charts, tints, dark sections). Never gradients, never purple.

## Typography

| Context | Font | Fallbacks |
|---|---|---|
| Web / widgets / dashboards | **TT Hoves Pro** (licensed — do not redistribute; only REQ's own site can serve it) | `"TT Hoves Pro", "Open Sans", Arial, sans-serif` |
| Word documents (matches their published reports) | **Calibri** | Carlito, Arial |
| PowerPoint | **Calibri** (headings may use Calibri Light) | Arial |

Document conventions observed in REQ's published reports:

- Body 11 pt, **justified**, ink near-black.
- Section headings in a muted petrol-blue (use `req-navy` in our templates for stronger brand tie), sentence case.
- Sub-headings inline **bold black** (e.g. "Portfolio activity", "The Setup From Here").
- Footnotes with hairline rule, used for currency/share-class detail ("In NOK. Return in SEK was …").
- Centered page numbers in the footer; no header on interior pages.
- `* * *` (spaced asterisks, centered) as a section separator inside letters.
- Cover: full-bleed Nordic nature photo, white bold title overlaid, logo bottom-left, picture credit.

## Logo

Files in `assets/`:

- `req-logo-navy.svg` / `req-logo-white.svg` — vector (white version published at
  req.no/wp-content/uploads/2026/05/req-white-rgb.svg; navy derived by recoloring to `#001D6C`).
- `req-logo-navy.png` — 2560×1067 raster, solid `#001D6C`.

The mark is a dotted globe + "REQ" wordmark, tagline "Investing with insight. Building what's next."
Use navy on white, white on navy/petrol/photo. Give it clear space; never recolor outside
navy/white; never stretch.

## Anti-slop guardrails (apply to everything produced in REQ style)

No emoji bullets, no gradient hero boxes, no generic stock iconography, no purple, no drop
shadows. Real screenshots and real numbers over illustrations. Restrained, editorial, quiet.
