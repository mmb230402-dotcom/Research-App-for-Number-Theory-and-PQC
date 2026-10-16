import { lazy } from 'react';
import type { StackEntry } from '../state/nav';
import { DOMAINS } from '../content/domains';

// Each tab's screens load on first visit (the service worker precaches all of them).
const HubScreen = lazy(() => import('../screens/hub/HubScreen'));
const DomainScreen = lazy(() => import('../screens/hub/DomainScreen'));
const FeedScreen = lazy(() => import('../screens/feed/FeedScreen'));
const PaperScreen = lazy(() => import('../screens/feed/PaperScreen'));
const NotesScreen = lazy(() => import('../screens/notes/NotesScreen'));
const NoteScreen = lazy(() => import('../screens/notes/NoteScreen'));
const PrepScreen = lazy(() => import('../screens/prep/PrepScreen'));
const QuestionScreen = lazy(() => import('../screens/prep/QuestionScreen'));
const ScholarScreen = lazy(() => import('../screens/scholar/ScholarScreen'));

export function RouteScreen({ route }: { route: StackEntry }) {
  switch (route.name) {
    case 'hub': return <HubScreen />;
    case 'domain': return <DomainScreen id={route.id} />;
    case 'feed': return <FeedScreen />;
    case 'paper': return <PaperScreen id={route.id} />;
    case 'notes': return <NotesScreen />;
    case 'note': return <NoteScreen id={route.id} />;
    case 'prep': return <PrepScreen />;
    case 'question': return <QuestionScreen id={route.id} />;
    case 'scholar': return <ScholarScreen />;
  }
}

/** Short title used for the iOS back label of the screen above. */
export function routeTitle(route: StackEntry): string {
  switch (route.name) {
    case 'hub': return 'Hub';
    case 'domain': return DOMAINS.find(d => d.id === route.id)?.short ?? 'Domain';
    case 'feed': return 'arXiv';
    case 'paper': return 'Paper';
    case 'notes': return 'Notes';
    case 'note': return 'Note';
    case 'prep': return 'Prep';
    case 'question': return 'Question';
    case 'scholar': return 'Scholar';
  }
}
