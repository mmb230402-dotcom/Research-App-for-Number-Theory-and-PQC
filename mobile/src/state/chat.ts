import { createStore, isObj } from '../lib/store';
import { KB, SEED_CHAT } from '../content/scholar';
import type { Intent, TopicId } from '../content/types';
import { compose, replyDelay, type ChatContext } from '../lib/scholar';
import { toast } from './toast';
import { typingStore } from './typing';

export { typingStore };

export interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  md: string;
  time: number;
}

interface ChatState {
  messages: ChatMessage[];
  context: ChatContext | null;
}

function seed(): ChatState {
  const base = Date.now();
  return {
    messages: SEED_CHAT.map((m, i) => ({
      id: i + 1,
      role: m.role,
      md: m.md || KB[m.topic!][m.intent!],
      time: base - m.ago * 60000
    })),
    context: null
  };
}

export const chatStore = createStore<ChatState>(seed, {
  key: 'arithmos.m.chat.v1',
  validate: (v): v is ChatState => isObj(v) && Array.isArray(v.messages) && v.messages.every(m => isObj(m) && typeof m.md === 'string')
});


const MAX_MESSAGES = 80;
let seq = Math.max(0, ...chatStore.get().messages.map(m => m.id));
let generation = 0;

function push(role: ChatMessage['role'], md: string) {
  chatStore.set(s => ({ ...s, messages: [...s.messages, { id: ++seq, role, md, time: Date.now() }].slice(-MAX_MESSAGES) }));
}

export const chat = {
  setContext(context: ChatContext | null) {
    chatStore.set(s => ({ ...s, context }));
  },
  /** Returns false if the message was rejected. */
  send(text: string, fallbackTopic: TopicId, intent?: Intent): boolean {
    const msg = text.trim();
    if (typingStore.get()) return false;
    if (!msg) {
      toast('Type a message first', 'error');
      return false;
    }
    if (msg.length > 4000) {
      toast('Messages are limited to 4,000 characters', 'error');
      return false;
    }
    push('user', msg);
    typingStore.set(true);
    const reply = compose(msg, intent, chatStore.get().context, fallbackTopic);
    const g = generation;
    setTimeout(() => {
      typingStore.set(false);
      if (g !== generation) return; // the conversation was cleared while the reply was pending
      push('assistant', reply);
    }, replyDelay(reply));
    return true;
  },
  clear() {
    generation++;
    typingStore.set(false);
    chatStore.set(s => ({
      ...s,
      messages: [{ id: ++seq, role: 'assistant', time: Date.now(), md: 'Conversation cleared. Attach a note or an arXiv abstract for context, or use a quick prompt below.' }]
    }));
  },
  reset() {
    generation++;
    typingStore.set(false);
    const s = seed();
    seq = s.messages.length;
    chatStore.set(s);
  }
};

/** Composer draft, so other screens can prefill a prompt before switching to Scholar. */
export const draftStore = createStore('');
