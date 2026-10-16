/** Shared content model. Every mathematical string is Markdown + LaTeX. */

export type DomainId = 'cnt' | 'crypto' | 'pqc' | 'ant' | 'algnt';
export type TopicId = 'zeta' | 'elliptic' | 'lattice' | 'isogeny' | 'algebraic' | 'factoring';
export type Intent = 'simplify' | 'code' | 'intuition' | 'security' | 'papers' | 'lean' | 'overview';
export type QuestionStatus = 'Open problem' | 'Conjecture' | 'Active research';

export interface DomainTopic {
  title: string;
  md: string;
}

export interface CheatEntry {
  label: string;
  tex: string;
}

export interface OpenQuestion {
  title: string;
  status: QuestionStatus;
  md: string;
}

export interface Domain {
  id: DomainId;
  name: string;
  short: string;
  glyph: string;
  /** Accent colour tuned for the dark theme; the light theme darkens it with color-mix. */
  color: string;
  tint: string;
  /** Knowledge-base topic Gemini Scholar falls back to inside this domain. */
  topic: TopicId;
  summary: string;
  topics: DomainTopic[];
  cheat: CheatEntry[];
  questions: OpenQuestion[];
}

export interface Paper {
  id: string;
  date: string;
  domain: DomainId;
  cats: string[];
  title: string;
  authors: string[];
  keywords: string[];
  abstract: string;
  result: string;
  context: string;
  /** True for entries the feed simulator synthesizes for unmatched keywords. */
  generated?: boolean;
}

/** A paper as shown in the feed, with its keyword relevance. */
export interface FeedPaper extends Paper {
  matched: string[];
  score: number;
}

export interface SynthTemplate {
  title: string;
  abstract: string;
  result: string;
}

export type ExamCategoryId = 'qual' | 'admission' | 'postdoc' | 'jobs';

export interface ExamCategory {
  id: ExamCategoryId;
  label: string;
  blurb: string;
}

export interface ExamItem {
  id: string;
  cat: ExamCategoryId;
  domain: DomainId;
  /** 1 (warm-up) … 5 (research-level). */
  difficulty: 1 | 2 | 3 | 4 | 5;
  title: string;
  org?: string;
  statement: string;
  outline: string;
  refs: string[];
}

export interface QuickAction {
  emoji: string;
  label: string;
  intent: Intent;
}

export type KBEntry = { name: string } & Record<Intent, string>;

export interface SeedChat {
  role: 'user' | 'assistant';
  md?: string;
  topic?: TopicId;
  intent?: Intent;
  /** Minutes before app start, for the seeded timestamps. */
  ago: number;
}
