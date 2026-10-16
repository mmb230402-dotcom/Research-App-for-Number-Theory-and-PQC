/*
 * Markdown + KaTeX + highlight.js rendering, ported from the desktop build.
 * Math is lifted out before Markdown parsing (so "_" and "*" inside TeX are
 * never touched), the Markdown HTML is sanitized in an inert <template>, and
 * the rendered KaTeX is spliced back in.
 */
import katex from 'katex';
import { marked } from 'marked';
import hljs from 'highlight.js/lib/core';
import python from 'highlight.js/lib/languages/python';
import bash from 'highlight.js/lib/languages/bash';
import javascript from 'highlight.js/lib/languages/javascript';
import cpp from 'highlight.js/lib/languages/cpp';
import latex from 'highlight.js/lib/languages/latex';
import plaintext from 'highlight.js/lib/languages/plaintext';

hljs.registerLanguage('python', python);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('cpp', cpp);
hljs.registerLanguage('latex', latex);
hljs.registerLanguage('plaintext', plaintext);

marked.use({ gfm: true, breaks: false });

const KATEX_MACROS = {
  '\\N': '\\mathbb{N}', '\\Z': '\\mathbb{Z}', '\\Q': '\\mathbb{Q}',
  '\\R': '\\mathbb{R}', '\\C': '\\mathbb{C}', '\\F': '\\mathbb{F}'
};
const MD_CACHE = new Map<string, string>();
const MD_CACHE_LIMIT = 600;
const MATH_RE = /(```[\s\S]*?```|~~~[\s\S]*?~~~|`[^`\n]+`)|\$\$([\s\S]+?)\$\$|\\\[([\s\S]+?)\\\]|\\\(([\s\S]+?)\\\)|(?<!\\)\$(?!\s)((?:\\\$|[^$\n])+?)(?<![\s\\])\$(?!\d)/g;
const CODE_LANG_ALIASES: Record<string, string> = {
  sage: 'python', sagemath: 'python', py: 'python', gp: 'plaintext', pari: 'plaintext',
  lean: 'plaintext', lean4: 'plaintext', tex: 'latex', sh: 'bash'
};

export function escapeHtml(s: string): string {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

/** Render a TeX string with KaTeX; never throws. */
export function tex(src: string, display = true): string {
  try {
    return katex.renderToString(src, {
      displayMode: display, throwOnError: false, strict: 'ignore', trust: false,
      macros: { ...KATEX_MACROS }, output: 'htmlAndMathml'
    });
  } catch (err) {
    return '<span class="katex-error" title="' + escapeHtml((err as Error).message) + '">' + escapeHtml(src) + '</span>';
  }
}

/** Sanitize Markdown output and decorate code blocks. Runs on an inert template. */
function postProcess(html: string): string {
  const tpl = document.createElement('template');
  tpl.innerHTML = html;
  const root = tpl.content;
  root.querySelectorAll('script,style,iframe,object,embed,link,meta,form,base,set,animate').forEach(el => el.remove());
  root.querySelectorAll('*').forEach(el => {
    for (const attr of [...el.attributes]) {
      const name = attr.name.toLowerCase();
      // URL parsers ignore ASCII tabs/newlines/controls ("java&#9;script:"), and SVG links use xlink:href.
      const url = /(^|:)(href|src|action|formaction)$/.test(name) && attr.value.replace(/[\u0000- ]/g, '');
      if (name.startsWith('on') || (url && /^(javascript|data|vbscript):/i.test(url))) el.removeAttribute(attr.name);
    }
    if (el.localName === 'a') {
      el.setAttribute('target', '_blank');
      el.setAttribute('rel', 'noopener noreferrer');
    }
  });
  root.querySelectorAll('pre > code').forEach(code => {
    const raw = (code.className.match(/language-([\w+#-]+)/) || [])[1] || '';
    const lang = CODE_LANG_ALIASES[raw.toLowerCase()] || raw.toLowerCase();
    const text = code.textContent || '';
    if (lang && hljs.getLanguage(lang)) {
      code.innerHTML = hljs.highlight(text, { language: lang, ignoreIllegals: true }).value;
    } else if (!raw) {
      code.innerHTML = hljs.highlightAuto(text, ['python', 'bash', 'javascript', 'cpp']).value;
    }
    code.classList.add('hljs');
    const pre = code.parentElement!;
    const wrap = document.createElement('div');
    wrap.className = 'codeblock';
    wrap.innerHTML =
      '<div class="codeblock-bar"><span>' + escapeHtml(raw || 'code') + '</span>' +
      '<button type="button" class="code-copy" aria-label="Copy code">Copy</button></div>';
    pre.replaceWith(wrap);
    wrap.appendChild(pre);
  });
  root.querySelectorAll('table').forEach(t => {
    const wrap = document.createElement('div');
    wrap.className = 'table-wrap';
    t.replaceWith(wrap);
    wrap.appendChild(t);
  });
  return tpl.innerHTML;
}

/** Markdown + LaTeX → safe HTML (memoized). */
export function md(src: string | null | undefined): string {
  if (src == null) return '';
  src = String(src);
  const hit = MD_CACHE.get(src);
  if (hit !== undefined) return hit;
  const math: string[] = [];
  const text = src.replace(MATH_RE, (_m, code, dd, br, pr, d) => {
    if (code) return code;
    const display = dd !== undefined || br !== undefined;
    math.push(tex((dd ?? br ?? pr ?? d).trim(), display));
    return '%%KTX' + (math.length - 1) + '%%';
  });
  let html: string;
  try {
    html = marked.parse(text, { async: false }) as string;
  } catch {
    html = '<pre>' + escapeHtml(text) + '</pre>';
  }
  // A placeholder inside a tag (image alt, link title) gets the escaped TeX source instead of KaTeX markup.
  html = postProcess(html)
    .replace(/%%KTX(\d+)%%(?=[^<>]*>)/g, (_, i) => (math[+i].match(/<annotation encoding="application\/x-tex">([\s\S]*?)<\/annotation>/) || [, ''])[1]!)
    .replace(/%%KTX(\d+)%%/g, (_, i) => math[+i]);
  // Note bodies change on every keystroke and render to 100+ KB each; caching those only grows memory.
  if (src.length <= 3000) {
    if (MD_CACHE.size > MD_CACHE_LIMIT) MD_CACHE.clear();
    MD_CACHE.set(src, html);
  }
  return html;
}

/** Inline variant: drops the wrapping paragraph. */
export function mdInline(src: string): string {
  return md(src).replace(/^\s*<p>([\s\S]*)<\/p>\s*$/, '$1');
}

/** Shorten Markdown/LaTeX without splitting an inline formula. */
export function previewText(s: string, n = 200): string {
  if (s.length <= n) return s;
  let cut = s.slice(0, n).replace(/\s+\S*$/, '');
  let dollars = 0;
  for (let i = 0; i < cut.length; i++) if (cut[i] === '$' && cut[i - 1] !== '\\') dollars++;
  if (dollars % 2 === 1) {
    const close = s.indexOf('$', cut.length);
    cut = close === -1 ? cut.slice(0, cut.lastIndexOf('$')) : s.slice(0, close + 1);
  }
  return cut.trimEnd() + ' …';
}

/** First paragraph of a summary, without any display formula. */
export function leadText(s: string, n = 150): string {
  return previewText(s.split('$$')[0].replace(/[:,]\s*$/, '.').trim(), n);
}

/**
 * One-paragraph Markdown excerpt of a note for list rows: drops the title,
 * code blocks, display math, tables and block markers, keeps inline math.
 */
export function noteExcerpt(body: string, n = 140): string {
  const t = body
    .replace(/```[\s\S]*?```|~~~[\s\S]*?~~~/g, ' ')
    .replace(/\$\$[\s\S]*?\$\$/g, ' ')
    .replace(/^\s*#\s.*$/m, '')
    .replace(/^\s*\|.*$/gm, '')
    .replace(/^\s*(#{1,6}|>|[-*+]|\d+\.)\s+/gm, '')
    .replace(/\*\*|__/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return previewText(t, n);
}

export function noteStats(body: string) {
  const display = (body.match(/\$\$[\s\S]+?\$\$/g) || []).length;
  const inline = (body.replace(/\$\$[\s\S]+?\$\$/g, '').match(/\$[^$\n]+\$/g) || []).length;
  return { words: (body.trim().match(/\S+/g) || []).length, chars: body.length, formulas: display + inline };
}

const TEX_SYMBOLS: Record<string, string> = {
  alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ', varepsilon: 'ε', epsilon: 'ε', zeta: 'ζ', eta: 'η', theta: 'θ', kappa: 'κ',
  lambda: 'λ', mu: 'μ', nu: 'ν', xi: 'ξ', pi: 'π', rho: 'ρ', sigma: 'σ', tau: 'τ', varphi: 'φ', phi: 'φ', chi: 'χ', psi: 'ψ',
  omega: 'ω', Gamma: 'Γ', Delta: 'Δ', Lambda: 'Λ', Sigma: 'Σ', Phi: 'Φ', Psi: 'Ψ', Omega: 'Ω', infty: '∞', le: '≤', ge: '≥',
  leq: '≤', geq: '≥', neq: '≠', equiv: '≡', to: '→', times: '×', cdot: '·', sqrt: '√', sum: 'Σ', prod: 'Π', in: '∈'
};
const BLACKBOARD: Record<string, string> = { N: 'ℕ', Z: 'ℤ', Q: 'ℚ', R: 'ℝ', C: 'ℂ', F: '𝔽', P: 'ℙ' };

/** Inline TeX → readable plain text (for bar titles, filenames and accessibility labels). */
export function plainTitle(s: string): string {
  return s
    .replace(/\$([^$]+)\$/g, (_, t: string) =>
      t
        .replace(/\\mathbb\{(\w)\}/g, (_m, c: string) => BLACKBOARD[c] ?? c)
        .replace(/\\(?:mathcal|mathfrak|mathrm|operatorname|mathbf|text)\{([^}]*)\}/g, '$1')
        .replace(/\\([a-zA-Z]+)/g, (_m, c: string) => TEX_SYMBOLS[c] ?? '')
        .replace(/[{}^_]/g, '')
    )
    .replace(/\s+/g, ' ')
    .trim();
}
