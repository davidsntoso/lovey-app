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
