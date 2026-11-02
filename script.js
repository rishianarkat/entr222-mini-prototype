const $ = (s) => document.querySelector(s);
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const range = (p, a, b) => clamp((p - a) / (b - a));
const ease = (t) => t * t * (3 - 2 * t);

// How far the viewport has travelled through a sticky section, 0 to 1
const progress = (el) => {
  const r = el.getBoundingClientRect();
  return clamp(-r.top / (r.height - innerHeight));
};

const add = (parent, css, cls) => {
  const i = document.createElement('i');
  if (cls) i.className = cls;
  Object.assign(i.style, css);
  parent.append(i);
  return i;
};
const pct = (n) => `${n}%`;

/* ---------- Hero calendar ---------- */
const plates = [...document.querySelectorAll('.plate')];
const callouts = plates.map((p) => {
  const el = document.createElement('div');
  el.className = 'callout';
  el.textContent = p.dataset.label;
  $('#callouts').append(el);
  return el;
});

for (let i = 0; i < 35; i++) add($('.plate-grid'), {});
[[8, 6, 60], [22, 30, 54], [38, 12, 74], [55, 44, 40], [71, 18, 70], [88, 34, 50]].forEach(([top, left, width]) =>
  add($('.plate-threads'), { top: pct(top), left: pct(left), width: pct(width) }));
[[12, 18], [24, 66], [33, 40], [46, 84], [58, 25], [64, 58], [78, 12], [84, 72], [18, 90], [50, 48]].forEach(([top, left]) =>
  add($('.plate-memory'), { top: pct(top), left: pct(left) }));
// Blocks sit on the grid: column / 7 and row / 5
[[0, 0, 2, 0], [2, 1, 1, 0], [4, 0, 2, 0], [1, 2, 1, 1], [3, 2, 2, 0], [0, 3, 1, 0], [5, 3, 1, 1], [2, 4, 3, 0]].forEach(([col, row, span, hot]) =>
  add($('.plate-events'), {
    left: pct((col / 7) * 100 + 0.8),
    top: pct((row / 5) * 100 + 4),
    width: pct((span / 7) * 100 - 1.6),
    height: pct(12),
  }, hot ? 'hot' : ''));

function updateHero() {
  const p = progress($('#cine'));
  const stage = $('.cine-stage').style;
  const rise = ease(range(p, 0, 0.38));
  const explode = ease(range(p, 0.62, 0.86));

  stage.setProperty('--floor', lerp(0.15, 1, rise));
  stage.setProperty('--word', range(p, 0.12, 0.34) * (1 - range(p, 0.56, 0.66)));
  stage.setProperty('--word-y', `${lerp(30, 0, rise)}px`);
  stage.setProperty('--copy-a', range(p, 0.3, 0.42) * (1 - range(p, 0.56, 0.64)));
  stage.setProperty('--copy-b', range(p, 0.76, 0.86));
  stage.setProperty('--explode', range(p, 0.72, 0.86));

  const rx = lerp(84, 62, rise) + lerp(0, -4, explode);
  const rz = lerp(-14, 0, rise) + lerp(0, -30, explode);
  const cal = $('#cal');
  cal.style.transform = `translateY(${lerp(0, 2, rise) + lerp(0, 16, explode)}%) translateX(${lerp(0, innerWidth > 760 ? 10 : 0, explode)}vw) rotateX(${rx}deg) rotateZ(${rz}deg) scale(${lerp(0.92, 1, rise)})`;

  // Bigger gaps between plates once it comes apart; they rest almost flush before that
  const gap = Math.min(innerHeight * 0.1, 90);
  plates.forEach((plate, i) => {
    plate.style.transform = `translateZ(${(i * (2 + explode * gap)).toFixed(1)}px)`;
    plate.style.filter = i === 0 ? `brightness(${lerp(0.35, 1, rise)})` : '';
    if (i) plate.style.opacity = i === 3 ? lerp(0.25, 1, rise) : explode * 0.95;
  });

  // Hang each label off the right corner of its plate
  if (explode > 0.01) {
    plates.forEach((plate, i) => {
      const r = plate.getBoundingClientRect();
      const w = callouts[i].offsetWidth;
      const x = Math.min(r.right - r.width * 0.06, innerWidth - w - 12);
      callouts[i].style.transform = `translate(${x}px, ${r.top + r.height * 0.42}px)`;
    });
  }
}

