/**
 * Track the visual viewport so the app shell always fits the visible area.
 * When the on-screen keyboard opens (iOS Safari overlays it, Android Chrome
 * resizes the visual viewport), the shell shrinks, the tab bar hides and
 * composers stay just above the keyboard.
 */
export function trackViewport() {
  const root = document.documentElement;
  const vv = window.visualViewport;
  const update = () => {
    const h = vv ? vv.height : window.innerHeight;
    const top = vv ? vv.offsetTop : 0;
    root.style.setProperty('--app-h', h + 'px');
    root.style.setProperty('--app-top', top + 'px');
    const keyboard = window.innerHeight - h > 140 && isEditable(document.activeElement);
    root.dataset.keyboard = keyboard ? 'open' : 'closed';
    // iOS scrolls the (fixed) document to reveal a focused input; undo it, the shell already moved.
    if (window.scrollY) window.scrollTo(0, 0);
  };
  update();
  vv?.addEventListener('resize', update);
  vv?.addEventListener('scroll', update);
  window.addEventListener('resize', update);
  window.addEventListener('orientationchange', () => setTimeout(update, 250));
  document.addEventListener('focusin', () => setTimeout(update, 50));
  document.addEventListener('focusout', () => setTimeout(update, 50));
}

function isEditable(el: Element | null) {
  return !!el && (el.tagName === 'TEXTAREA' || (el.tagName === 'INPUT' && !['checkbox', 'radio', 'button'].includes((el as HTMLInputElement).type)) || (el as HTMLElement).isContentEditable);
}
