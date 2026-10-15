# Arithmos — Research Desk for Number Theory & PQC

A single-file dashboard (`index.html`) for researchers, PhD students and faculty working in
computational, analytic and algebraic number theory, cryptography and post-quantum cryptography.

Open `index.html` directly in a browser; no build step or server is needed. Libraries load from
CDNs (Tailwind CSS browser build, Alpine.js, KaTeX, marked, highlight.js), so the first load needs
a network connection.

## Modules

| Module | What it does |
|---|---|
| **Research Domains Hub** | Five domains (Computational NT, Cryptography, Post-Quantum, Analytic NT, Algebraic NT), each with core topics, a LaTeX cheat sheet (rendered formula + copyable source) and open research questions with their status. |
| **arXiv Gateway** | Keyword feed builder (add/remove tags) driving a **simulated** paper feed with skeleton loading, relevance/date sorting, domain filter, infinite scroll, a reader view, BibTeX and "Send to Gemini". All entries are synthetic and labelled as such. |
| **Notes Vault** | Markdown + LaTeX editor with live preview (split / edit / preview), snippet inserter, syntax-highlighted code blocks, auto-save to `localStorage`, and `.md` / `.tex` export. |
| **Exam Prep** | Qualifying-exam problems by domain, PhD admission interview questions, postdoc scenarios and simulated job postings, each with difficulty, domain tag, references and a collapsible outline solution. |
| **Gemini Scholar** | Collapsible assistant sidebar with note / abstract context loading, seven quick-prompt buttons, LaTeX and code rendering, timestamps, copy buttons and a typing indicator. Responses come from an **offline** knowledge base; no API key or model call is involved. |

## Keyboard shortcuts

`Alt+1`–`Alt+4` switch modules · `Alt+G` toggles the assistant · `Alt+B` toggles navigation ·
`/` focuses the chat · `?` shows all shortcuts · `Esc` closes dialogs, menus and drawers.

## Data and privacy

Notes and tracked keywords are stored only in the browser's `localStorage`. Nothing is sent to
arXiv or to any AI service.
