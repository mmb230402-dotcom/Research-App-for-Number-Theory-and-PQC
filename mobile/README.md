# Arithmos Mobile

A mobile PWA research companion for number theory and post-quantum cryptography, built for **iOS Safari** and **Android Chrome**. It is the phone counterpart of the Arithmos desktop dashboard and carries the same content: five research domains, an arXiv keyword feed, a Markdown + LaTeX notes vault, PhD qualifying-exam prep and the Scholar assistant.

Everything runs on the device. The arXiv feed and Scholar are offline simulations, and all state is kept in `localStorage`, so the app works with no account, no API key and no network after the first visit.

## Launch in one minute

Requires Node 20.19+ or 22.12+.

```bash
cd mobile
npm install
npm run dev          # http://localhost:5173 and the LAN URL printed by Vite
```

Open the **Network** URL that Vite prints on a phone on the same Wi-Fi to try it on a real device. The service worker is disabled in dev mode, so offline install is tested with a production build:

```bash
npm run build        # type-check + production bundle in dist/
npm run preview      # serves dist/ on http://localhost:4173 and the LAN
```

### Install on a phone

| Platform | Steps |
| --- | --- |
| Android, Chrome | Open the site, then tap **Install** on the card on the Hub (or ⋮ → *Install app*). |
| iOS / iPadOS, Safari | Open the site, tap **Share** → **Add to Home Screen**. The Hub card shows the same steps. |

Installation and offline caching need HTTPS (or `localhost`), so use one of the hosted options below for a phone install.

## Deploy

`npm run build` produces a static site in `dist/` (HTML, JS, CSS, web manifest, service worker). Any static host works.

| Host | Settings |
| --- | --- |
| GitHub Pages | Run the **Deploy mobile app to Pages** workflow (`.github/workflows/mobile-pages.yml`) after setting *Settings → Pages → Source* to **GitHub Actions**. The app is then served at `https://<owner>.github.io/<repo>/`. |
| Netlify | Base directory `mobile`, build command `npm run build`, publish directory `mobile/dist`. |
| Vercel | Root directory `mobile`, framework preset *Vite*, output `dist`. |
| Any other host | Upload `dist/`. No rewrite rules are needed, since the app has no URL routes. |

For a sub-path deployment, set `BASE_PATH` at build time so the manifest scope, icons and service worker resolve correctly:

```bash
BASE_PATH=/Research-App-for-Number-Theory-and-PQC/ npm run build
```

## Codebase map

```
mobile/
├── index.html                 viewport-fit=cover, iOS web-app meta, pre-paint theme script
├── vite.config.ts             React, Tailwind v4, PWA manifest + Workbox precache, BASE_PATH
├── public/icons/              app icons (any + maskable, Apple touch icon)
├── scripts/make-icons.mjs     re-renders the icons with Chromium (npm run icons)
├── tests/e2e.mjs              iPhone 13 + Pixel 7 end-to-end run (npm run test:e2e)
└── src/
    ├── main.tsx               viewport tracking, React root, service worker registration
    ├── App.tsx                platform/theme attributes, tab stacks, tab bar, toasts
    ├── index.css              design tokens (Noir + light, iOS + Material), Markdown/KaTeX styles
    ├── content/               research content: domains, papers, exam bank, Scholar KB, seed notes
    ├── lib/                   framework-free logic
    │   ├── store.ts           tiny external store (useSyncExternalStore)
    │   ├── markdown.ts        Markdown + KaTeX + highlight.js, sanitized
    │   ├── feed.ts            keyword scoring, synthetic preprint generation, BibTeX
    │   ├── scholar.ts         topic/intent detection and answer composition
    │   ├── platform.ts        iOS / Android detection, haptics
    │   ├── pwa.ts             install prompt and service worker
    │   ├── viewport.ts        visual-viewport height and on-screen keyboard detection
    │   ├── exportNote.ts      .md / .tex export through the share sheet or a download
    │   └── usePullToRefresh.ts
    ├── state/                 reactive stores, each persisted to localStorage
    │   ├── nav.ts             per-tab push/pop stacks bound to browser history
    │   ├── settings.ts        theme, interface style, haptics, profile
    │   ├── progress.ts        studied topics, exam marks, read/saved papers, streak
    │   ├── feed.ts            keywords, filters, paging, reading list
    │   ├── notes.ts           notes vault with debounced auto-save
    │   ├── chat.ts / typing.ts  Scholar conversation and context
    │   ├── actions.ts         cross-tab workflows (send paper/note to Scholar)
    │   └── toast.ts           snackbars with undo actions
    ├── navigation/            StackView (iOS swipe-back, Material transitions), lazy routes
    ├── components/            Screen (top bar, large title, footer), TabBar, Sheet (bottom sheets),
    │   └── ui/                Pressable (ripple / spring tap), cards, chips, rings, segmented, toggles
    └── screens/
        ├── hub/               Hub dashboard, research domain (overview, cheat sheet, questions)
        ├── feed/              arXiv gateway, paper card, reader
        ├── notes/             notes vault, Markdown + LaTeX editor
        ├── prep/              exam prep list, question workspace
        └── scholar/           Scholar chat
```

