if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);
window.addEventListener('pageshow', () => window.scrollTo(0, 0));
document.documentElement.classList.add('intro-open');

const giftButton = document.querySelector('.gift');
const toast = document.querySelector('.toast');
const calendarButton = document.querySelector('.calendar');
const locationButton = document.querySelector('.location');
const locationModal = document.querySelector('#locationModal');
const giftModal = document.querySelector('#giftModal');
const invitationAudio = document.querySelector('#invitationAudio');
const audioToggle = document.querySelector('#audioToggle');
const introScreen = document.querySelector('#introScreen');
let introEntered = false;

async function enterInvitation(withMusic) {
  if (introEntered) return;
  introEntered = true;
  window.scrollTo(0, 0);
  if (withMusic) {
    try {
      await invitationAudio.play();
      audioToggle.classList.add('playing');
      audioToggle.setAttribute('aria-pressed', 'true');
      audioToggle.setAttribute('aria-label', 'Pausar música');
    } catch { /* El control flotante permite reintentar. */ }
  } else {
    invitationAudio.pause();
  }
  const burst = document.querySelector('#introBurst');
  for (let index = 0; index < 42; index += 1) {
    const particle = document.createElement('i');
    const angle = Math.random() * Math.PI * 2;
    const distance = 45 + Math.random() * 70;
    particle.className = 'intro-particle';
    particle.style.setProperty('--x', `${Math.cos(angle) * distance}vw`);
    particle.style.setProperty('--y', `${Math.sin(angle) * distance}vh`);
    particle.style.setProperty('--delay', `${Math.random() * .16}s`);
    burst.appendChild(particle);
  }
  introScreen.classList.add('departing');
  window.setTimeout(() => introScreen.classList.add('leaving'), 720);
  window.setTimeout(() => {
    document.documentElement.classList.remove('intro-open');
    introScreen.remove();
  }, 1500);
}

document.querySelector('#enterWithMusic')?.addEventListener('click', () => enterInvitation(true));
document.querySelector('#enterWithoutMusic')?.addEventListener('click', () => enterInvitation(false));

audioToggle?.addEventListener('click', async () => {
  if (invitationAudio.paused) {
    try {
      await invitationAudio.play();
      audioToggle.classList.add('playing');
      audioToggle.setAttribute('aria-pressed', 'true');
      audioToggle.setAttribute('aria-label', 'Pausar música');
      navigator.vibrate?.(35);
    } catch {
      audioToggle.classList.remove('playing');
    }
  } else {
    invitationAudio.pause();
    audioToggle.classList.remove('playing');
    audioToggle.setAttribute('aria-pressed', 'false');
    audioToggle.setAttribute('aria-label', 'Reproducir música');
  }
});

invitationAudio?.addEventListener('pause', () => audioToggle.classList.remove('playing'));
invitationAudio?.addEventListener('play', () => audioToggle.classList.add('playing'));

const countdownTarget = new Date('2026-11-07T22:00:00-03:00').getTime();
const countdownFields = {
  days: document.querySelector('#days'),
  hours: document.querySelector('#hours'),
  minutes: document.querySelector('#minutes'),
  seconds: document.querySelector('#seconds')
};

function updateCountdown() {
  const remaining = Math.max(0, countdownTarget - Date.now());
  const totalSeconds = Math.floor(remaining / 1000);
  const values = {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60
  };
  Object.entries(values).forEach(([key, value]) => {
    if (countdownFields[key]) countdownFields[key].textContent = String(value).padStart(2, '0');
  });
}

updateCountdown();
window.setInterval(updateCountdown, 1000);

const dateReveal = document.querySelector('#dateReveal');
const revealCanvas = document.querySelector('#revealCanvas');
const revealContext = revealCanvas?.getContext('2d');
const magicTrail = document.querySelector('#magicTrail');
let revealDrawing = false;
let revealComplete = false;
let revealGateActive = false;
let revealDistance = 0;
let lastRevealPoint = null;

function activateRevealGate() {
  if (revealGateActive || revealComplete) return;
  revealGateActive = true;
  dateReveal.classList.add('gate-active');
  document.documentElement.classList.add('reveal-locked');
  sizeRevealCanvas();
  requestAnimationFrame(() => requestAnimationFrame(() => dateReveal.classList.add('gate-visible')));
}

function sizeRevealCanvas() {
  if (!revealCanvas || revealComplete) return;
  const rect = revealCanvas.getBoundingClientRect();
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  revealCanvas.width = Math.round(rect.width * ratio);
  revealCanvas.height = Math.round(rect.height * ratio);
  revealContext.setTransform(ratio, 0, 0, ratio, 0, 0);
  const gradient = revealContext.createLinearGradient(0, 0, 0, rect.height);
  gradient.addColorStop(0, '#020c1e');
  gradient.addColorStop(.48, '#081b36');
  gradient.addColorStop(1, '#020b1b');
  revealContext.globalCompositeOperation = 'source-over';
  revealContext.fillStyle = gradient;
  revealContext.fillRect(0, 0, rect.width, rect.height);
  for (let index = 0; index < 100; index += 1) {
    const x = Math.random() * rect.width;
    const y = Math.random() * rect.height;
    const radius = Math.random() * 1.2 + .25;
    revealContext.beginPath();
    revealContext.arc(x, y, radius, 0, Math.PI * 2);
    revealContext.fillStyle = `rgba(230,235,245,${Math.random() * .65})`;
    revealContext.fill();
  }
}

function revealPoint(event) {
  const rect = revealCanvas.getBoundingClientRect();
  return { x: event.clientX - rect.left, y: event.clientY - rect.top };
}

