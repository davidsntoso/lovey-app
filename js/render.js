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