/* ---------- Lens: a day in a calendar ---------- */
const FIRST_HOUR = 6;
const dayEvents = [
  { at: 7, len: 1, x: 42, w: 42, name: 'Gym', sub: 'Recurring, 3 weeks unattended', mark: 0 },
  { at: 8.5, len: 0.5, x: 42, w: 42, name: 'Inbox', dim: 1 },
  { at: 9.5, len: 1, x: 42, w: 42, name: 'Weekly sync', sub: '9 people', mark: 1 },
  { at: 11, len: 1, x: 42, w: 42, name: 'Hiring review', dim: 1 },
  { at: 13, len: 1, x: 42, w: 42, name: 'Lunch?', sub: 'Nothing held', ghost: 1, mark: 2 },
  { at: 14, len: 1, x: 42, w: 21, name: 'Dana, intro', sub: '2:00', mark: 3 },
  { at: 14, len: 1, x: 63.5, w: 21, name: 'Sam, 1:1', sub: '2:00', mark: 3 },
  { at: 15.5, len: 1.5, x: 42, w: 42, name: 'Investor call', dim: 1 },
  { at: 18, len: 1, x: 42, w: 42, name: 'Team dinner', dim: 1 },
  { at: 21.5, len: 1, x: 42, w: 42, name: 'Red-eye to Boston', sub: 'Lands 06:10. First call 07:30', mark: 4 },
];
const beats = [
  { time: '07:05', hour: 7.5, text: 'Gym’s still on here. You haven’t gone in three weeks.' },
  { time: '09:40', hour: 10, text: 'Rescheduled four times. Nobody would notice if it went.' },
  { time: '13:10', hour: 13.5, text: 'No lunch since Monday.' },
  { time: '14:00', hour: 14.5, text: 'Two people think they have you at 2.' },
  { time: '21:40', hour: 22, text: 'Red-eye tonight. Your first call is still at 7:30.' },
];

const lensDay = $('#lensDay');
for (let h = FIRST_HOUR; h <= 23; h++) {
  const row = document.createElement('div');
  row.className = 'hour-row';
  row.style.top = `calc(${h - FIRST_HOUR} * var(--hour))`;
  row.innerHTML = `<span>${String(h).padStart(2, '0')}:00</span>`;
  lensDay.append(row);
}
const eventEls = dayEvents.map((e) => {
  const el = document.createElement('div');
  el.className = `day-event${e.dim ? ' dim' : ''}${e.ghost ? ' ghost' : ''}`;
  el.style.cssText = `top:calc(${e.at - FIRST_HOUR} * var(--hour) + 2px);height:calc(${e.len} * var(--hour) - 4px);left:${e.x}%;width:${e.w}%`;
  el.innerHTML = `${e.name}${e.sub ? `<small>${e.sub}</small>` : ''}`;
  lensDay.append(el);
  return el;
});
beats.forEach((b) => {
  const tab = document.createElement('span');
  tab.textContent = b.time;
  $('#lensTabs').append(tab);
  const li = document.createElement('li');
  li.innerHTML = `<span class="note-tag">${b.time} · Noticing…</span><p>${b.text}</p>`;
  $('#lensNotes').append(li);
});

