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
