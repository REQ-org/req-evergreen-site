# Bildekreditering

Hero-fotoene er REQ Capitals eget markedsmateriale på req.no. Rettighetene er klare (REQ). De er ikke committet som binære WebP: GitHub MCP (`create_or_update_file` / `push_files`) koder innhold som UTF-8 og ødelegger filen (en 62-byte probe ble 76 byte). Lokal `gh`/`git` ser ikke det private repoet (token `cursor`, 404).

Last dem ned lokalt, eller pek `<img src>` på URL-ene.

| Fil | Motiv | Kilde | Lisens / rettighet |
|---|---|---|---|
| `hero-climber.webp` | Silhuett av klatrer mot fjell, 4453 × 2969 | [req.no](https://req.no) — https://req.no/wp-content/uploads/2026/05/req-climber-1.webp | REQ Capital. Publisert på req.no. |
| `norway-fjord.webp` | Norsk fjordlandskap, 1672 × 941 | [req.no](https://req.no) — https://req.no/wp-content/uploads/2026/05/req_wallpaper_blue.webp | REQ Capital. Publisert på req.no. |

```bash
curl -L -o theme/assets/hero-climber.webp \
  https://req.no/wp-content/uploads/2026/05/req-climber-1.webp
curl -L -o theme/assets/norway-fjord.webp \
  https://req.no/wp-content/uploads/2026/05/req_wallpaper_blue.webp
```

Logoene `req-logo-navy.svg` og `req-logo-white.svg` kommer fra req-bootcamp `req-design-pack/assets/` (hvit versjon publisert på req.no; navy er samme vektor i `#001D6C`).