function updateLens() {
  const p = progress($('#day'));
  const end = range(p, 0.9, 0.95) > 0;
  const t = range(p, 0, 0.88) * beats.length;
  const beat = Math.min(beats.length - 1, Math.floor(t));
  const local = t - beat;

  // Hold on each beat, then glide to the next
  const glide = ease(range(local, 0.72, 1));
  const next = beats[Math.min(beats.length - 1, beat + 1)];
  const hour = lerp(beats[beat].hour, next.hour, glide);
  const hourPx = 110;
  const anchor = innerHeight * 0.5;
  lensDay.style.setProperty('--pan', `${(anchor - (hour - FIRST_HOUR) * hourPx).toFixed(1)}px`);

  [...$('#lensTabs').children].forEach((c, i) => c.classList.toggle('on', i === beat));
  [...$('#lensNotes').children].forEach((c, i) => c.classList.toggle('on', i === beat && !end));
  eventEls.forEach((el, i) => el.classList.toggle('marked', dayEvents[i].mark === beat));
  $('#lensEnd').classList.toggle('on', end);
}

/* ---------- Thesis fill ---------- */
const fillText = $('#fillText');
fillText.innerHTML = fillText.textContent.split(' ').map((w) => `<span>${w}</span>`).join(' ');
const fillWords = [...fillText.children];

function updateFill() {
  const lit = Math.round(progress($('#thesis')) * 1.15 * fillWords.length);
  fillWords.forEach((w, i) => w.classList.toggle('on', i < lit));
}

/* ---------- App ---------- */
const barHeights = [62, 40, 72, 38, 66, 36, 76, 70, 42, 64, 34, 74, 38, 78];
barHeights.forEach((h) => add($('#patBars'), { '--h': `${h}%` }, h < 50 ? 'low' : ''));
[...$('#patBars').children].forEach((bar, i) => bar.style.setProperty('--h', `${barHeights[i]}%`));
const countEls = [...document.querySelectorAll('[data-count]')];

function updateApp() {
  const p = progress($('#app'));
  const step = p < 0.42 ? 0 : p < 0.66 ? 1 : 2;
  document.querySelectorAll('.app-line').forEach((l, i) => l.classList.toggle('on', i === step));

  const tl = $('#timeline');
  const overflow = Math.max(0, tl.scrollHeight - tl.parentElement.clientHeight + 20);
  tl.style.setProperty('--tl', `${(-overflow * ease(range(p, 0.04, 0.4))).toFixed(1)}px`);

  countEls.forEach((el) => {
    const target = Number(el.dataset.count);
    const v = target * ease(range(p, 0, 0.3));
    el.textContent = Number.isInteger(target) ? Math.round(v) : v.toFixed(1);
  });

  $('#notify').classList.toggle('on', step === 1);
  $('#patterns').classList.toggle('on', step === 2);
  [...$('#phoneTabs').children].forEach((t, i) => t.classList.toggle('on', i === (step === 2 ? 1 : 0)));
  $('#patNum').textContent = `−${Math.round(6 * ease(range(p, 0.7, 0.86)))}`;
}

function sizePhone() {
  const mobile = innerWidth <= 760;
  const room = mobile ? (innerHeight - 72 - innerHeight * 0.25) / 660 : (innerHeight - 84) / 660;
  const s = Math.min(mobile ? 0.9 : 1.05, room);
  $('#phone').style.setProperty('--s', s.toFixed(3));
}

/* ---------- Versions: a messy week tidies itself ---------- */
const versions = [
  ['v1', 'Reads your calendar.', 31],
  ['v2', 'Flags what looks wrong.', 29],
  ['v3', 'Suggests a better week.', 26],
  ['v4', 'Drafts the emails for you.', 23],
  ['v5', 'Books and moves meetings.', 20],
  ['v6', 'Negotiates with other people’s calendars.', 17],
  ['v7', 'Protects what you said mattered.', 14],
  ['v8', 'Decides. You check in on Fridays.', 12],
];
const W = 980, H = 340, COLS = 5, COLW = W / COLS;
const week = $('#week');
const svgEl = (tag, attrs) => {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  week.append(el);
  return el;
};
svgEl('rect', { class: 'frame', x: 0.5, y: 0.5, width: W - 1, height: H - 1, rx: 8 });
for (let c = 1; c < COLS; c++) svgEl('line', { x1: c * COLW, x2: c * COLW, y1: 0, y2: H });