### How the pieces fit

- **Navigation.** Five bottom tabs (Hub, arXiv, Notes, Prep, Scholar), each with its own stack. Every push adds a browser-history entry, so the Android back button and the iOS Safari edge swipe pop screens and close sheets. On iOS a screen can also be dragged back from the left edge with the previous screen sliding in underneath; on Android screens use Material fade-and-rise transitions. Re-tapping a tab returns to its root, or scrolls to the top.
- **Platform styling.** The UI follows the device (iOS: translucent blurred bars, large collapsing titles, spring animations, SF typography; Android: opaque app bars, ripples, elevation, M3 navigation pill, Roboto). *Settings → Interface style* can force either look.
- **Reactive state.** Each store is a plain module (`createStore`) read through `useStore(store, selector)`. Stores validate what they load, persist on change and sync across tabs.
- **No dropdowns.** Every choice opens a bottom sheet with a drag handle (swipe down or tap the backdrop to close).

### Workflows

| Area | What works |
| --- | --- |
| Hub | Progress rings (topics studied, exam questions mastered, papers read), daily streak, continue cards, domain progress bars, question of the day, settings sheet. |
| Domain | Topic accordion with *Mark as studied* and *Ask Scholar*; searchable cheat sheet with rendered formulas, copy-LaTeX and source view; open questions. |
| arXiv | Keyword chips (validated, max 12, with suggestions), domain and sort filters in a sheet, pull to refresh, infinite scroll, reading list, reader with BibTeX export, *Append to notes* and *Send to Scholar*. |
| Notes | Search, swipe left to delete (with undo), swipe right to pin, editor with Edit / Preview (and Split on wide screens), LaTeX snippet bar above the keyboard, auto-save indicator, export `.md` / `.tex`. |
| Prep | Category and domain filters, mastery ring, difficulty meters, stopwatch, outline solution, *Needs review* / *Mastered it*, next question. |
| Scholar | Context bar (load a note or attach a paper abstract), quick prompts, LaTeX and code answers, copy, clear conversation. |

### Local data

| Key | Contents |
| --- | --- |
| `arithmos.m.settings.v1` | theme, interface style, haptics, name, field |
| `arithmos.m.progress.v1` | studied topics, exam marks, read and saved papers, active days |
| `arithmos.m.keywords.v1` | arXiv keywords |
| `arithmos.m.notes.v1` | notes vault |
| `arithmos.m.chat.v1` | Scholar conversation and context |

*Settings → Reset demo data* restores the seed content.

## Checks

```bash
npm run typecheck
npm run build && npm run test:e2e
```

The end-to-end run drives every tab on an iPhone 13 and a Pixel 7 profile, then reloads offline through the service worker. It fails on console errors, KaTeX errors and horizontal overflow, and writes screenshots to `test-results/`. It uses `playwright-core`; point `CHROMIUM_PATH` at a Chromium binary if Playwright's default one is not installed.
