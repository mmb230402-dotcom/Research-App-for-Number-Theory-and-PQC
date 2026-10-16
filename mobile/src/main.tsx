import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { trackViewport } from './lib/viewport';
import { registerServiceWorker } from './lib/pwa';
import { toast } from './state/toast';

trackViewport();
// No <StrictMode>: its double-invoked effects would push duplicate history entries for sheets.
createRoot(document.getElementById('root')!).render(<App />);
registerServiceWorker(() => toast('Arithmos is ready to work offline', 'ok'));
