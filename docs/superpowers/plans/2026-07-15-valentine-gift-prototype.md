# Valentine's Day Virtual Gift Website Prototype Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy a single static Valentine's Day virtual-gift website (envelope-open animation → music → special words/wishes/journey timeline → QR share) proving the config-to-site-to-QR flow described in the spec.

**Architecture:** Zero-build static site (`index.html` + `css/style.css` + native-ESM JS modules). All client-specific content lives in one config module (`js/content.js`); pure functions in `js/utils.js` and `js/render.js` are unit-tested with Node's built-in test runner; `js/app.js` wires config + render output + animation + audio into the DOM. Deployed to GitHub Pages via the already-authenticated `gh` CLI.

**Tech Stack:** Plain HTML/CSS/JS (native ES modules, no bundler). Node 22 built-in `node:test` + `node:assert/strict` for unit tests (no test framework dependency). `gh` CLI for repo creation + GitHub Pages. `api.qrserver.com` image API for QR generation (no client-side QR library).

## Global Constraints

- No build step, no bundler, no frontend framework — plain HTML/CSS/JS only (spec: Stack).
- No runtime npm dependencies. `package.json` exists only for `"type": "module"` and the `test` script — zero entries under `dependencies`.
- All client-specific content (names, message, wishes, timeline, song, accent color) lives in `js/content.js` only — no content hardcoded into `index.html` or `app.js` (spec: Content input).
- Audio must not attempt autoplay before a user tap — playback starts only inside the `#open-btn` click handler (spec: browser autoplay policy / User flow step 1–2).
- QR code is generated via an image API URL (`api.qrserver.com`), not a client-side JS library (spec: Delivery mechanism).
- Deploy target is GitHub Pages via the `gh` CLI, which is already authenticated — no new login flow (spec: Delivery mechanism).
- Out of scope: admin/intake form, payment, multi-tenant automation, wildcard custom domain, account system, other scenario themes, analytics (spec: Explicitly out of scope).

---

### Task 1: `utils.js` — pure helper functions with unit tests

**Files:**
- Create: `package.json`
- Create: `js/utils.js`
- Test: `tests/utils.test.js`

**Interfaces:**
- Produces: `formatDate(isoDateString: string): string` — e.g. `"2023-02-14"` → `"Feb 14, 2023"`.
- Produces: `buildQrImageUrl(targetUrl: string, size?: number): string` — defaults `size` to `300`, returns `` `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(targetUrl)}` ``.

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "valentine-gift-prototype",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "node --test tests/"
  }
}
```

- [ ] **Step 2: Write the failing tests**

Create `tests/utils.test.js`:

```javascript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatDate, buildQrImageUrl } from '../js/utils.js';

test('formatDate formats an ISO date as "Mon D, YYYY"', () => {
  assert.equal(formatDate('2023-02-14'), 'Feb 14, 2023');
  assert.equal(formatDate('2024-12-01'), 'Dec 1, 2024');
});

test('buildQrImageUrl defaults to a 300x300 QR image URL with the target URL encoded', () => {
  const url = buildQrImageUrl('https://example.github.io/gift/');
  assert.equal(
    url,
    'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https%3A%2F%2Fexample.github.io%2Fgift%2F'
  );
});

