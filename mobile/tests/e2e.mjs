/*
 * End-to-end check of the built app on an iPhone and a Pixel profile.
 *   npm run build && npm run test:e2e
 * Starts `vite preview`, drives every tab, and fails on console errors,
 * KaTeX errors, horizontal overflow or a broken workflow. Screenshots go to
 * test-results/. Chromium comes from CHROMIUM_PATH or Playwright's default.
 */
import { chromium, devices } from 'playwright-core';
import { spawn } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';
import assert from 'node:assert/strict';

const PORT = 4174;
const BASE = `http://localhost:${PORT}/`;
const OUT = new URL('../test-results/', import.meta.url).pathname;
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { stdio: 'ignore', cwd: new URL('..', import.meta.url).pathname });
const stop = () => server.kill();
process.on('exit', stop);
await waitFor(async () => (await fetch(BASE)).ok, 15000);

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
let failures = 0;

for (const [name, device] of [['iphone', devices['iPhone 13']], ['pixel', devices['Pixel 7']]]) {
  const ctx = await browser.newContext({ ...device, colorScheme: 'dark' });
  ctx.setDefaultTimeout(8000);
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', m => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', e => errors.push(e.message));
  const shot = s => page.screenshot({ path: `${OUT}${name}-${s}.png` });
  const step = async (label, fn) => {
    try {
      await fn();
      console.log(`  ✓ ${label}`);
    } catch (e) {
      failures++;
      console.log(`  ✗ ${label}\n    ${String(e.message).split('\n')[0]}`);
      await shot('FAIL-' + label.replace(/\W+/g, '-'));
    }
  };
  // The visible screen: top of the active tab's stack.
  const top = () => page.locator('[data-active="true"] > [data-top="true"]');
  const tab = label => page.getByRole('navigation', { name: 'Primary' }).getByRole('button', { name: label });
  const noOverflow = async () => {
    const bad = await page.evaluate(() => {
      const w = innerWidth;
      if (document.documentElement.scrollWidth > w + 1) return 'document';
      return [...document.querySelectorAll('.scroller')].filter(el => el.scrollWidth > el.clientWidth + 1).map(el => el.className).join(', ');
    });
    assert.equal(bad, '', 'horizontal overflow: ' + bad);
  };
  const noKatexErrors = async () => assert.equal(await page.locator('.katex-error').count(), 0, 'KaTeX errors on screen');

  console.log(`\n${name} (${device.viewport.width}×${device.viewport.height})`);
  await page.goto(BASE);

  await step('hub renders domains and progress', async () => {
    await top().getByText('Research domains').waitFor();
    assert.ok((await top().getByRole('button', { name: /Number Theory|Cryptography/ }).count()) >= 5);
    await noOverflow();
    await shot('1-hub');
  });

  await step('domain screen: overview, cheat sheet, questions', async () => {
    await top().getByRole('button', { name: /Post-Quantum Cryptography/ }).click();
    await top().getByRole('tab', { name: 'Cheat sheet' }).waitFor();
    await page.waitForTimeout(500);
    await top().getByRole('button', { name: 'Mark as studied' }).click();
    await top().getByRole('button', { name: 'Studied', exact: true }).waitFor();
    await top().getByRole('tab', { name: 'Cheat sheet' }).click();
    assert.ok((await top().locator('.katex-block').count()) >= 11, 'cheat sheet formulas');
    await noKatexErrors();
    await noOverflow();
    await shot('2-cheat');
    await top().getByRole('tab', { name: 'Questions' }).click();
    await top().getByText('Is SVP on ideal lattices easier?').waitFor();
  });

  await step('back returns to hub with progress updated', async () => {
    await page.goBack(); // hardware/gesture back
    await page.waitForTimeout(600);
    await top().getByText('1/27').waitFor();
  });

  await step('iOS edge swipe / back button pops a screen', async () => {
    await top().getByRole('button', { name: /Analytic Number Theory/ }).click();
    await page.waitForTimeout(600);
    if (name === 'iphone') {
      await page.mouse.move(4, 400);
      await page.mouse.down();
      await page.mouse.move(150, 400, { steps: 6 });
      await page.mouse.move(330, 400, { steps: 6 });
      await page.mouse.up();
    } else {
      await top().getByRole('button', { name: 'Back' }).click();
    }
    await page.waitForTimeout(700);
    await top().getByText('Research domains').waitFor();
  });

  await step('settings sheet switches to light theme', async () => {
    await top().getByRole('button', { name: 'Settings' }).click();
    await page.getByRole('dialog').getByRole('tab', { name: 'Light' }).click();
    assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), 'light');
    await page.waitForTimeout(400);
    await shot('3-settings-light');
    await page.getByRole('dialog').getByRole('tab', { name: 'Noir' }).click();
    await page.goBack();
    await page.getByRole('dialog').waitFor({ state: 'detached' });
  });

  await step('arXiv feed loads, keyword added, filter sheet', async () => {
    await tab('arXiv').click();
    await top().getByRole('button', { name: 'Open in Reader' }).first().waitFor();
    await top().getByRole('button', { name: 'Add keyword' }).click();
    await page.getByRole('dialog').getByLabel('Keyword', { exact: true }).fill('x');
    await page.getByRole('dialog').getByRole('button', { name: 'Add keyword' }).click();
    await page.getByRole('dialog').getByText('Keywords must be 2–40 characters.').waitFor();
    await page.getByRole('dialog').getByLabel('Keyword', { exact: true }).fill('Lattice sieving');
    await page.getByRole('dialog').getByRole('button', { name: 'Add keyword' }).click();
    await page.getByText(/Tracking “Lattice sieving”/).waitFor();
    await page.goBack();
    await page.getByRole('dialog').waitFor({ state: 'detached' });
    await top().getByRole('button', { name: 'Remove Lattice sieving' }).waitFor();
    await top().getByRole('button', { name: 'Open in Reader' }).first().waitFor();
    await noKatexErrors();
    await noOverflow();
    await shot('4-feed');
    await top().getByRole('button', { name: 'Filter and sort' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Algebraic Number Theory' }).click();
    await page.getByRole('dialog').waitFor({ state: 'detached' });
    await top().getByText(/· Algebraic NT/).waitFor();
  });

  await step('reader opens and sends abstract to Scholar', async () => {
    await top().getByRole('button', { name: 'Open in Reader' }).first().click();
    await top().getByText('Main result').waitFor();
    await page.waitForTimeout(500);
    await noKatexErrors();
    await shot('5-reader');
    await top().getByRole('button', { name: 'Send to Scholar' }).click();
    await top().getByText(/arXiv abstract ·/).waitFor();
  });

  await step('Scholar answers a quick prompt with LaTeX', async () => {
    const before = await top().locator('.md .katex').count();
    await top().getByRole('button', { name: /Explain this theorem intuitively/ }).click();
    await top().getByText(/Offline simulation · topic: algebraic number theory/).last().waitFor({ timeout: 6000 });
    assert.ok((await top().locator('.md .katex').count()) > before);
    await top().getByLabel('Message Gemini Scholar').fill('Suggest SageMath code for class groups');
    await top().getByRole('button', { name: 'Send message' }).click();
    await top().getByText(/mode: code/).last().waitFor({ timeout: 6000 });
    assert.ok((await top().locator('.codeblock').count()) > 0, 'code block rendered');
    await noKatexErrors();
    await noOverflow();
    await shot('6-scholar');
  });

  await step('notes: preview, edit with snippet bar, persistence', async () => {
    await tab('Notes').click();
    await top().getByRole('button', { name: /^Lecture 9/ }).click();
    await page.waitForTimeout(500);
    assert.ok((await top().locator('.katex').count()) > 20, 'note preview math');
    await noKatexErrors();
    await shot('7-note-preview');
    await top().getByRole('tab', { name: 'Edit' }).click();
    const ta = top().getByLabel('Note source (Markdown and LaTeX)');
    await ta.click();
    await ta.press('Control+End');
    await ta.pressSequentially('\nCheck ');
    await top().getByRole('toolbar', { name: 'Insert LaTeX' }).getByRole('button', { name: '\\mathbb' }).click();
    await ta.pressSequentially('Z');
    await page.waitForTimeout(900);
    assert.match(await ta.inputValue(), /Check \\mathbb\{Z\}$/);
    await shot('8-note-edit');
    await page.reload();
    await tab('Notes').click();
    await top().getByRole('button', { name: /^Lecture 9/ }).click();
    await top().getByRole('tab', { name: 'Edit' }).click();
    assert.match(await top().getByLabel('Note source (Markdown and LaTeX)').inputValue(), /Check \\mathbb\{Z\}$/);
    await page.goBack();
    await page.waitForTimeout(500);
  });

  await step('notes: new note via FAB, swipe to delete, undo', async () => {
    await top().getByRole('button', { name: 'New note' }).click();
    await top().getByRole('tab', { name: 'Edit' }).waitFor();
    await page.goBack();
    await page.waitForTimeout(600);
    const row = top().getByRole('button', { name: /^Untitled note/ }).first();
    const box = await row.boundingBox();
    await page.mouse.move(box.x + box.width - 30, box.y + 40);
    await page.mouse.down();
    await page.mouse.move(box.x + 40, box.y + 42, { steps: 8 });
    await page.mouse.up();
    await page.getByRole('button', { name: 'Undo' }).click();
    await top().getByRole('button', { name: /^Untitled note/ }).first().waitFor();
    await shot('9-notes');
  });

  await step('prep: outline toggle and mastery progress', async () => {
    await tab('Prep').click();
    await top().getByText(/Hasse's bound and the zeta function/).click();
    await top().getByRole('button', { name: 'View outline solution' }).click();
    await top().getByText(/positive-definite quadratic form/).waitFor();
    await noKatexErrors();
    await top().getByRole('button', { name: 'Mastered it' }).click();
    await shot('10-question');
    await top().getByRole('button', { name: /Back/ }).click();
    await page.waitForTimeout(600);
    await top().getByText('1 mastered').waitFor();
    await noOverflow();
    await shot('11-prep');
  });

  await step('no console errors', async () => assert.deepEqual(errors, []));
  await ctx.close();
}

await step0Offline();
await browser.close();
stop();
if (failures) {
  console.log(`\n${failures} check(s) failed`);
  process.exit(1);
}
console.log('\nAll checks passed');

/** The service worker precaches the app: a reload while offline still renders it. */
async function step0Offline() {
  const ctx = await browser.newContext({ ...devices['Pixel 7'] });
  const page = await ctx.newPage();
  console.log('\noffline');
  try {
    await page.goto(BASE);
    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.waitForTimeout(1500);
    await ctx.setOffline(true);
    await page.reload();
    await page.getByText('Research domains').waitFor({ timeout: 8000 });
    await page.getByRole('navigation', { name: 'Primary' }).getByRole('button', { name: 'Scholar' }).click();
    await page.getByText('Gemini Scholar').first().waitFor();
    console.log('  ✓ app loads and navigates offline');
  } catch (e) {
    failures++;
    console.log('  ✗ offline: ' + e.message.split('\n')[0]);
  }
  await ctx.close();
}

async function waitFor(fn, ms) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    try {
      if (await fn()) return;
    } catch {}
    await new Promise(r => setTimeout(r, 200));
  }
  throw new Error('preview server did not start');
}
