import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDown, ArrowUp, BookOpenText, Copy, Eraser, FileText, MoreHorizontal, Newspaper, Sparkles, X } from 'lucide-react';
import { Screen } from '../../components/Screen';
import { IconButton, Pressable } from '../../components/ui/Pressable';
import { ActionSheet, OptionList, Sheet } from '../../components/ui/Sheet';
import { Markdown, InlineMd } from '../../components/Markdown';
import { QUICK_ACTIONS } from '../../content/scholar';
import { DOMAINS } from '../../content/domains';
import { useStore } from '../../lib/store';
import { nowTime } from '../../lib/format';
import { plainTitle } from '../../lib/markdown';
import { CONTEXT_LABELS } from '../../lib/scholar';
import { findPaper } from '../../lib/feed';
import { chat, chatStore, draftStore, typingStore, type ChatMessage } from '../../state/chat';
import { progressStore } from '../../state/progress';
import { notesStore, sortNotes } from '../../state/notes';
import { feedStore, keywordStore } from '../../state/feed';
import { noteContext, paperContext } from '../../state/actions';
import { copyText, toast } from '../../state/toast';

/** Gemini Scholar: context-aware research chat (offline simulation). */
export default function ScholarScreen() {
  const { messages, context } = useStore(chatStore);
  const typing = useStore(typingStore);
  const draft = useStore(draftStore);
  const lastDomain = useStore(progressStore, p => p.lastDomain);
  const scrollRef = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const [atBottom, setAtBottom] = useState(true);
  const [menu, setMenu] = useState(false);
  const [picker, setPicker] = useState<'note' | 'paper' | null>(null);
  const fallbackTopic = (DOMAINS.find(d => d.id === lastDomain) ?? DOMAINS[3]).topic;

  const scrollToBottom = (smooth = true) =>
    requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (el) el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
    });

  // Start at the latest message; follow new messages while the reader is at the bottom.
  useEffect(() => {
    scrollToBottom(false);
  }, []);
  useEffect(() => {
    if (atBottom) scrollToBottom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length, typing]);

  // Auto-grow the composer up to ~5 lines.
  useLayoutEffect(() => {
    const el = input.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 132) + 'px';
  }, [draft]);

  const send = (text = draft, intent?: (typeof QUICK_ACTIONS)[number]['intent']) => {
    if (chat.send(text, fallbackTopic, intent)) {
      if (text === draft) draftStore.set('');
      setAtBottom(true);
      scrollToBottom();
    }
  };

  const quick = (a: (typeof QUICK_ACTIONS)[number]) => {
    const target = context ? ' (' + CONTEXT_LABELS[context.kind].toLowerCase() + ': ' + context.label + ')' : '';
    send(a.emoji + ' ' + a.label + target, a.intent);
  };

  return (
    <Screen
      title="Gemini Scholar"
      scrollRef={scrollRef}
      onScroll={el => setAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 80)}
      actions={
        <IconButton label="Chat options" onClick={() => setMenu(true)}>
          <MoreHorizontal size={22} />
        </IconButton>
      }
      pinned={<ContextBar onPick={setPicker} />}
      footer={
        <div className="pt-2">
          <div className="hscroll flex gap-2 px-3 pb-2" role="toolbar" aria-label="Quick prompts">
            {QUICK_ACTIONS.map(a => (
              <Pressable
                key={a.intent}
                onClick={() => quick(a)}
                disabled={typing}
                pressScale={0.94}
                className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-line bg-surface px-3 text-[13px] font-medium text-ink-2 disabled:opacity-50"
              >
                <span aria-hidden>{a.emoji}</span>
                {a.label}
              </Pressable>
            ))}
          </div>
          <form
            className="flex items-end gap-2 px-3 pb-2"
            onSubmit={e => {
              e.preventDefault();
              send();
            }}
          >
            <textarea
              ref={input}
              value={draft}
              onChange={e => draftStore.set(e.target.value)}
              onKeyDown={e => {
                // Enter sends on hardware keyboards; Shift+Enter and IME composition insert a newline.
                if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing && e.keyCode !== 229 && window.matchMedia('(hover: hover)').matches) {
                  e.preventDefault();
                  send();
                }
              }}
              rows={1}
              placeholder={context ? 'Ask about the attached ' + CONTEXT_LABELS[context.kind].toLowerCase() + '…' : 'Ask about a theorem, proof or paper…'}
              aria-label="Message Gemini Scholar"
              enterKeyHint="send"
              className="max-h-[132px] min-h-11 flex-1 resize-none rounded-[22px] border border-line bg-surface px-4 py-[10px] text-ink outline-none placeholder:text-ink-3 focus:border-latex-ink"
            />
            <Pressable
              type="submit"
              aria-label="Send message"
              disabled={typing || !draft.trim()}
              haptic
              pressScale={0.88}
              className="mb-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-latex text-white disabled:opacity-40"
            >
              <ArrowUp size={20} strokeWidth={2.5} />
            </Pressable>
          </form>
        </div>
      }
    >
      <div className="flex flex-col gap-4 pb-2 pt-3" role="log" aria-live="polite" aria-label="Conversation">
        {messages.map(m => (
          <Message key={m.id} m={m} />
        ))}
        <AnimatePresence>
          {typing && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2" aria-label="Scholar is typing">
              <Avatar />
              <div className="flex gap-1 rounded-2xl bg-surface px-4 py-3">
                {[0, 1, 2].map(i => (
                  <span key={i} className="typing-dot h-2 w-2 rounded-full bg-ink-3" style={{ animationDelay: i * 0.15 + 's' }} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {!atBottom && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="sticky bottom-3 z-10 flex justify-center">
            <Pressable aria-label="Scroll to latest message" onClick={() => scrollToBottom()} className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface-3 text-ink shadow-e2">
              <ArrowDown size={19} />
            </Pressable>
          </motion.div>
        )}
      </AnimatePresence>

      <ActionSheet
        open={menu}
        onClose={() => setMenu(false)}
        title="Gemini Scholar"
        actions={[
          { label: 'Clear conversation', icon: <Eraser size={19} />, destructive: true, run: () => chat.clear() },
          ...(context ? [{ label: 'Remove attached context', icon: <X size={19} />, run: () => { chat.setContext(null); toast('Context cleared'); } }] : [])
        ]}
      />
      <ContextPicker kind={picker} onClose={() => setPicker(null)} />
    </Screen>
  );
}

function Avatar() {
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-latex to-sage text-white" aria-hidden>
      <Sparkles size={16} />
    </span>
  );
}

