// Renders the app icons (PNG) from an HTML template with Chromium, using KaTeX's
// Computer Modern font for the ζ glyph. Run: npm run icons
// Needs playwright-core and a Chromium (CHROMIUM_PATH, default /opt/pw-browsers/chromium).
import { chromium } from 'playwright-core';
import { readFileSync, readdirSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const fontDir = join(root, 'node_modules/katex/dist/fonts');
const font = readdirSync(fontDir).find(f => f.startsWith('KaTeX_Math-Italic') && f.endsWith('.woff2'));
const fontData = readFileSync(join(fontDir, font)).toString('base64');
const out = join(root, 'public/icons');
mkdirSync(out, { recursive: true });

const page = (size, { maskable = false, radius = 0.22 } = {}) => `<!doctype html><html><head><style>
@font-face { font-family: KM; src: url(data:font/woff2;base64,${fontData}) format('woff2'); }
html,body { margin:0; width:${size}px; height:${size}px; background:transparent; }
.i { width:${size}px; height:${size}px; border-radius:${maskable ? 0 : radius * size}px; overflow:hidden; position:relative;
  background: radial-gradient(120% 120% at 15% 10%, #1A365D 0%, #16263d 38%, #121212 70%); }
.i::after { content:''; position:absolute; inset:0; background: radial-gradient(90% 90% at 95% 100%, rgba(47,133,90,.55), transparent 60%); }
.g { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; z-index:1;
  font-family: KM; color:#fff; font-size:${size * (maskable ? 0.5 : 0.64)}px; line-height:1; padding-bottom:${size * 0.04}px;
  text-shadow: 0 ${size * 0.01}px ${size * 0.04}px rgba(0,0,0,.45); }
.r { position:absolute; left:${size * 0.18}px; right:${size * 0.18}px; bottom:${size * (maskable ? 0.26 : 0.17)}px; height:${Math.max(2, size * 0.018)}px;
  background: linear-gradient(90deg, transparent, #9AE6B4, transparent); opacity:.8; z-index:1; border-radius:4px; }
</style></head><body><div class="i"><div class="g">ζ</div><div class="r"></div></div></body></html>`;

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium' });
const ctx = await browser.newContext({ deviceScaleFactor: 1 });
const p = await ctx.newPage();
for (const [name, size, opts] of [
  ['icon-192.png', 192, {}],
  ['icon-512.png', 512, {}],
  ['maskable-512.png', 512, { maskable: true }],
  ['apple-touch-icon.png', 180, { maskable: true }]
]) {
  await p.setViewportSize({ width: size, height: size });
  await p.setContent(page(size, opts));
  await p.evaluate(() => document.fonts.ready);
  await p.screenshot({ path: join(out, name), omitBackground: !opts.maskable });
  console.log('wrote', name);
}
await browser.close();
