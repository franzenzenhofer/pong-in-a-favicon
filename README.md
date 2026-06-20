<div align="center">

# 🏓 Pong in a Favicon

**A complete, playable game of Pong - running inside the 32×32 favicon of your browser tab.**

The game is in the tab. The score is in the tab title. **Scroll the page up and down to move your paddle.**

[**▶ Play it live**](https://pong-in-a-favicon.franzai.com/) &nbsp;·&nbsp; [Report a bug](https://github.com/franzenzenhofer/pong-in-a-favicon/issues) &nbsp;·&nbsp; MIT Licensed

```
  YOU 2 : 1 CPU
┌────────────────────────────────┐
│                ┊               │
│███             ┊               │
│███                             │
│███             ┊          ███  │
│███             ┊          ███  │
│                ●●●        ███  │
│                ●●●        ███  │
│███             ●●●        ███  │
│███                        ███  │
│                ┊               │
└────────────────────────────────┘
```

</div>

---

## What it is

A real game of Pong - physics, spin, a beatable AI, scoring - rendered into a **32×32
pixel canvas**, encoded as a PNG every frame, and pushed into the page's
`<link rel="icon">`. So the game plays **in the browser tab itself**, not on the page.

- **Desktop:** the page deliberately has nothing to play on. You **scroll up and down**;
  that scroll moves your paddle. Watch the tab icon. The score lives in the tab title.
- **Mobile:** tab icons are hidden on phones, so the page shows a small styled "tab
  preview" of the live favicon. Swipe up and down to play.

And because the engine is pure, the **same game runs in your terminal** (see the CLI).

## ✨ Highlights

- 🎮 **Pong in the favicon** - a live 32×32 game, not a GIF.
- 🖱️ **Scroll to play** - page scroll on desktop, swipe on mobile.
- 🧩 **One render, three surfaces** - favicon, mobile tab-preview, and terminal ASCII, all from a single rasterizer.
- 🤖 **100% AI-drivable from the CLI** - discrete commands, persistent state, ASCII/JSON output.
- 🧪 **Self-testing** - the page runs the engine's tests live in your browser; the same checks gate every build.
- 📐 **SSOT + DRY** - every tunable lives once; the page even shows its own real source code.
- 🌍 **Cross-browser** - Chrome, Edge, Safari; desktop and mobile.
- 📦 **Zero runtime dependencies** - just modern JavaScript.

## 🚀 Quick start

```bash
git clone https://github.com/franzenzenhofer/pong-in-a-favicon.git
cd pong-in-a-favicon
npm install
npm run dev        # open the printed URL, then look at the tab icon and scroll
```

Scripts: `npm run build` · `npm run test` · `npm run lint` · `npm run typecheck`

## 🤖 Play from the command line

The exact same engine runs headless. State persists in `.pong-state.json` between calls,
so an agent (or you) can drive the game one command at a time and read the result:

```bash
node bin/pong.js new          # start a fresh game
node bin/pong.js up 4         # move your paddle up 4px and advance one tick
node bin/pong.js down 2       # move down 2px and advance one tick
node bin/pong.js tick 20      # let the ball travel 20 ticks
node bin/pong.js show         # print the board as ASCII
node bin/pong.js state        # print the raw game state as JSON
node bin/pong.js settings     # print the single source of truth
node bin/pong.js help         # full usage
```

Chain them: `node bin/pong.js new && node bin/pong.js up 5 && node bin/pong.js tick 10 && node bin/pong.js show`

> Point commands at a different game with `--file path.json` or the `PONG_STATE` env var.

## 🧠 Architecture (say everything once)

```
settings.js   ← Single Source of Truth: every tunable + its docs
    │
engine.js     ← pure physics, no DOM (createState / step) - fully testable
    │
raster.js     ← turns game state into ONE grid of cells (the DRY hinge)
    │
    ├── renderer.js → canvas → favicon  (the tab)
    ├── (same canvas) → mobile tab-preview
    └── ascii.js    → text → terminal   (the CLI)

checks.js     ← one set of assertions, run by Vitest AND live on the page
```

Every surface reads from one rasterizer, which reads from one engine, which reads from
one settings file. Nothing can drift - and the website is literally its own
documentation, showing the real source and running the real tests in front of you.

## 📁 Project structure

```
src/
  settings.js   Single source of truth: every tunable + its docs
  engine.js     Pure Pong physics (no DOM) - fully unit-tested
  raster.js     State → one grid of cells (the DRY core)
  renderer.js   Grid → canvas (favicon + mobile preview)
  ascii.js      Grid → terminal ASCII
  favicon.js    Push a canvas frame into the tab icon
  input.js      Page scroll / swipe → paddle movement
  checks.js     Assertions shared by Vitest and the on-page self-test
  page.js       Render the self-test panel and the code viewer
  main.js       Browser entry point
  cli.js        Headless, AI-drivable command interface
  style.css     The page's phosphor-terminal styling
bin/pong.js     Executable CLI wrapper
test/           Vitest specs (engine checks + CLI)
```

## 🌐 Browser support

Works in current **Chrome, Edge and Safari**, desktop and mobile. The favicon trick uses
`canvas.toDataURL()` plus a swappable `<link rel="icon">`. Phones don't show tab icons,
so the page renders the styled tab-preview instead.

## 🚢 Deployment

Hosted on **Cloudflare Pages** at
[pong-in-a-favicon.franzai.com](https://pong-in-a-favicon.franzai.com/). Every push to
`main` runs lint + typecheck + tests + build, then deploys `dist/`. See
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

## 📜 License

[MIT](LICENSE) © Franz Enzenhofer
