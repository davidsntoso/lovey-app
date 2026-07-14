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