function Message({ m }: { m: ChatMessage }) {
  if (m.role === 'user') {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 420, damping: 32 }} className="flex flex-col items-end">
        <div className="bubble-user max-w-[85%] rounded-[20px] rounded-br-md bg-latex px-4 py-2.5">
          <Markdown src={m.md} className="md-compact" />
        </div>
        <span className="mt-1 pr-1 text-[11px] text-ink-3">{nowTime(m.time)}</span>
      </motion.div>
    );
  }
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 420, damping: 32 }} className="flex flex-col">
      <div className="mb-1.5 flex items-center gap-2">
        <Avatar />
        <span className="text-[13px] font-semibold text-ink">Scholar</span>
        <span className="text-[11px] text-ink-3">{nowTime(m.time)}</span>
        <IconButton label="Copy message" className="ml-auto !h-9 !w-9" onClick={() => copyText(m.md.replace(/<span class="sim-note">[\s\S]*?<\/span>/, '').trim(), 'Message copied')}>
          <Copy size={15} />
        </IconButton>
      </div>
      <div className="rounded-[20px] rounded-tl-md border border-line bg-surface px-4 py-3">
        <Markdown src={m.md} className="text-[15px]" />
      </div>
    </motion.div>
  );
}

function ContextBar({ onPick }: { onPick: (k: 'note' | 'paper') => void }) {
  const context = useStore(chatStore, s => s.context);
  return (
    <div className="px-4 py-2">
      {context ? (
        <div className="flex items-center gap-2 rounded-2xl bg-latex/40 py-1.5 pl-3 pr-1">
          {context.kind === 'paper' ? <Newspaper size={16} className="shrink-0 text-latex-ink" /> : <FileText size={16} className="shrink-0 text-latex-ink" />}
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-latex-ink">
              {CONTEXT_LABELS[context.kind]} · {context.text.length.toLocaleString()} chars
            </div>
            <InlineMd src={context.label} className="block truncate text-[13.5px] text-ink" />
          </div>
          <IconButton
            label="Clear context"
            className="!h-9 !w-9"
            onClick={() => {
              chat.setContext(null);
              toast('Context cleared');
            }}
          >
            <X size={17} />
          </IconButton>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <Pressable onClick={() => onPick('note')} className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-surface-2 px-2 text-[13.5px] font-semibold text-ink">
            <BookOpenText size={16} className="text-latex-ink" /> Load note
          </Pressable>
          <Pressable onClick={() => onPick('paper')} className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-surface-2 px-2 text-[13.5px] font-semibold text-ink">
            <Newspaper size={16} className="text-latex-ink" /> Attach abstract
          </Pressable>
        </div>
      )}
    </div>
  );
}

/** Pick a note or an arXiv abstract to attach as chat context. */
function ContextPicker({ kind, onClose }: { kind: 'note' | 'paper' | null; onClose: () => void }) {
  const notes = useStore(notesStore);
  const feed = useStore(feedStore, s => s.list);
  const read = useStore(progressStore, p => p.read);
  const saved = useStore(progressStore, p => p.saved);
  const keywords = useStore(keywordStore);

  const noteOptions = sortNotes(notes).map((n, i) => ({
    label: plainTitle(n.title),
    icon: <FileText size={18} />,
    run: () => {
      chat.setContext(noteContext(n));
      toast((i === 0 ? 'Loaded most recent note' : 'Loaded note') + ' (' + n.body.length.toLocaleString() + ' chars)', 'ok');
    }
  }));

  // Recently read and saved papers first, then the current feed.
  const ids = [...new Set([...read.slice().reverse(), ...saved, ...feed.map(p => p.id)])].slice(0, 12);
  const paperOptions = ids
    .map(id => findPaper(id, keywords))
    .filter(Boolean)
    .map(p => ({
      label: 'arXiv:' + p!.id + ' — ' + p!.title,
      icon: <Newspaper size={18} />,
      run: () => {
        chat.setContext(paperContext(p!));
        toast('Attached abstract of arXiv:' + p!.id, 'ok');
      }
    }));

  return (
    <Sheet open={!!kind} onClose={onClose} title={kind === 'note' ? 'Load a note as context' : 'Attach an arXiv abstract'}>
      <OptionList
        options={kind === 'note' ? noteOptions : paperOptions}
        onPick={a => {
          onClose();
          a.run();
        }}
      />
      {kind === 'paper' && !paperOptions.length && <p className="p-4 text-center text-[14px] text-ink-3">The feed is still loading. Try again in a moment.</p>}
    </Sheet>
  );
}
