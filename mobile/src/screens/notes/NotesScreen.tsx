import { useMemo, useRef, useState } from 'react';
import { animate, motion, useMotionValue, useTransform, type PanInfo } from 'framer-motion';
import { FileText, NotebookPen, Pin, Plus, Sigma, Trash2 } from 'lucide-react';
import { Screen, Fab } from '../../components/Screen';
import { Card, EmptyState, SearchField } from '../../components/ui/primitives';
import { InlineMd } from '../../components/Markdown';
import type { Note } from '../../content/seedNotes';
import { useStore } from '../../lib/store';
import { noteExcerpt, noteStats } from '../../lib/markdown';
import { relDate } from '../../lib/format';
import { haptic } from '../../lib/platform';
import { notes, notesStore, sortNotes } from '../../state/notes';
import { nav } from '../../state/nav';
import { toast } from '../../state/toast';

export default function NotesScreen() {
  const all = useStore(notesStore);
  const [q, setQ] = useState('');
  const list = useMemo(() => {
    const f = q.trim().toLowerCase();
    return sortNotes(all).filter(n => !f || (n.title + ' ' + n.body).toLowerCase().includes(f));
  }, [all, q]);

  const create = () => {
    const id = notes.create();
    nav.push({ name: 'note', id });
  };

  const remove = (n: Note) => {
    const removed = notes.remove(n.id);
    haptic([10, 30, 10]);
    if (removed) toast('Note deleted', 'info', { label: 'Undo', run: () => notes.restore(removed.note, removed.index) });
  };

  return (
    <Screen title="Notes Vault" large subtitle="Markdown + LaTeX lecture notes, saved on this device">
      <div className="pb-3 pt-2">
        <SearchField value={q} onChange={setQ} placeholder="Search notes" label="Search notes" />
      </div>
      <p className="px-1 pb-2 text-[12.5px] text-ink-3">Swipe a note left to delete it, right to pin it.</p>
      <div className="flex flex-col gap-3">
        {list.map(n => (
          <SwipeRow key={n.id} note={n} onOpen={() => nav.push({ name: 'note', id: n.id })} onDelete={() => remove(n)} onPin={() => notes.togglePin(n.id)} />
        ))}
      </div>
      {!list.length && (
        <EmptyState icon={<NotebookPen size={24} />} title={q ? 'No matching notes' : 'No notes yet'} body={q ? 'Nothing matches “' + q + '”.' : 'Start a note: Markdown with live LaTeX.'} />
      )}
      <Fab label="New note" icon={<Plus size={24} />} onClick={create} extended />
    </Screen>
  );
}

const OPEN = 88;

/** Note row with swipe actions: left reveals Delete (full swipe deletes), right toggles Pin. */
function SwipeRow({ note, onOpen, onDelete, onPin }: { note: Note; onOpen: () => void; onDelete: () => void; onPin: () => void }) {
  const x = useMotionValue(0);
  const dragged = useRef(false);
  const stats = noteStats(note.body);
  const deleteOpacity = useTransform(x, [-OPEN, -20], [1, 0]);
  const pinOpacity = useTransform(x, [20, OPEN], [0, 1]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const dx = x.get();
    if (dx < -150 || info.velocity.x < -900) {
      animate(x, -window.innerWidth, { duration: 0.2 }).then(onDelete);
    } else if (dx > OPEN * 0.8) {
      onPin();
      haptic();
      animate(x, 0, { type: 'spring', stiffness: 500, damping: 40 });
    } else if (dx < -OPEN / 2) {
      animate(x, -OPEN, { type: 'spring', stiffness: 500, damping: 40 });
    } else {
      animate(x, 0, { type: 'spring', stiffness: 500, damping: 40 });
    }
    setTimeout(() => (dragged.current = false), 50);
  };

  return (
    <div className="relative overflow-hidden rounded-[18px]">
      <div className="absolute inset-0 flex items-stretch justify-between">
        <motion.div style={{ opacity: pinOpacity }} className="flex w-1/2 items-center bg-amber pl-6 text-white">
          <Pin size={22} />
          <span className="ml-2 text-[14px] font-semibold">{note.pinned ? 'Unpin' : 'Pin'}</span>
        </motion.div>
        <motion.button
          type="button"
          style={{ opacity: deleteOpacity }}
          onClick={onDelete}
          aria-label={'Delete ' + note.title}
          className="flex w-1/2 items-center justify-end bg-danger pr-6 text-white"
        >
          <span className="mr-2 text-[14px] font-semibold">Delete</span>
          <Trash2 size={22} />
        </motion.button>
      </div>
      <motion.div
        style={{ x, touchAction: 'pan-y' }}
        drag="x"
        dragDirectionLock
        dragConstraints={{ left: -OPEN, right: OPEN }}
        dragElastic={{ left: 0.5, right: 0.3 }}
        dragMomentum={false}
        onDragStart={() => (dragged.current = true)}
        onDragEnd={onDragEnd}
        className="relative"
      >
        <button
          type="button"
          onClick={() => {
            if (dragged.current) return;
            if (x.get() !== 0) {
              animate(x, 0, { type: 'spring', stiffness: 500, damping: 40 });
              return;
            }
            onOpen();
          }}
          className="block w-full text-left active:opacity-80"
        >
          <Card className="p-4">
            <div className="flex items-start gap-2">
              <FileText size={18} className="mt-0.5 shrink-0 text-latex-ink" />
              <InlineMd src={note.title} as="h3" className="flex-1 text-[16px] font-semibold leading-snug text-ink" />
              {note.pinned && <Pin size={15} className="mt-1 shrink-0 text-amber-ink" aria-label="Pinned" />}
            </div>
            <InlineMd src={noteExcerpt(note.body)} as="p" className="md md-compact mt-1.5 line-clamp-2 text-[13.5px] text-ink-3" />
            <div className="mt-3 flex items-center gap-3 text-[12px] text-ink-3">
              <span>{relDate(note.updated)}</span>
              <span className="inline-flex items-center gap-1">
                <Sigma size={13} /> {stats.formulas} formulas
              </span>
              <span>{stats.words} words</span>
            </div>
          </Card>
        </button>
      </motion.div>
    </div>
  );
}
