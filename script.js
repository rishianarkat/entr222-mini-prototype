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

/* ---------- Hero product window ---------- */
const mockDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const WEEK_START = 8, WEEK_HOURS = 14, WEEK_TOP = 32, HOUR_PX = 33;
// [day, start hour, length, title, class]
const mockEvents = [
  [0, 8.5, 1.5, 'Bio lecture'], [2, 8.5, 1.5, 'Bio lecture'], [4, 10, 1.5, 'Bio exam', 'due'],
  [1, 10, 1.5, 'CS lab'], [3, 10, 1.5, 'CS lab'], [1, 14, 1, 'Office hours'], [0, 13, 1, 'Calc'],
  [2, 13, 1, 'Calc'], [4, 14, 1, 'Calc'], [3, 19, 1, 'Robotics Club'], [5, 11, 2, 'Shift'],
  [2, 16, 1.5, 'Study: Bio', 'study'], [3, 20.5, 1.5, 'Study: Bio', 'study'],
];
const mockWeek = $('#mockWeek');
for (let h = 0; h < WEEK_HOURS; h++) {
  const row = document.createElement('div');
  row.className = 'row';
  row.style.top = `${WEEK_TOP + h * HOUR_PX}px`;
  mockWeek.append(row);
}
mockDays.forEach((name, i) => {
  const day = document.createElement('div');
  day.className = 'day';
  day.style.cssText = `left:${(i / 7) * 100}%;width:${100 / 7}%`;
  day.innerHTML = `<span>${name}</span>`;
  mockWeek.append(day);
});
mockEvents.forEach(([d, start, len, title, cls]) => {
  const ev = document.createElement('div');
  ev.className = `ev${cls ? ` ${cls}` : ''}`;
  ev.style.cssText = `left:calc(${(d / 7) * 100}% + 3px);width:calc(${100 / 7}% - 6px);top:${WEEK_TOP + (start - WEEK_START) * HOUR_PX}px;height:${len * HOUR_PX - 2}px`;
  ev.textContent = title;
  mockWeek.append(ev);
});

