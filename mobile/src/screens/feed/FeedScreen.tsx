import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useTransform } from 'framer-motion';
import { Bookmark, Loader2, Plus, RefreshCw, SlidersHorizontal, SearchX } from 'lucide-react';
import { Screen } from '../../components/Screen';
import { Chip, EmptyState, Segmented, Button } from '../../components/ui/primitives';
import { IconButton } from '../../components/ui/Pressable';
import { Sheet, OptionList } from '../../components/ui/Sheet';
import { PaperCard, PaperSkeleton } from './PaperCard';
import { DOMAINS } from '../../content/domains';
import type { DomainId } from '../../content/types';
import { useStore } from '../../lib/store';
import { validateKeyword, KEYWORD_LIMIT, findPaper, type FeedSort } from '../../lib/feed';
import { usePullToRefresh } from '../../lib/usePullToRefresh';
import { addKeyword, feedStore, keywordStore, KEYWORD_SUGGESTIONS, loadMore, refreshFeed, removeKeyword, setFeedFilter, setFeedView, type FeedState } from '../../state/feed';
import { progress, progressStore } from '../../state/progress';
import { sendPaperToScholar } from '../../state/actions';
import { nav } from '../../state/nav';
import { toast } from '../../state/toast';

export default function FeedScreen() {
  const feed = useStore(feedStore);
  const keywords = useStore(keywordStore);
  const saved = useStore(progressStore, p => p.saved);
  const read = useStore(progressStore, p => p.read);
  const [kwOpen, setKwOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinel = useRef<HTMLDivElement>(null);

  const refresh = useCallback(() => refreshFeed(), []);
  const { pull, trigger } = usePullToRefresh(scrollRef, refresh, feed.loading);
  const spin = useTransform(pull, v => v * 4);
  const pullOpacity = useTransform(pull, [0, trigger], [0, 1]);

  // Infinite scroll: load the next page when the sentinel nears the viewport.
  useEffect(() => {
    const el = sentinel.current;
    if (!el || feed.view !== 'all') return;
    const io = new IntersectionObserver(entries => entries.some(e => e.isIntersecting) && loadMore(), { root: scrollRef.current, rootMargin: '240px' });
    io.observe(el);
    return () => io.disconnect();
  }, [feed.view, feed.visible, feed.loading]);

  const savedPapers = saved.map(id => findPaper(id, keywords)).filter(Boolean) as NonNullable<ReturnType<typeof findPaper>>[];
  const items = feed.view === 'saved' ? savedPapers.map(p => ({ ...p, matched: [] as string[] })) : feed.list.slice(0, feed.visible);
  const domainName = feed.domain === 'all' ? 'All domains' : DOMAINS.find(d => d.id === feed.domain)!.short;

  const toggleSave = (id: string) => {
    const on = progress.toggleSaved(id);
    toast(on ? 'Saved to reading list' : 'Removed from reading list', on ? 'ok' : 'info');
  };

  return (
    <Screen
      title="arXiv Gateway"
      large
      subtitle="Keyword feed · simulated arXiv API"
      scrollRef={scrollRef}
      actions={
        <IconButton label="Filter and sort" onClick={() => setFilterOpen(true)}>
          <SlidersHorizontal size={21} />
        </IconButton>
      }
      pinned={
        <div className="hscroll flex items-center gap-2 px-4 py-2.5" aria-label="Tracked keywords">
          <Chip onClick={() => setKwOpen(true)} ariaLabel="Add keyword" className="border-dashed !border-line-strong text-latex-ink">
            <Plus size={16} /> Keyword
          </Chip>
          {keywords.map(k => (
            <Chip key={k} onRemove={() => removeKeyword(k)} ariaLabel={k}>
              {k}
            </Chip>
          ))}
        </div>
      }
    >
      {/* Pull-to-refresh indicator */}
      <motion.div style={{ height: pull, opacity: pullOpacity }} className="flex items-end justify-center overflow-hidden" aria-hidden>
        <motion.span style={{ rotate: spin }} className="mb-2 text-latex-ink">
          <RefreshCw size={20} />
        </motion.span>
      </motion.div>

      <div className="flex items-center justify-between pb-2 pt-3">
        <Segmented<FeedState['view']>
          label="Feed view"
          value={feed.view}
          onChange={setFeedView}
          options={[
            { value: 'all', label: 'Latest' },
            { value: 'saved', label: <><Bookmark size={14} /> Reading list ({saved.length})</> }
          ]}
          className="w-full"
        />
      </div>
      {feed.view === 'all' && (
        <p className="pb-3 text-[13px] text-ink-3" aria-live="polite">
          {feed.loading ? 'Fetching from arXiv…' : feed.list.length + ' preprint' + (feed.list.length === 1 ? '' : 's') + ' · ' + (feed.sort === 'date' ? 'Newest first' : 'By relevance') + ' · ' + domainName}
        </p>
      )}

      <div className="flex flex-col gap-3">
        {feed.view === 'all' && feed.loading
          ? [0, 1, 2].map(i => <PaperSkeleton key={i} />)
          : items.map(p => (
              <PaperCard
                key={p.id}
                paper={p}
                matched={p.matched}
                saved={saved.includes(p.id)}
                read={read.includes(p.id)}
                onOpen={() => nav.push({ name: 'paper', id: p.id })}
                onSend={() => sendPaperToScholar(p)}
                onToggleSave={() => toggleSave(p.id)}
              />
            ))}
      </div>

      {feed.view === 'all' && !feed.loading && !feed.list.length && (
        <EmptyState
          icon={<SearchX size={24} />}
          title="No preprints match"
          body={keywords.length ? 'Try another domain filter or add a broader keyword.' : 'Add a keyword to build your feed.'}
          action={<Button onClick={() => (keywords.length ? setFeedFilter({ domain: 'all' }) : setKwOpen(true))}>{keywords.length ? 'Show all domains' : 'Add keyword'}</Button>}
        />
      )}
      {feed.view === 'saved' && !savedPapers.length && (
        <EmptyState icon={<Bookmark size={24} />} title="Reading list is empty" body="Tap the bookmark on any paper to keep it here, offline." />
      )}

      {feed.view === 'all' && !feed.loading && feed.visible < feed.list.length && (
        <div ref={sentinel} className="flex h-16 items-center justify-center text-ink-3">
          {feed.loadingMore ? <Loader2 size={22} className="animate-spin" aria-label="Loading more" /> : <span className="text-[13px]">Scroll for more</span>}
        </div>
      )}
      {feed.view === 'all' && !feed.loading && feed.list.length > 0 && feed.visible >= feed.list.length && (
        <p className="py-6 text-center text-[12.5px] text-ink-3">End of feed · entries are synthetic, for demonstration</p>
      )}

      <KeywordSheet open={kwOpen} onClose={() => setKwOpen(false)} />
      <FilterSheet open={filterOpen} onClose={() => setFilterOpen(false)} />
    </Screen>
  );
}

function KeywordSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const keywords = useStore(keywordStore);
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  const add = (raw: string) => {
    const kw = raw.trim().replace(/\s+/g, ' ');
    const err = validateKeyword(kw, keywords);
    setError(err || '');
    if (err) return;
    addKeyword(kw);
    setValue('');
    toast('Tracking “' + kw + '” — feed updated', 'ok');
  };

  return (
    <Sheet open={open} onClose={onClose} title="Track a keyword">
      <form
        onSubmit={e => {
          e.preventDefault();
          add(value);
        }}
        className="flex gap-2"
      >
        <input
          value={value}
          onChange={e => {
            setValue(e.target.value);
            setError('');
          }}
          placeholder="e.g. Module-LWE, Selberg Sieve"
          aria-label="Keyword"
          aria-invalid={!!error}
          aria-describedby="kw-help"
          enterKeyHint="done"
          autoCapitalize="off"
          autoCorrect="off"
          maxLength={40}
          className={'h-12 min-w-0 flex-1 rounded-xl border bg-surface-2 px-4 text-ink outline-none placeholder:text-ink-3 ' + (error ? 'border-danger' : 'border-transparent focus:border-latex-ink')}
        />
        <Button tone="primary" className="h-12 px-5" ariaLabel="Add keyword" onClick={() => add(value)}>
          Add
        </Button>
      </form>
      <p id="kw-help" className={'mt-2 min-h-5 text-[13px] ' + (error ? 'text-danger' : 'text-ink-3')} role={error ? 'alert' : undefined}>
        {error || keywords.length + ' of ' + KEYWORD_LIMIT + ' keywords tracked'}
      </p>

      <h3 className="mb-2 mt-3 text-[12.5px] font-semibold uppercase tracking-wide text-ink-3">Suggestions</h3>
      <div className="flex flex-wrap gap-2">
        {KEYWORD_SUGGESTIONS.filter(s => !keywords.some(k => k.toLowerCase() === s.toLowerCase())).map(s => (
          <Chip key={s} onClick={() => add(s)}>
            <Plus size={14} /> {s}
          </Chip>
        ))}
      </div>

      <h3 className="mb-2 mt-5 text-[12.5px] font-semibold uppercase tracking-wide text-ink-3">Tracked</h3>
      <div className="flex flex-wrap gap-2">
        {keywords.map(k => (
          <Chip key={k} onRemove={() => removeKeyword(k)} ariaLabel={k}>
            {k}
          </Chip>
        ))}
        {!keywords.length && <p className="text-[14px] text-ink-3">No keywords yet: the feed shows every curated preprint.</p>}
      </div>
    </Sheet>
  );
}

function FilterSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const feed = useStore(feedStore);
  return (
    <Sheet open={open} onClose={onClose} title="Filter & sort">
      <h3 className="mb-2 text-[12.5px] font-semibold uppercase tracking-wide text-ink-3">Sort</h3>
      <Segmented<FeedSort>
        label="Sort order"
        value={feed.sort}
        onChange={sort => setFeedFilter({ sort })}
        options={[
          { value: 'relevance', label: 'Relevance' },
          { value: 'date', label: 'Newest' }
        ]}
      />
      <h3 className="mb-2 mt-5 text-[12.5px] font-semibold uppercase tracking-wide text-ink-3">Domain</h3>
      <OptionList
        options={[
          { label: 'All domains', checked: feed.domain === 'all', run: () => setFeedFilter({ domain: 'all' }) },
          ...DOMAINS.map(d => ({
            label: d.name,
            icon: <span className="font-math text-[18px]" style={{ color: d.color }}>{d.glyph}</span>,
            checked: feed.domain === d.id,
            run: () => setFeedFilter({ domain: d.id as DomainId })
          }))
        ]}
        onPick={a => {
          a.run();
          onClose();
        }}
      />
    </Sheet>
  );
}
