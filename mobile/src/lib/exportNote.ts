import type { Note } from '../content/seedNotes';
import { slug } from './format';

export function download(filename: string, text: string, mime: string) {
  const url = URL.createObjectURL(new Blob([text], { type: mime }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Share through the OS share sheet when available (iOS/Android), else download. */
export async function shareOrDownload(filename: string, text: string, mime: string): Promise<'shared' | 'downloaded' | 'cancelled'> {
  try {
    const file = new File([text], filename, { type: mime });
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: filename });
      return 'shared';
    }
  } catch (err) {
    if ((err as DOMException)?.name === 'AbortError') return 'cancelled';
  }
  download(filename, text, mime);
  return 'downloaded';
}

const GREEK: Record<string, string> = {
  α: 'alpha', β: 'beta', γ: 'gamma', δ: 'delta', ε: 'varepsilon', ζ: 'zeta', η: 'eta', θ: 'theta', κ: 'kappa',
  λ: 'lambda', μ: 'mu', ν: 'nu', ξ: 'xi', π: 'pi', ρ: 'rho', σ: 'sigma', τ: 'tau', φ: 'varphi', χ: 'chi', ψ: 'psi',
  ω: 'omega', Γ: 'Gamma', Δ: 'Delta', Θ: 'Theta', Λ: 'Lambda', Ξ: 'Xi', Π: 'Pi', Σ: 'Sigma', Φ: 'Phi', Ψ: 'Psi', Ω: 'Omega'
};

/** Convert a note to a compilable amsart document (headings, bold and code converted; math passes through). */
export function noteToTex(n: Note): string {
  const verb: string[] = [];
  const body = n.body
    // Lift code blocks out first so "# comment", "**" and ">" inside code are left alone.
    .replace(/```(\w*)\n([\s\S]*?)```/g, (_, _lang, code) => '\u0000' + (verb.push('\\begin{verbatim}\n' + code + '\\end{verbatim}') - 1) + '\u0000')
    .replace(/^### (.*)$/gm, '\\subsubsection*{$1}')
    .replace(/^## (.*)$/gm, '\\subsection*{$1}')
    .replace(/^# (.*)$/gm, '\\section*{$1}')
    .replace(/\*\*(.+?)\*\*/g, '\\textbf{$1}')
    .replace(/^> ?/gm, '')
    .replace(/\u0000(\d+)\u0000/g, (_, i) => verb[+i]);
  // Inline math in the title passes through; everything else is escaped.
  const title = n.title
    .split(/(\$[^$]+\$)/)
    .map((part, i) =>
      i % 2
        ? part
        : part
            .replace(/[\\{}&%#_$^~]/g, c => ({ '\\': '\\textbackslash{}', '^': '\\textasciicircum{}', '~': '\\textasciitilde{}' })[c] || '\\' + c)
            .replace(/[\u0370-\u03FF]/g, c => (GREEK[c] ? '$\\' + GREEK[c] + '$' : c))
    )
    .join('');
  return (
    '\\documentclass[11pt]{amsart}\n\\usepackage{amssymb,amsmath}\n\\title{' + title +
    '}\n\\begin{document}\n\\maketitle\n' + body + '\n\\end{document}\n'
  );
}

export const noteFilename = (n: Note, ext: string) => slug(n.title) + '.' + ext;