test('buildQrImageUrl accepts a custom size', () => {
  const url = buildQrImageUrl('https://example.com', 500);
  assert.equal(
    url,
    'https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=https%3A%2F%2Fexample.com'
  );
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `node --test tests/`
Expected: FAIL — `Cannot find module '../js/utils.js'`

- [ ] **Step 4: Write minimal implementation**

Create `js/utils.js`:

```javascript
const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export function formatDate(isoDateString) {
  const [year, month, day] = isoDateString.split('-').map(Number);
  return `${MONTH_NAMES[month - 1]} ${day}, ${year}`;
}

export function buildQrImageUrl(targetUrl, size = 300) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(targetUrl)}`;
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `node --test tests/`
Expected: PASS — 3 tests passing.

- [ ] **Step 6: Commit**

```bash
git add package.json js/utils.js tests/utils.test.js
git commit -m "feat: add date/QR-url utility functions with tests"
```

---

### Task 2: `content.js` — demo config data with validation test

**Files:**
- Create: `js/content.js`
- Test: `tests/content.test.js`

**Interfaces:**
- Consumes: nothing.
- Produces: default export `content` object with exact shape: `{ recipientName: string, senderName: string, coverMessage: string, specialWords: string, wishes: string[], timeline: Array<{ date: string, title: string, caption: string, photoUrl: string }>, songUrl: string, songTitle: string, accentColor: string }`. Tasks 3 and 4 consume this exact shape.

- [ ] **Step 1: Write the failing test**

Create `tests/content.test.js`:

```javascript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import content from '../js/content.js';

test('content has all required top-level fields with correct types', () => {
  assert.equal(typeof content.recipientName, 'string');
  assert.equal(typeof content.senderName, 'string');
  assert.equal(typeof content.coverMessage, 'string');
  assert.equal(typeof content.specialWords, 'string');
  assert.ok(Array.isArray(content.wishes));
  assert.ok(content.wishes.length > 0);
  assert.ok(Array.isArray(content.timeline));
  assert.ok(content.timeline.length > 0);
  assert.equal(typeof content.songUrl, 'string');
  assert.equal(typeof content.songTitle, 'string');
  assert.match(content.accentColor, /^#[0-9a-fA-F]{6}$/);
});

test('every timeline entry has date, title, caption, photoUrl', () => {
  for (const entry of content.timeline) {
    assert.equal(typeof entry.date, 'string');
    assert.match(entry.date, /^\d{4}-\d{2}-\d{2}$/);
    assert.equal(typeof entry.title, 'string');
    assert.equal(typeof entry.caption, 'string');
    assert.equal(typeof entry.photoUrl, 'string');
    assert.match(entry.photoUrl, /^https:\/\//);
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/content.test.js`
Expected: FAIL — `Cannot find module '../js/content.js'`

- [ ] **Step 3: Write the content data**

Create `js/content.js`:

```javascript
const content = {
  recipientName: 'Aya',
  senderName: 'Bima',
  coverMessage: 'A gift for Aya 💌',
  specialWords:
    'From the first "hi" to every ordinary Tuesday since, you\'ve made my ' +
    'life softer and brighter. This little site is a small thank-you for ' +
    'all of it.',
  wishes: [
    'May every year with you feel this easy.',
    'May we keep choosing each other, again and again.',
    'May our worst days still be better because we face them together.',
  ],
  timeline: [
    {
      date: '2022-11-03',
      title: 'The day we met',
      caption: 'A rainy Thursday, a shared umbrella, and way too much coffee.',
      photoUrl: 'https://picsum.photos/seed/gift-timeline-1/600/800',
    },
    {
      date: '2023-02-14',
      title: 'Our first Valentine\'s',
      caption: 'Cheap flowers, expensive ramen, zero regrets.',
      photoUrl: 'https://picsum.photos/seed/gift-timeline-2/600/800',
    },
    {
      date: '2024-06-21',
      title: 'The road trip',
      caption: 'We got lost twice and still call it the best weekend.',
      photoUrl: 'https://picsum.photos/seed/gift-timeline-3/600/800',
    },
    {
      date: '2025-12-24',
      title: 'This Christmas',
      caption: 'Still here, still us.',
      photoUrl: 'https://picsum.photos/seed/gift-timeline-4/600/800',
    },
  ],
  songUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  songTitle: 'Our Song (placeholder — swap per client order)',
  accentColor: '#ff4d6d',
};

export default content;
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test tests/content.test.js`
Expected: PASS — 2 tests passing.

- [ ] **Step 5: Commit**

```bash
git add js/content.js tests/content.test.js
git commit -m "feat: add Valentine's demo content config"
```

---

### Task 3: `render.js` — pure HTML-string builders with unit tests

**Files:**
- Create: `js/render.js`
- Test: `tests/render.test.js`

**Interfaces:**
- Consumes: `formatDate` from `js/utils.js` (Task 1); the `timeline`/`wishes`/`specialWords` shape from `js/content.js` (Task 2).
- Produces: `renderMessage(text: string): string`, `renderWishesList(wishes: string[]): string`, `renderTimeline(entries: Array<{date, title, caption, photoUrl}>): string` — all return HTML strings for `innerHTML` assignment. Task 4 consumes these three function names directly.

- [ ] **Step 1: Write the failing tests**

Create `tests/render.test.js`:

```javascript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderMessage, renderWishesList, renderTimeline } from '../js/render.js';

test('renderMessage wraps text in a paragraph', () => {
  assert.equal(renderMessage('Hello there'), '<p class="message-text">Hello there</p>');
});

test('renderWishesList renders one <li> per wish inside a <ul>', () => {
  const html = renderWishesList(['Wish one', 'Wish two']);
  assert.equal(
    html,
    '<ul class="wishes-list"><li>Wish one</li><li>Wish two</li></ul>'
  );
});

test('renderWishesList returns an empty <ul> for no wishes', () => {
  assert.equal(renderWishesList([]), '<ul class="wishes-list"></ul>');
});

test('renderTimeline renders one .timeline-item per entry with formatted date', () => {
  const html = renderTimeline([
    { date: '2023-02-14', title: 'First date', caption: 'Nervous and happy.', photoUrl: 'https://example.com/a.jpg' },
  ]);
  assert.match(html, /<div class="timeline-item">/);
  assert.match(html, /Feb 14, 2023/);
  assert.match(html, /First date/);
  assert.match(html, /Nervous and happy\./);
  assert.match(html, /src="https:\/\/example\.com\/a\.jpg"/);
});

test('renderTimeline concatenates multiple entries in order', () => {
  const html = renderTimeline([
    { date: '2023-01-01', title: 'A', caption: 'a', photoUrl: 'https://example.com/a.jpg' },
    { date: '2023-02-01', title: 'B', caption: 'b', photoUrl: 'https://example.com/b.jpg' },
  ]);
  assert.ok(html.indexOf('>A<') < html.indexOf('>B<'));
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test tests/render.test.js`
Expected: FAIL — `Cannot find module '../js/render.js'`

- [ ] **Step 3: Write minimal implementation**

Create `js/render.js`:

```javascript
import { formatDate } from './utils.js';

export function renderMessage(text) {
  return `<p class="message-text">${text}</p>`;
}

export function renderWishesList(wishes) {
  const items = wishes.map((wish) => `<li>${wish}</li>`).join('');
  return `<ul class="wishes-list">${items}</ul>`;
}

export function renderTimeline(entries) {
  return entries
    .map(
      (entry) => `<div class="timeline-item">
  <img src="${entry.photoUrl}" alt="${entry.title}" loading="lazy">
  <span class="timeline-date">${formatDate(entry.date)}</span>
  <h3>${entry.title}</h3>
  <p>${entry.caption}</p>
</div>`
    )
    .join('');
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test tests/render.test.js`
Expected: PASS — 5 tests passing.

- [ ] **Step 5: Run the full test suite**

Run: `node --test tests/`
Expected: PASS — all tests from Tasks 1–3 passing (10 tests total).

- [ ] **Step 6: Commit**

```bash
git add js/render.js tests/render.test.js
git commit -m "feat: add pure HTML-string render functions with tests"
```

---

### Task 4: Static page skeleton — HTML, CSS layout, content mounting

**Files:**
- Create: `index.html`
- Create: `css/style.css`
- Create: `js/app.js`

**Interfaces:**
- Consumes: `content` default export (Task 2), `renderMessage`/`renderWishesList`/`renderTimeline` (Task 3).
- Produces: DOM element IDs that Tasks 5–7 attach behavior to: `#cover-screen`, `#envelope`, `#open-btn`, `#cover-message`, `#ambient-hearts`, `#content`, `#special-words`, `#wishes`, `#journey`, `#closing-message`, `#bg-audio`, `#share-link`, `#qr-code`.

No unit test for this task — it's DOM wiring/layout, verified visually per the deviation noted in Global Constraints (visual/interactive work uses browser verification, not unit tests; pure logic was already covered in Tasks 1–3).

- [ ] **Step 1: Create `index.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>A Virtual Gift For You 💌</title>
<link rel="stylesheet" href="css/style.css">
</head>
<body>
  <audio id="bg-audio" loop preload="none"></audio>

  <section id="cover-screen">
    <div id="envelope">
      <div class="envelope-back"></div>
      <div class="envelope-letter"></div>
      <div class="envelope-flap"></div>
    </div>
    <p id="cover-message"></p>
    <button id="open-btn" type="button">Tap to open 💝</button>
  </section>

  <div id="ambient-hearts" aria-hidden="true"></div>

  <main id="content" hidden>
    <section id="special-words" class="content-section"></section>
    <section id="wishes" class="content-section">
      <h2>Wishes</h2>
      <div id="wishes-list"></div>
    </section>
    <section id="journey" class="content-section">
      <h2>Our Journey</h2>
      <div id="timeline"></div>
    </section>
    <section id="closing" class="content-section">
      <p class="closing-message" id="closing-message"></p>
    </section>
    <section id="share" class="content-section">
      <p>Share this gift:</p>
      <p id="share-link"></p>
      <img id="qr-code" alt="QR code linking to this gift">
    </section>
  </main>

  <script type="module" src="js/app.js"></script>
</body>
</html>
```

- [ ] **Step 2: Create `css/style.css` (base layout only, no animation yet)**

```css
:root {
  --accent: #ff4d6d;
  --bg: #fff5f7;
  --text: #3a2e33;
}

* { box-sizing: border-box; }

body {
  margin: 0;
  font-family: 'Georgia', 'Times New Roman', serif;
  background: var(--bg);
  color: var(--text);
}

#cover-screen {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  text-align: center;
  padding: 1rem;
}

#envelope {
  position: relative;
  width: 220px;
  height: 140px;
}

.envelope-back {
  position: absolute;
  inset: 0;
  background: var(--accent);
  border-radius: 6px;
}

.envelope-letter {
  position: absolute;
  left: 10px;
  right: 10px;
  top: 8px;
  height: 118px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.envelope-flap {
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  height: 0;
  border-left: 110px solid transparent;
  border-right: 110px solid transparent;
  border-top: 80px solid #d63756;
  transform-origin: top center;
}

#cover-message {
  font-size: 1.4rem;
  max-width: 26rem;
}

#open-btn {
  font-size: 1.1rem;
  padding: 0.75rem 1.75rem;
  border-radius: 999px;
  border: none;
  background: var(--accent);
  color: #fff;
  cursor: pointer;
}

#ambient-hearts {
  position: fixed;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 1;
}

#content {
  position: relative;
  z-index: 2;
  max-width: 40rem;
  margin: 0 auto;
  padding: 2rem 1.5rem 4rem;
}

.content-section {
  margin-bottom: 3rem;
}

.message-text {
  font-size: 1.2rem;
  line-height: 1.6;
}

.wishes-list {
  padding-left: 1.2rem;
  line-height: 1.8;
}

.timeline-item {
  margin-bottom: 2rem;
}

.timeline-item img {
  width: 100%;
  max-width: 320px;
  border-radius: 8px;
  display: block;
  margin-bottom: 0.5rem;
}

.timeline-date {
  font-size: 0.85rem;
  color: var(--accent);
  font-weight: bold;
}

.closing-message {
  text-align: center;
  font-size: 1.4rem;
}

#share {
  text-align: center;
}

#qr-code {
  width: 180px;
  height: 180px;
  margin-top: 0.5rem;
}
```

- [ ] **Step 3: Create `js/app.js` (content mounting only — no animation/audio wiring yet)**

```javascript
import content from './content.js';
import { renderMessage, renderWishesList, renderTimeline } from './render.js';

function mountContent() {
  document.documentElement.style.setProperty('--accent', content.accentColor);
  document.getElementById('cover-message').textContent = content.coverMessage;
  document.getElementById('special-words').innerHTML = renderMessage(content.specialWords);
  document.getElementById('wishes-list').innerHTML = renderWishesList(content.wishes);
  document.getElementById('timeline').innerHTML = renderTimeline(content.timeline);
  document.getElementById('closing-message').textContent = `With all our love, ${content.senderName} 💕`;
  document.getElementById('bg-audio').src = content.songUrl;
}

mountContent();
```

- [ ] **Step 4: Serve locally and verify the skeleton renders**

Run: `npx --yes serve . -l 4173` (leave running), then in a browser open `http://localhost:4173`.

Expected: Cover screen shows the envelope shape and "A gift for Aya 💌" with a "Tap to open 💝" button. `#content` is hidden (the `hidden` attribute is still set — Task 5 removes it on open). No console errors in devtools.

- [ ] **Step 5: Temporarily verify mounted content (manual, then revert)**

In the browser devtools console, run `document.getElementById('content').hidden = false` and confirm: special words paragraph, 3 wishes as a bulleted list, 4 timeline entries each with an image, a formatted date (e.g. "Nov 3, 2022"), title, and caption, in chronological order, and a closing line reading "With all our love, Bima 💕". Also run `getComputedStyle(document.documentElement).getPropertyValue('--accent')` and confirm it returns `#ff4d6d` (proves `content.accentColor` — not a CSS hardcode — is driving the theme).

This is a manual check only — do not commit any change from this step.

- [ ] **Step 6: Commit**

```bash
git add index.html css/style.css js/app.js
git commit -m "feat: add static page skeleton and content mounting"
```

---

### Task 5: Envelope tap-to-open animation, heart burst, audio start

**Files:**
- Modify: `css/style.css`
- Modify: `js/app.js`

**Interfaces:**
- Consumes: `#envelope`, `#open-btn`, `#cover-screen`, `#content`, `#bg-audio` (Task 4 DOM structure).
- Produces: `.open` class toggle behavior on `#envelope` and `#cover-screen` that Task 7 (ambient hearts) and Task 8 (share section) run after.

- [ ] **Step 1: Add open-state and burst-heart CSS to `css/style.css`**

Append:

```css
#envelope.open .envelope-flap {
  animation: flap-open 0.6s ease forwards;
}

@keyframes flap-open {
  to { transform: rotateX(180deg); }
}

#envelope.open .envelope-letter {
  animation: letter-rise 0.6s ease 0.3s forwards;
}

@keyframes letter-rise {
  to { transform: translateY(-70px); }
}

#cover-screen.closing {
  animation: cover-fade 0.6s ease 0.9s forwards;
}

@keyframes cover-fade {
  to { opacity: 0; visibility: hidden; }
}

.burst-heart {
  position: fixed;
  font-size: 1.5rem;
  left: 50%;
  top: 50%;
  pointer-events: none;
  z-index: 3;
  animation: burst 0.9s ease-out forwards;
}

@keyframes burst {
  to {
    transform: translate(var(--tx), var(--ty)) scale(0.4);
    opacity: 0;
  }
}
```

- [ ] **Step 2: Wire the open interaction in `js/app.js`**

Replace the final `mountContent();` line with:

```javascript
function spawnHeartBurst() {
  const count = 24;
  for (let i = 0; i < count; i++) {
    const heart = document.createElement('span');
    heart.className = 'burst-heart';
    heart.textContent = '💗';
    const angle = (Math.PI * 2 * i) / count;
    const distance = 120 + Math.random() * 80;
    heart.style.setProperty('--tx', `${Math.cos(angle) * distance}px`);
    heart.style.setProperty('--ty', `${Math.sin(angle) * distance}px`);
    document.body.appendChild(heart);
    heart.addEventListener('animationend', () => heart.remove());
  }
}

function openGift() {
  const envelope = document.getElementById('envelope');
  const coverScreen = document.getElementById('cover-screen');
  const contentEl = document.getElementById('content');
  const audio = document.getElementById('bg-audio');

  envelope.classList.add('open');
  spawnHeartBurst();
  audio.play().catch(() => {});
  coverScreen.classList.add('closing');

  setTimeout(() => {
    coverScreen.remove();
    contentEl.hidden = false;
  }, 1500);
}

function init() {
  mountContent();
  document.getElementById('open-btn').addEventListener('click', openGift, { once: true });
}

init();
```

- [ ] **Step 3: Verify in browser**

With `npx --yes serve . -l 4173` running, open `http://localhost:4173`, click "Tap to open 💝".

Expected: envelope flap rotates open, ~24 heart emoji burst outward and fade within ~1s, the letter slides up, the cover screen fades out and is removed from the DOM after ~1.5s, `#content` becomes visible with special words/wishes/journey/closing/share sections, and the devtools Elements panel shows `#bg-audio` with `paused: false` (Network tab shows the SoundHelix mp3 request).

- [ ] **Step 4: Commit**

```bash
git add css/style.css js/app.js
git commit -m "feat: wire envelope open animation, heart burst, and audio start"
```

---

### Task 6: Ambient background hearts

**Files:**
- Modify: `css/style.css`
- Modify: `js/app.js`

**Interfaces:**
- Consumes: `#ambient-hearts` container (Task 4 DOM structure).
- Produces: nothing consumed by later tasks (self-contained visual effect).

- [ ] **Step 1: Add ambient-heart CSS to `css/style.css`**

Append:

```css
.ambient-heart {
  position: absolute;
  bottom: -40px;
  opacity: 0.7;
  animation: float-up linear forwards;
}

@keyframes float-up {
  to {
    transform: translateY(-110vh) rotate(20deg);
    opacity: 0;
  }
}
```

- [ ] **Step 2: Add the spawner to `js/app.js`**

Add before `function init() {`:

```javascript
function spawnAmbientHeart() {
  const heart = document.createElement('span');
  heart.className = 'ambient-heart';
  heart.textContent = Math.random() > 0.5 ? '💕' : '🌸';
  heart.style.left = `${Math.random() * 100}vw`;
  heart.style.fontSize = `${1 + Math.random()}rem`;
  heart.style.animationDuration = `${5 + Math.random() * 4}s`;
  document.getElementById('ambient-hearts').appendChild(heart);
  heart.addEventListener('animationend', () => heart.remove());
}
```

Update `function init()` to also start the ambient loop:

```javascript
function init() {
  mountContent();
  document.getElementById('open-btn').addEventListener('click', openGift, { once: true });
  setInterval(spawnAmbientHeart, 900);
}
```

- [ ] **Step 3: Verify in browser**

Reload `http://localhost:4173`.

Expected: small heart/flower emoji continuously drift upward from the bottom of the screen and fade out near the top, both before and after opening the gift; no layout shift or scrollbar caused by them (`#ambient-hearts` is `position: fixed` with `overflow: hidden`).

- [ ] **Step 4: Commit**

```bash
git add css/style.css js/app.js
git commit -m "feat: add ambient floating hearts background"
```

---

### Task 7: Share section — live link + QR code

**Files:**
- Modify: `js/app.js`

**Interfaces:**
- Consumes: `buildQrImageUrl` (Task 1), `#share-link` and `#qr-code` (Task 4 DOM structure).
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Import the util and populate the share section**

Update the top import line:

```javascript
import content from './content.js';
import { renderMessage, renderWishesList, renderTimeline } from './render.js';
import { buildQrImageUrl } from './utils.js';
```

Add inside `mountContent()`, after the existing lines:

```javascript
  const pageUrl = window.location.href.split('#')[0];
  document.getElementById('share-link').textContent = pageUrl;
  document.getElementById('qr-code').src = buildQrImageUrl(pageUrl);
```

- [ ] **Step 2: Verify in browser**

Reload `http://localhost:4173`, open the gift, scroll to the "Share this gift" section.

Expected: the current page URL is shown as text, and a QR image loads below it (devtools Network tab shows a 200 response from `api.qrserver.com`). Scanning the QR with a phone camera (optional, manual) opens the same URL.

- [ ] **Step 3: Commit**

```bash
git add js/app.js
git commit -m "feat: populate share section with live link and QR code"
```

---

### Task 8: Deploy to GitHub Pages and verify live

**Files:**
- None created/modified — this task pushes existing files and configures hosting.

**Interfaces:**
- Consumes: the complete site from Tasks 1–7.
- Produces: a live URL used in the final verification and as the real "share" artifact.

- [ ] **Step 1: Confirm current branch and gh auth**

Run: `git branch --show-current && gh auth status`
Expected: prints the current branch name (used in Step 3) and `Logged in to github.com account <user>`.

- [ ] **Step 2: Create the GitHub repo and push**

Run (replace `lovey-app` only if a repo with that name already exists under the account):

```bash
gh repo create lovey-app --public --source=. --remote=origin --push
```

Expected: output ending with `✓ Created repository <owner>/lovey-app on GitHub` and a successful push.

- [ ] **Step 3: Enable GitHub Pages from the pushed branch, root path**

Run (substitute `<branch>` with the value from Step 1, e.g. `master`):

```bash
gh api -X POST repos/{owner}/lovey-app/pages -f "source[branch]=<branch>" -f "source[path]=/"
```

Expected: JSON response containing `"status":"building"` and an `"html_url"` field, e.g. `https://<owner>.github.io/lovey-app/`.

- [ ] **Step 4: Poll until the Pages build finishes**

Run: `gh api repos/{owner}/lovey-app/pages`
Expected: `"status":"built"` (may need to re-run every ~20s for up to 2 minutes while it builds).

- [ ] **Step 5: Verify the live site responds**

Run: `curl -s -o /dev/null -w "%{http_code}\n" https://<owner>.github.io/lovey-app/`
Expected: `200`

- [ ] **Step 6: Manual end-to-end check on the live URL**

Open `https://<owner>.github.io/lovey-app/` in a browser. Click "Tap to open 💝".

Expected: identical behavior to the local Task 5–7 verification steps (envelope opens, hearts burst, audio plays, content reveals, ambient hearts drift, share section shows the live `https://<owner>.github.io/lovey-app/` URL and a working QR image pointing at it).

No commit for this task (no source changes) — the live URL is the final deliverable, note it in the PR/handoff message.
