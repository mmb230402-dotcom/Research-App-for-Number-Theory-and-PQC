import lecture from './notes/lecture-9.md?raw';
import seminar from './notes/seminar-mlkem.md?raw';

export interface Note {
  id: string;
  title: string;
  body: string;
  updated: number;
  pinned?: boolean;
}

export const NEW_NOTE_BODY = String.raw`# Untitled note

Inline math such as $\mathcal{O}_K$ and display math render live:

$$\zeta_K(s)=\sum_{\mathfrak{a}\subseteq\mathcal{O}_K}\frac{1}{N(\mathfrak{a})^{s}}$$
`;

/** Title from the first Markdown heading, else the first line; inline math is kept for rendering. */
export function deriveTitle(body: string): string {
  const h = body.match(/^\s*#\s+(.+)$/m);
  const line = (h ? h[1] : body.split('\n').find(l => l.trim()) || '').replace(/^[#>*\-\s]+/, '').replace(/\*\*|__/g, '').trim();
  return line.slice(0, 90) || 'Untitled note';
}

export function seedNotes(now = Date.now()): Note[] {
  return [
    { id: 'n-lecture', title: deriveTitle(lecture), body: lecture, updated: now, pinned: true },
    { id: 'n-seminar', title: deriveTitle(seminar), body: seminar, updated: now - 864e5 }
  ];
}

/** LaTeX snippets for the formula keyboard bar above the editor. */
export const SNIPPETS: { label: string; ins: string; caret?: number }[] = [
  { label: '$x$', ins: '$$', caret: 1 },
  { label: '$$ block', ins: '\n$$\n\n$$\n', caret: 4 },
  { label: '\\frac', ins: '\\frac{}{}', caret: 6 },
  { label: '\\sum', ins: '\\sum_{n=1}^{\\infty} ' },
  { label: '\\prod', ins: '\\prod_{p} ' },
  { label: '\\int', ins: '\\int_{0}^{\\infty} f(t)\\,dt' },
  { label: '\\mathbb', ins: '\\mathbb{}', caret: 8 },
  { label: '\\mathcal', ins: '\\mathcal{}', caret: 9 },
  { label: '\\mathfrak', ins: '\\mathfrak{}', caret: 10 },
  { label: '\\equiv', ins: '\\equiv ' },
  { label: '\\pmod', ins: '\\pmod{}', caret: 6 },
  { label: 'Theorem', ins: '\n> **Theorem.** Statement.\n\n**Proof.** Argument. $\\blacksquare$\n' },
  { label: 'Python', ins: '\n```python\n\n```\n', caret: 11 },
  { label: 'Sage', ins: '\n```sage\nK.<a> = NumberField(x^2 + 5)\nK.class_group()\n```\n' }
];
