/*
 * Offline "Gemini Scholar" responder. No API key and no network: the topic is
 * detected from the prompt plus the attached context, the intent from the
 * quick action or the wording, and the answer is assembled from the built-in
 * knowledge base (content/scholar.ts).
 */
import { INTENT_PATTERNS, KB, TOPIC_PATTERNS } from '../content/scholar';
import type { Intent, TopicId } from '../content/types';

export type ContextKind = 'note' | 'paper' | 'question' | 'domain' | 'theorem';

export interface ChatContext {
  kind: ContextKind;
  label: string;
  text: string;
}

export const CONTEXT_LABELS: Record<ContextKind, string> = {
  note: 'Note',
  paper: 'arXiv abstract',
  question: 'Exam question',
  domain: 'Domain',
  theorem: 'Open question'
};

export function detectTopic(prompt: string, ctxText: string, fallback: TopicId): TopicId {
  let best: TopicId | null = null;
  let bestScore = 0;
  for (const [id, re] of TOPIC_PATTERNS) {
    const score = 3 * (prompt.match(re) || []).length + (ctxText.match(re) || []).length;
    if (score > bestScore) {
      best = id;
      bestScore = score;
    }
  }
  return best || fallback;
}

export function detectIntent(prompt: string): Intent {
  for (const [id, re] of INTENT_PATTERNS) if (re.test(prompt)) return id;
  return 'overview';
}

function firstFormula(text: string): string | null {
  const m = text.match(/\$\$([\s\S]+?)\$\$/) || text.match(/\$([^$\n]{8,160})\$/);
  return m && m[1].trim().length < 400 ? m[1].trim() : null;
}

export function compose(prompt: string, intent: Intent | undefined, context: ChatContext | null, fallbackTopic: TopicId): string {
  const ctxText = context ? context.text : '';
  const topic = detectTopic(prompt, ctxText, fallbackTopic);
  const kind = intent || detectIntent(prompt);
  let out = '';
  if (context) {
    out +=
      '**Context used:** ' + CONTEXT_LABELS[context.kind] + ' · *' + context.label.replace(/[*_]/g, '') + '* (' +
      context.text.length.toLocaleString() + ' characters).';
    const f = firstFormula(ctxText);
    if (f) out += ' Anchoring on\n$$' + f + '$$\n';
    out += '\n\n';
  }
  out += KB[topic][kind] || KB[topic].overview;
  out += '\n\n<span class="sim-note">Offline simulation · topic: ' + KB[topic].name + ' · mode: ' + kind + '</span>';
  return out;
}

/** Simulated "thinking" time, longer for longer answers. */
export const replyDelay = (reply: string) => 700 + Math.min(1300, reply.length / 4);