function updateHero() {
  const p = progress($('#cine'));
  const stage = $('.cine-stage').style;
  const rise = ease(range(p, 0, 0.38));
  const face = ease(range(p, 0.58, 0.74));

  stage.setProperty('--floor', lerp(0.15, 1, rise) * lerp(1, 0.5, face));
  stage.setProperty('--word', range(p, 0.12, 0.34) * (1 - range(p, 0.52, 0.6)));
  stage.setProperty('--word-y', `${lerp(30, 0, rise)}px`);
  stage.setProperty('--copy-a', range(p, 0.3, 0.42) * (1 - range(p, 0.52, 0.58)));
  stage.setProperty('--copy-b', range(p, 0.72, 0.8));
  stage.setProperty('--step-a', range(p, 0.72, 0.77));
  stage.setProperty('--step-b', range(p, 0.8, 0.84));
  stage.setProperty('--step-c', range(p, 0.87, 0.92));

  // Tilted and small behind the headline, then flat and full size
  const fit = Math.min((innerWidth * 0.92) / 860, (innerHeight * 0.64) / 540);
  const scale = fit * lerp(lerp(0.5, 0.62, rise), 1, face);
  const rx = lerp(lerp(84, 58, rise), 0, face);
  const y = lerp(innerHeight * 0.05, -innerHeight * 0.06, face);
  const mock = $('#mock');
  mock.style.transform = `translateY(${y.toFixed(1)}px) perspective(1300px) rotateX(${rx.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
  mock.style.filter = `brightness(${lerp(0.3, 1, rise).toFixed(2)})`;
}

/* ---------- Lens: a day in a calendar ---------- */
const FIRST_HOUR = 6;
const dayEvents = [
  { at: 8.5, len: 1.5, x: 42, w: 42, name: 'Bio lecture', sub: 'Exam Friday, 10:00', mark: 0 },
  { at: 10.5, len: 1.5, x: 42, w: 42, name: 'CS lab', sub: 'Problem set due tonight', mark: 1 },
  { at: 13, len: 1, x: 42, w: 42, name: 'Free', sub: 'Nothing planned', ghost: 1, mark: 2 },
  { at: 14, len: 1, x: 42, w: 21, name: 'Office hours', sub: '14:00', mark: 3 },
  { at: 14, len: 1, x: 63.5, w: 21, name: 'Group project', sub: '14:00', mark: 3 },
  { at: 16, len: 1.5, x: 42, w: 42, name: 'Calc', dim: 1 },
  { at: 19, len: 1, x: 42, w: 42, name: 'Robotics Club', dim: 1 },
  { at: 21.5, len: 1, x: 42, w: 42, name: 'Problem set', sub: 'Due 23:59', mark: 4 },
];
const beats = [
  { time: '08:40', hour: 9.5, text: 'Bio exam on Friday. No study time on your calendar.' },
  { time: '10:30', hour: 11.5, text: 'Problem set’s due tonight. Nothing’s blocked for it.' },
  { time: '13:10', hour: 13.5, text: 'One free hour. Want to use it for bio?' },
  { time: '13:50', hour: 14.5, text: 'Office hours and group project, both at 14:00.' },
  { time: '21:30', hour: 22, text: 'Two and a half hours until that problem set is due.' },
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
function updateApp() {
  const p = progress($('#app'));
  const step = p < 0.36 ? 0 : p < 0.68 ? 1 : 2;
  document.querySelectorAll('.app-line').forEach((l, i) => l.classList.toggle('on', i === step));
  document.querySelectorAll('.pane').forEach((l, i) => l.classList.toggle('on', i === step));
}

function sizePanel() {
  const mobile = innerWidth <= 760;
  const room = mobile ? (innerHeight - 72 - innerHeight * 0.25 - 80) / 620 : (innerHeight - 170) / 620;
  $('#panel').style.setProperty('--s', Math.min(1.05, room).toFixed(3));
}

/* ---------- Roadmap: a messy week tidies itself ---------- */
// Features from the user story map
const versions = [
  ['Release 1', 'Shows your upcoming events.', 5],
  ['Release 1', 'Detects scheduling conflicts.', 5],
  ['Release 1', 'Creates, edits and deletes events from chat.', 3],
  ['Release 1', 'Sets reminders.', 3],
  ['Release 2', 'Suggests free time.', 2],
  ['Release 2', 'Handles multi-step requests.', 1],
  ['Release 2', 'Reschedules events in bulk.', 0],
  ['Release 2', 'Reminds you before you ask.', 0],
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

// Start: [col, y, h, xOffset, widthShare] piled up and overlapping. End: [col, y, h], or null if it goes.
const blocks = [
  [[0, 20, 70, 0, 1], [0, 200, 60]], [[0, 50, 80, 0.3, 0.7], [0, 262, 60]], [[0, 180, 90, 0.1, 0.8], null],
  [[1, 30, 60, 0, 0.6], [1, 200, 60]], [[1, 60, 90, 0.4, 0.6], [1, 262, 60]], [[1, 210, 70, 0, 1], null],
  [[2, 10, 90, 0.1, 0.9], [2, 200, 122]], [[2, 90, 70, 0, 0.6], null], [[2, 130, 60, 0.45, 0.55], null], [[2, 240, 80, 0.2, 0.8], null],
  [[3, 40, 80, 0, 1], [3, 200, 60]], [[3, 90, 90, 0.35, 0.65], [3, 262, 60]], [[3, 250, 70, 0, 0.7], null],
  [[4, 20, 60, 0.2, 0.8], [4, 200, 122]], [[4, 70, 80, 0, 0.6], null], [[4, 120, 90, 0.4, 0.6], null], [[4, 240, 60, 0, 1], null],
];
// The freed mornings: one long study block appears per day
const focus = [0, 1, 2, 3, 4].flatMap((c) => {
  const label = svgEl('text', { x: c * COLW + 24, y: 40 });
  label.textContent = 'Study';
  return [svgEl('rect', { x: c * COLW + 10, y: 16, width: COLW - 20, height: 170, rx: 6 }), label];
});
const blockEls = blocks.map(() => svgEl('rect', { rx: 5 }));
versions.forEach(() => $('#ticks').append(document.createElement('span')));

function updateVelocity() {
  const p = progress($('#velocity'));
  const v = Math.min(versions.length - 1, Math.floor(p * versions.length));
  const t = ease(range(p, 0.04, 0.96));
  const [name, desc, conflicts] = versions[v];
  $('#vName').textContent = name;
  $('#vDesc').textContent = desc;
  $('#vCount').textContent = conflicts;
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

/* ---------- Connect Google Calendar ---------- */
const SCOPE = 'https://www.googleapis.com/auth/calendar.events.readonly';
const EVENTS_URL = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';
const DAY_MS = 86400000;
const connectNote = $('#connectNote');
const defaultNote = connectNote.textContent;
const connectButtons = document.querySelectorAll('[data-connect]');
let accessToken = null;

const setBusy = (busy) => connectButtons.forEach((b) => { b.disabled = busy; });

async function fetchWeek(token) {
  const now = new Date();
  const params = new URLSearchParams({
    timeMin: now.toISOString(),
    timeMax: new Date(now.getTime() + 7 * DAY_MS).toISOString(),
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '50',
  });
  const res = await fetch(`${EVENTS_URL}?${params}`, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`Calendar request failed (${res.status})`);
  const { items = [] } = await res.json();
  return items
    .filter((e) => e.status !== 'cancelled')
    .filter((e) => !e.attendees?.some((a) => a.self && a.responseStatus === 'declined'))
    .map((e) => ({
      title: e.summary || '(No title)',
      allDay: !e.start.dateTime,
      start: new Date(e.start.dateTime || `${e.start.date}T00:00:00`),
      end: new Date(e.end.dateTime || `${e.end.date}T00:00:00`),
      free: e.transparency === 'transparent',
    }));
}

// Only timed events marked busy can clash; all-day ones are usually just labels
function markClashes(events) {
  const busy = events.filter((e) => !e.allDay && !e.free);
  busy.forEach((a) => {
    a.clashWith = busy.find((b) => b !== a && a.start < b.end && b.start < a.end)?.title;
  });
  return busy.filter((e) => e.clashWith).length / 2;
}

function renderWeek(events, sample) {
  const clashes = Math.ceil(markClashes(events));
  const count = `${events.length} event${events.length === 1 ? '' : 's'}`;
  const clashText = clashes ? `${clashes} clash${clashes === 1 ? '' : 'es'} to sort out` : 'no clashes';
  $('#resultSum').textContent = `${sample ? 'Sample week: ' : ''}${count} in the next 7 days, ${clashText}.`;

  const days = $('#resultDays');
  days.replaceChildren();
  let lastDay = '';
  events.forEach((e) => {
    const dayName = e.start.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
    if (dayName !== lastDay) {
      const h = document.createElement('h3');
      h.textContent = dayName;
      days.append(h);
      lastDay = dayName;
    }
    const row = document.createElement('div');
    row.className = `result-ev${e.clashWith ? ' clash' : ''}`;
    const time = document.createElement('time');
    time.textContent = e.allDay ? 'All day' : e.start.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
    const body = document.createElement('div');
    body.textContent = e.title;
    if (e.clashWith) {
      const why = document.createElement('em');
      why.textContent = `Clashes with ${e.clashWith}`;
      body.append(why);
    }
    row.append(time, body);
    days.append(row);
  });
  $('#result').hidden = false;
  $('#disconnect').hidden = sample;
  $('#connect').scrollIntoView({ block: 'start' });
}

// Shown only until a client ID is set in config.js, and labelled as sample data
function sampleWeek() {
  const at = (dayOffset, hour, minute = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + dayOffset);
    d.setHours(hour, minute, 0, 0);
    return d;
  };
  const ev = (title, day, h, len) => ({ title, allDay: false, start: at(day, h), end: new Date(at(day, h).getTime() + len * 3600000) });
  return [
    ev('Bio lecture', 1, 8, 1.5), ev('Office hours', 2, 14, 1), ev('Group project', 2, 14, 1),
    ev('Calc', 3, 13, 1), ev('Robotics Club', 4, 19, 1), ev('Bio exam', 5, 10, 1.5),
  ];
}

async function connected(token) {
  accessToken = token;
  connectNote.textContent = 'Loading your week…';
  try {
    renderWeek(await fetchWeek(token), false);
    connectNote.textContent = 'Connected. Your events stay in this tab and are gone when you close it.';
  } catch (err) {
    console.error(err);
    connectNote.textContent = 'Connected, but your calendar wouldn’t load. Please try again.';
  } finally {
    setBusy(false);
  }
}

function connect() {
  if (!GOOGLE_CLIENT_ID) {
    renderWeek(sampleWeek(), true);
    connectNote.textContent = 'Google sign-in isn’t set up on this copy yet, so this is sample data.';
    return;
  }
  if (!window.google?.accounts?.oauth2) {
    connectNote.textContent = 'Couldn’t reach Google sign-in. Check for an ad blocker and try again.';
    return;
  }
  setBusy(true);
  connectNote.textContent = 'Waiting for Google…';
  google.accounts.oauth2.initTokenClient({
    client_id: GOOGLE_CLIENT_ID,
    scope: SCOPE,
    callback: (res) => {
      if (res.error || !res.access_token) {
        connectNote.textContent = 'Google didn’t grant access, so nothing was connected.';
        setBusy(false);
        return;
      }
      connected(res.access_token);
    },
    error_callback: () => {
      connectNote.textContent = 'Sign-in was closed before it finished. Nothing was connected.';
      setBusy(false);
    },
  }).requestAccessToken();
}

connectButtons.forEach((b) => b.addEventListener('click', connect));

$('#disconnect').addEventListener('click', () => {
  if (accessToken) google.accounts.oauth2.revoke(accessToken);
  accessToken = null;
  $('#result').hidden = true;
  $('#resultDays').replaceChildren();
  connectNote.textContent = defaultNote;
});

/* ---------- Dock ---------- */
function updateDock() {
  const r = $('#connect').getBoundingClientRect();
  $('#dock').classList.toggle('off', r.top < innerHeight * 0.75);
}

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
addEventListener('resize', () => { sizePanel(); queue(); });
sizePanel();
render();
