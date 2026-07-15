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
