import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { CheckCircle2, CloudOff, Download, FileCode2, FileDown, Loader2, MoreHorizontal, Pin, Sparkles, Trash2, NotebookPen } from 'lucide-react';
import { Screen } from '../../components/Screen';
import { Segmented, EmptyState } from '../../components/ui/primitives';
import { IconButton, Pressable } from '../../components/ui/Pressable';
import { ActionSheet } from '../../components/ui/Sheet';
import { Markdown } from '../../components/Markdown';
import { SNIPPETS } from '../../content/seedNotes';
import { useStore } from '../../lib/store';
import { noteStats, plainTitle } from '../../lib/markdown';
import { nowTime } from '../../lib/format';
import { noteFilename, noteToTex, shareOrDownload } from '../../lib/exportNote';
import { notes, notesStore, saveStore } from '../../state/notes';
import { askScholar, noteContext } from '../../state/actions';
import { nav } from '../../state/nav';
import { toast } from '../../state/toast';

type Mode = 'edit' | 'preview' | 'split';

/** Markdown + LaTeX editor with live preview, formula keyboard bar and auto-save. */
export default function NoteScreen({ id }: { id: string }) {
  const note = useStore(notesStore, list => list.find(n => n.id === id));
  const save = useStore(saveStore);
  const [mode, setMode] = useState<Mode>(() => (window.innerWidth >= 720 ? 'split' : 'preview'));
  const [menu, setMenu] = useState(false);
  const [wide, setWide] = useState(() => window.innerWidth >= 720);
  const ta = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const on = () => setWide(window.innerWidth >= 720);
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  useEffect(() => {
    if (!wide && mode === 'split') setMode('edit');
  }, [wide, mode]);

  // Grow the textarea with its content so the screen scroller handles scrolling.
  useLayoutEffect(() => {
    const el = ta.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.max(el.scrollHeight, 320) + 'px';
  }, [note?.body, mode]);

  if (!note) {
    return (
      <Screen title="Note">
        <EmptyState icon={<NotebookPen size={24} />} title="Note deleted" body="This note no longer exists." />
      </Screen>
    );
  }

  const stats = noteStats(note.body);
  const title = plainTitle(note.title);

  const insert = (snip: (typeof SNIPPETS)[number]) => {
    const el = ta.current;
    if (!el) return;
    const start = el.selectionStart ?? note.body.length;
    const end = el.selectionEnd ?? start;
    notes.update(note.id, note.body.slice(0, start) + snip.ins + note.body.slice(end));
    const caret = start + (snip.caret ?? snip.ins.length);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(caret, caret);
    });
  };

  const exportAs = async (fmt: 'md' | 'tex' | 'pdf') => {
    if (fmt === 'pdf') {
      toast('Typesetting “' + title + '” …');
      setTimeout(() => toast('PDF export is simulated in this offline build: export .tex and run pdflatex.', 'info'), 1100);
      return;
    }
    const result = fmt === 'md'
      ? await shareOrDownload(noteFilename(note, 'md'), note.body, 'text/markdown')
      : await shareOrDownload(noteFilename(note, 'tex'), noteToTex(note), 'application/x-tex');
    if (result !== 'cancelled') toast(fmt === 'md' ? 'Markdown exported' : 'LaTeX source exported (headings and bold converted)', 'ok');
  };

  const editor = (
    <textarea
      ref={ta}
      value={note.body}
      onChange={e => notes.update(note.id, e.target.value)}
      aria-label="Note source (Markdown and LaTeX)"
      spellCheck={false}
      autoCapitalize="sentences"
      className="block w-full resize-none overflow-hidden rounded-2xl border border-line bg-surface p-4 font-mono text-[15px] leading-relaxed text-ink outline-none focus:border-latex-ink"
    />
  );

  return (
    <Screen
      title={title}
      actions={
        <IconButton label="Note actions" onClick={() => setMenu(true)}>
          <MoreHorizontal size={22} />
        </IconButton>
      }
      pinned={
        <div className="flex items-center gap-3 px-4 py-2">
          <Segmented<Mode>
            label="Editor mode"
            value={mode}
            onChange={setMode}
            options={[
              { value: 'edit', label: 'Edit' },
              { value: 'preview', label: 'Preview' },
              ...(wide ? [{ value: 'split' as Mode, label: 'Split' }] : [])
            ]}
            className="flex-1"
          />
          <SaveBadge state={save.state} at={save.at} />
        </div>
      }
      footer={
        mode !== 'preview' ? (
          <div>
            <div className="hscroll flex gap-1.5 px-3 py-2" role="toolbar" aria-label="Insert LaTeX">
              {SNIPPETS.map(s => (
                <Pressable
                  key={s.label}
                  onPointerDown={e => e.preventDefault()}
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => insert(s)}
                  pressScale={0.92}
                  className="h-9 shrink-0 rounded-lg bg-surface-2 px-3 font-mono text-[13px] text-ink"
                >
                  {s.label}
                </Pressable>
              ))}
            </div>
            <div className="flex justify-between px-4 pb-2 text-[11.5px] text-ink-3">
              <span>{stats.words} words · {stats.formulas} formulas</span>
              <span>{stats.chars.toLocaleString()} chars</span>
            </div>
          </div>
        ) : undefined
      }
    >
      <div className="pt-3">
        {mode === 'edit' && editor}
        {mode === 'preview' && (
          <article className="rounded-2xl border border-line bg-surface p-4">
            <Markdown src={note.body} />
          </article>
        )}
        {mode === 'split' && (
          <div className="grid grid-cols-2 gap-3">
            {editor}
            <article className="rounded-2xl border border-line bg-surface p-4">
              <Markdown src={note.body} />
            </article>
          </div>
        )}
        {mode === 'preview' && (
          <p className="pt-3 text-center text-[12px] text-ink-3">
            {stats.words} words · {stats.formulas} formulas · tap Edit to change the source
          </p>
        )}
      </div>

      <ActionSheet
        open={menu}
        onClose={() => setMenu(false)}
        title={title}
        actions={[
          { label: 'Ask Scholar about this note', icon: <Sparkles size={19} />, run: () => askScholar(noteContext(note), undefined, 'Loaded note context (' + note.body.length.toLocaleString() + ' chars)') },
          { label: note.pinned ? 'Unpin note' : 'Pin to top', icon: <Pin size={19} />, run: () => notes.togglePin(note.id) },
          { label: 'Export Markdown (.md)', icon: <Download size={19} />, run: () => exportAs('md') },
          { label: 'Export LaTeX (.tex)', icon: <FileCode2 size={19} />, run: () => exportAs('tex') },
          { label: 'Export PDF (simulated)', icon: <FileDown size={19} />, run: () => exportAs('pdf') },
          {
            label: 'Delete note',
            icon: <Trash2 size={19} />,
            destructive: true,
            run: () => {
              const removed = notes.remove(note.id);
              nav.back();
              if (removed) toast('Note deleted', 'info', { label: 'Undo', run: () => notes.restore(removed.note, removed.index) });
            }
          }
        ]}
      />
    </Screen>
  );
}

function SaveBadge({ state, at }: { state: 'saved' | 'saving' | 'memory'; at: number }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1 text-[12px] text-ink-3" aria-live="polite">
      {state === 'saving' ? (
        <>
          <Loader2 size={13} className="animate-spin" /> Saving
        </>
      ) : state === 'memory' ? (
        <>
          <CloudOff size={13} className="text-danger" /> Not saved
        </>
      ) : (
        <>
          <CheckCircle2 size={13} className="text-sage-ink" /> {nowTime(at)}
        </>
      )}
    </span>
  );
}
