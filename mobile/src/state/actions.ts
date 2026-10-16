/* Cross-tab workflows: hand context from any screen to Gemini Scholar. */
import { chat, draftStore } from './chat';
import { nav } from './nav';
import { toast } from './toast';
import type { ChatContext } from '../lib/scholar';
import type { Domain, Paper } from '../content/types';
import type { Note } from '../content/seedNotes';

export function askScholar(context: ChatContext, prompt?: string, note?: string) {
  chat.setContext(context);
  if (prompt !== undefined) draftStore.set(prompt);
  nav.open('scholar');
  toast(note ?? 'Context attached: ' + context.label, 'ok');
}

export const paperContext = (p: Paper): ChatContext => ({
  kind: 'paper',
  label: 'arXiv:' + p.id + ' — ' + p.title,
  text: '# ' + p.title + '\n\n' + p.abstract + '\n\n' + p.result
});

export const noteContext = (n: Note): ChatContext => ({ kind: 'note', label: n.title, text: n.body });

export const domainContext = (d: Domain): ChatContext => ({
  kind: 'domain',
  label: d.name,
  text: d.summary + '\n\n' + d.topics.map(t => '## ' + t.title + '\n' + t.md).join('\n\n')
});

export function sendPaperToScholar(p: Paper) {
  askScholar(paperContext(p), undefined, 'Attached abstract of arXiv:' + p.id);
}
