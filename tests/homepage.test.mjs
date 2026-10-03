import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import test from 'node:test';

const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');

test('homepage is a static, accessible English document', () => {
  assert.match(html, /<html lang="en">/);
  assert.match(html, /name="viewport" content="width=device-width, initial-scale=1"/);
  assert.match(html, /<title>Reasonably Clever/);
  assert.match(html, /name="description"/);
  assert.equal((html.match(/<h1(?:\s|>)/g) ?? []).length, 1);
  assert.match(html, /href="#main-content"/);
  assert.match(html, /<main id="main-content">/);
  assert.doesNotMatch(html, /<script(?:\s|>)/);
});

test('all supplied homepage sections and cards are rendered', () => {
  for (const heading of [
    'We start with you, not whatever',
    'What we do',
    'Four things we believe',
    'Let’s talk.',
  ]) {
    assert.ok(html.includes(heading), `Missing heading: ${heading}`);
  }
  assert.equal((html.match(/class="service-card"/g) ?? []).length, 3);
  assert.equal((html.match(/class="principle-card"/g) ?? []).length, 4);
  for (const title of [
    'Product Strategy',
    'Design',
    'Engineering',
    'We use our expertise instead of performing it.',
    'Strategy earns its keep through execution.',
    'We take the problem seriously and ourselves lightly.',
    'Small and direct beats big and layered.',
  ]) {
    assert.ok(html.includes(title), `Missing card: ${title}`);
  }
  assert.match(html, /© Reasonably Clever, LLC/);
});

test('both calls to action open the approved email destination', () => {
  assert.equal((html.match(/href="mailto:reasonablyclever@gmail.com"/g) ?? []).length, 2);
  assert.equal((html.match(/Say hello!/g) ?? []).length, 2);
  assert.doesNotMatch(html, /href="#"/);
});

test('production assets include local fonts and responsive styles', async () => {
  const assets = await readdir(new URL('../dist/_astro/', import.meta.url));
  for (const family of ['dm-sans', 'work-sans', 'source-sans-3', 'ibm-plex-mono']) {
    assert.ok(assets.some((asset) => asset.startsWith(family) && asset.endsWith('.woff2')));
  }
  const styles = await Promise.all(
    assets.filter((asset) => asset.endsWith('.css')).map((asset) =>
      readFile(new URL(`../dist/_astro/${asset}`, import.meta.url), 'utf8')),
  );
  const css = styles.join('\n');
  assert.match(css, /@media/);
  assert.match(css, /focus-visible/);
  assert.match(css, /grid-template-columns/);
  assert.match(css, /prefers-color-scheme:\s*dark/);
});

test('automatic theme covers brand assets and browser metadata without scripts', async () => {
  assert.match(html, /name="color-scheme" content="light dark"/);
  assert.match(html, /name="theme-color" content="#1B2723" media="\(prefers-color-scheme: dark\)"/);
  assert.match(html, /class="brand-mark-course"/);
  const favicon = await readFile(new URL('../dist/favicon.svg', import.meta.url), 'utf8');
  assert.match(favicon, /prefers-color-scheme:\s*dark/);
  assert.doesNotMatch(html, /<script(?:\s|>)/);
});

test('light and dark palette text pairings meet small-text contrast of 4.5:1', async () => {
  const css = await readFile(new URL('../src/styles/global.css', import.meta.url), 'utf8');
  const tokens = (block) => Object.fromEntries(
    [...block.matchAll(/(--color-[\w-]+):\s*(#[\da-f]+)/gi)].map((match) => [match[1], match[2]]),
  );
  const light = tokens(css.slice(0, css.indexOf('\n* {')));
  const darkStart = css.indexOf('@media (prefers-color-scheme: dark)');
  const dark = { ...light, ...tokens(css.slice(darkStart, css.indexOf('@media (max-width:', darkStart))) };
  const luminance = (hex) => {
    const full = hex.length === 4 ? '#' + [...hex.slice(1)].map((c) => c + c).join('') : hex;
    const rgb = full.slice(1).match(/../g).map((c) => {
      const channel = parseInt(c, 16) / 255;
      return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
    });
    return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
  };
  const pairings = [
    ['ink', 'page'], ['brand-ink', 'page'], ['body', 'page'],
    ['ink', 'surface'], ['eyebrow', 'surface'], ['brand-ink', 'surface'],
    ['ink', 'card'], ['body', 'card'], ['brand-ink', 'card'],
    ['paper', 'teal'], ['on-teal', 'teal'], ['paper', 'badge'],
    ['paper', 'footer'], ['contact-copy', 'footer'], ['muted', 'footer'],
  ];
  for (const [theme, palette] of [['light', light], ['dark', dark]]) {
    for (const [text, background] of pairings) {
      const a = luminance(palette[`--color-${text}`]);
      const b = luminance(palette[`--color-${background}`]);
      const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
      assert.ok(ratio >= 4.5, `${theme}: ${text} on ${background} has ${ratio.toFixed(2)}:1 contrast`);
    }
  }
});
