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

function init() {
  mountContent();
  document.getElementById('open-btn').addEventListener('click', openGift, { once: true });
  setInterval(spawnAmbientHeart, 900);
}

init();
