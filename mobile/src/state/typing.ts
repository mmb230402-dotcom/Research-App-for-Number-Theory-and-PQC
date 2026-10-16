import { createStore } from '../lib/store';

/** Scholar typing indicator; kept apart from the chat store so the tab bar does not load the knowledge base. */
export const typingStore = createStore(false);