function scratchBetween(from, to) {
  const distance = Math.hypot(to.x - from.x, to.y - from.y);
  revealDistance += distance;
  revealContext.globalCompositeOperation = 'destination-out';
  revealContext.lineWidth = Math.max(58, revealCanvas.clientWidth * .16);
  revealContext.lineCap = 'round';
  revealContext.lineJoin = 'round';
  revealContext.beginPath();
  revealContext.moveTo(from.x, from.y);
  revealContext.lineTo(to.x, to.y);
  revealContext.stroke();
  revealContext.globalCompositeOperation = 'source-over';
  addMagicTrail(to);
  if (revealDistance >= revealCanvas.clientWidth * 4.4) finishReveal();
}

function addMagicTrail(point) {
  for (let index = 0; index < 3; index += 1) {
    const star = document.createElement('span');
    star.className = 'trail-star';
    star.style.left = `${point.x + (Math.random() - .5) * 34}px`;
    star.style.top = `${point.y + (Math.random() - .5) * 34}px`;
    star.style.animationDelay = `${Math.random() * .12}s`;
    magicTrail.appendChild(star);
    window.setTimeout(() => star.remove(), 1000);
  }
}

function finishReveal() {
  revealComplete = true;
  revealDrawing = false;
  dateReveal.classList.add('revealed');
  window.setTimeout(() => {
    dateReveal.classList.remove('gate-active', 'gate-visible');
    revealCanvas.remove();
    magicTrail.remove();
    dateReveal.scrollIntoView({ block: 'start' });
    document.documentElement.classList.remove('reveal-locked');
  }, 850);
}

revealCanvas?.addEventListener('pointerdown', (event) => {
  if (revealComplete) return;
  revealDrawing = true;
  revealCanvas.setPointerCapture(event.pointerId);
  lastRevealPoint = revealPoint(event);
  dateReveal.classList.add('revealing');
});
revealCanvas?.addEventListener('pointermove', (event) => {
  if (!revealDrawing || revealComplete) return;
  const point = revealPoint(event);
  scratchBetween(lastRevealPoint, point);
  lastRevealPoint = point;
});
revealCanvas?.addEventListener('pointerup', () => { revealDrawing = false; lastRevealPoint = null; });
revealCanvas?.addEventListener('pointercancel', () => { revealDrawing = false; lastRevealPoint = null; });
window.addEventListener('resize', sizeRevealCanvas);
requestAnimationFrame(sizeRevealCanvas);

const revealObserver = new IntersectionObserver((entries) => {
  if (introEntered && entries.some((entry) => entry.isIntersecting)) activateRevealGate();
}, { threshold: .18 });
if (dateReveal) revealObserver.observe(dateReveal);

const musicScene = document.querySelector('#musicScene');
function activateMusicEffect() {
  if (musicScene.classList.contains('music-active')) return;
  musicScene.classList.add('music-active');
  for (let index = 0; index < 28; index += 1) {
    const star = document.createElement('span');
    star.className = 'trail-star';
    star.style.left = `${18 + Math.random() * 64}%`;
    star.style.top = `${38 + Math.random() * 30}%`;
    star.style.animationDelay = `${Math.random() * .45}s`;
    musicScene.querySelector('.music-magic').appendChild(star);
    window.setTimeout(() => star.remove(), 1500);
  }
}

const musicObserver = new IntersectionObserver((entries) => {
  if (entries.some((entry) => entry.isIntersecting)) {
    activateMusicEffect();
    musicObserver.disconnect();
  }
}, { threshold: .3 });
if (musicScene) musicObserver.observe(musicScene);

function notify(message) {
  toast.textContent = message;
  toast.classList.add('show');
  window.setTimeout(() => toast.classList.remove('show'), 2200);
}

giftButton?.addEventListener('click', () => giftModal.showModal());
document.querySelector('.gift-close')?.addEventListener('click', () => giftModal.close());
document.querySelector('.copy-alias')?.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText('bianncaaguirreee-');
    notify('Alias copiado');
  } catch {
    notify('Alias: bianncaaguirreee-');
  }
});

calendarButton?.addEventListener('click', () => {
  const event = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//XV Bianca//ES', 'BEGIN:VEVENT',
    'UID:xv-bianca-20261107@gammal', 'DTSTAMP:20260826T120000Z',
    'DTSTART:20261108T010000Z', 'DTEND:20261108T080000Z',
    'SUMMARY:XV de Bianca', 'LOCATION:Gammal - Calle Alegre\, San Ramón - La Banda',
    'DESCRIPTION:Fiesta de XV de Bianca. Dress code: formal sport.',
    'END:VEVENT', 'END:VCALENDAR'
  ].join('\r\n');
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([event], { type: 'text/calendar;charset=utf-8' }));
  link.download = 'XV-Bianca.ics';
  link.click();
  URL.revokeObjectURL(link.href);
});

locationButton?.addEventListener('click', () => locationModal.showModal());
document.querySelector('.location-close')?.addEventListener('click', () => locationModal.close());
document.querySelector('.copy-address')?.addEventListener('click', async () => {
  const address = 'Gammal, Calle Alegre, San Ramón, La Banda';
  try {
    await navigator.clipboard.writeText(address);
    notify('Dirección copiada');
  } catch {
    notify(address);
  }
});

const galleryModal = document.querySelector('#galleryModal');
const galleryModalImage = galleryModal?.querySelector('img');

document.querySelectorAll('.gallery-photo').forEach((photo) => {
  photo.addEventListener('click', () => {
    galleryModalImage.src = photo.dataset.full;
    galleryModalImage.alt = photo.querySelector('img')?.alt || 'Foto ampliada de Bianca';
    galleryModal.showModal();
  });
});

document.querySelector('.gallery-modal-close')?.addEventListener('click', () => galleryModal.close());
galleryModal?.addEventListener('click', (event) => {
  if (event.target === galleryModal) galleryModal.close();
});