// Start: [col, y, h, xOffset, widthShare] piled up and overlapping. End: [col, y, h], one tidy afternoon a day.
const blocks = [
  [[0, 20, 70, 0, 1], [0, 200, 60]], [[0, 50, 80, 0.3, 0.7], [0, 262, 60]], [[0, 180, 90, 0.1, 0.8], null],
  [[1, 30, 60, 0, 0.6], [1, 200, 60]], [[1, 60, 90, 0.4, 0.6], [1, 262, 60]], [[1, 210, 70, 0, 1], null],
  [[2, 10, 90, 0.1, 0.9], [2, 200, 122]], [[2, 90, 70, 0, 0.6], null], [[2, 130, 60, 0.45, 0.55], null], [[2, 240, 80, 0.2, 0.8], null],
  [[3, 40, 80, 0, 1], [3, 200, 60]], [[3, 90, 90, 0.35, 0.65], [3, 262, 60]], [[3, 250, 70, 0, 0.7], null],
  [[4, 20, 60, 0.2, 0.8], [4, 200, 122]], [[4, 70, 80, 0, 0.6], null], [[4, 120, 90, 0.4, 0.6], null], [[4, 240, 60, 0, 1], null],
];
// The freed mornings: one long focus block appears per day
const focus = [0, 1, 2, 3, 4].flatMap((c) => {
  const label = svgEl('text', { x: c * COLW + 24, y: 40 });
  label.textContent = 'Focus';
  return [svgEl('rect', { x: c * COLW + 10, y: 16, width: COLW - 20, height: 170, rx: 6 }), label];
});
const blockEls = blocks.map(() => svgEl('rect', { rx: 5 }));
versions.forEach(() => $('#ticks').append(document.createElement('span')));

function updateVelocity() {
  const p = progress($('#velocity'));
  const v = Math.min(versions.length - 1, Math.floor(p * versions.length));
  const t = ease(range(p, 0.04, 0.96));
  const [name, desc, hours] = versions[v];
  $('#vName').textContent = name;
  $('#vDesc').textContent = desc;
  $('#vHours').textContent = hours;
  [...$('#ticks').children].forEach((c, i) => c.classList.toggle('on', i <= v));

  blocks.forEach(([[col, y, h, off, share], end], i) => {
    const sx = col * COLW + 10 + off * (COLW - 20);
    const sw = share * (COLW - 20);
    const ex = (end ? end[0] : col) * COLW + 10;
    const el = blockEls[i];
    // Blocks with no place in the tidy week shrink away
    const fade = end ? 1 : 1 - range(t, 0.2, 0.7);
    el.setAttribute('x', lerp(sx, ex, t).toFixed(1));
    el.setAttribute('y', lerp(y, end ? end[1] : y, t).toFixed(1));
    el.setAttribute('width', lerp(sw, COLW - 20, t).toFixed(1));
    el.setAttribute('height', Math.max(0.01, lerp(h, end ? end[2] : h, t) - 2).toFixed(1));
    el.setAttribute('opacity', fade.toFixed(2));
    el.classList.toggle('clash', t < 0.35 && i % 3 === 1);
  });
  focus.forEach((f) => f.setAttribute('opacity', range(t, 0.65, 1).toFixed(2)));
}

/* ---------- Dock and waitlist ---------- */
function updateDock() {
  const r = $('#join').getBoundingClientRect();
  $('#dock').classList.toggle('off', r.top < innerHeight * 0.75);
}

// A mock: nothing leaves the page
$('#wlForm').addEventListener('submit', (e) => {
  e.preventDefault();
  e.target.reset();
  $('#wlNote').textContent = 'You’re on the list. (Not really: this is a class mock-up, and nothing was sent.)';
});

/* ---------- Loop ---------- */
let queued = false;
function render() {
  queued = false;
  updateHero();
  updateLens();
  updateFill();
  updateApp();
  updateVelocity();
  updateDock();
}
function queue() {
  if (queued) return;
  queued = true;
  requestAnimationFrame(render);
}
addEventListener('scroll', queue, { passive: true });
addEventListener('resize', () => { sizePhone(); queue(); });
sizePhone();
render();
