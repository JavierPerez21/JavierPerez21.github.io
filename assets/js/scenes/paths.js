/**
 * §02 · Probability: Monte Carlo paths of a life.
 *
 * An ensemble of arithmetic Brownian motions dX = μ dt + σ dW all start at
 * the same point. Once cued, they appear one by one and then in a flood. The
 * realised path is a Brownian bridge pinned through the milestones in
 * content.js (each sitting z σ above the ensemble mean); scroll drives its
 * clock, and each milestone it reaches pops out of the line and drops into a
 * timeline under the plot. The line stops at "now": the future is sampled
 * by scrolling on (see scenes/descent.js), and flows down into §03.
 */
import { rng } from '../lib/rng.js';
import { clamp, cssVar, el, hidpi, invLerp, isCoarse, lerp, smooth, visibleLoop } from '../lib/util.js';

const T0 = 2015.75;
const T1 = 2029.5;
const DT = 1 / 12;
const MU = 0.5;
const SIGMA = 1.0;
const ME = 1729; // the path label (Hardy–Ramanujan, naturally)
const GEN_TAU = 0.26; // path k appears at GEN_TAU·ln(k + 2) s: one by one, then a flood
const TRACE0 = 0.45; // seconds the first path takes to draw itself; later ones are quicker
const LIFE_SPEED = 2; // years of my path drawn per second
const MS_HOLD = 0.3; // seconds the line pauses on each milestone
const NOW_HOLD = 0.8; // ...and on "now"
const SVG = 'http://www.w3.org/2000/svg';

export function lifePaths({ section, canvas, timelineRoot, hud, replayBtn, milestones, orgs = {}, now }) {
  const ink = cssVar('--ink') || '#121212';
  const accent = cssVar('--accent') || '#ff4d1f';
  const paper = cssVar('--paper') || '#f3f1eb';
  const mono = cssVar('--mono') || 'monospace';
  const setText = (node, txt) => { if (node && node.textContent !== txt) node.textContent = txt; };
  const nPaths = isCoarse() || window.innerWidth < 700 ? 900 : 2048;
  const iNow = Math.round((now - T0) / DT);
  const tAt = (i) => T0 + i * DT;
  const iOf = (t) => Math.round((t - T0) / DT);

  /* ---------- simulate ---------- */
  const rand = rng(20160421);
  const ensemble = [];
  for (let p = 0; p < nPaths; p++) {
    const a = new Float32Array(iNow + 1);
    for (let i = 1; i <= iNow; i++) a[i] = a[i - 1] + MU * DT + SIGMA * Math.sqrt(DT) * rand.normal();
    ensemble.push(a);
  }

  const pins = [{ i: 0, y: 0 }, ...milestones.map((m) => ({
    i: iOf(m.t),
    y: MU * (m.t - T0) + m.z * SIGMA * Math.sqrt(m.t - T0),
  }))];
  const me = new Float32Array(iNow + 1);
  for (let k = 0; k < pins.length - 1; k++) {
    const a = pins[k], b = pins[k + 1];
    const n = b.i - a.i;
    if (n <= 0) continue;
    const w = new Float32Array(n + 1);
    for (let j = 1; j <= n; j++) w[j] = w[j - 1] + SIGMA * 0.85 * Math.sqrt(DT) * rand.normal();
    for (let j = 0; j <= n; j++) {
      const u = j / n;
      me[a.i + j] = a.y + (b.y - a.y) * u + (w[j] - u * w[n]);
    }
  }

  // Headroom for the futures that sprout from "now" (about their p85 at T1).
  const last = Float32Array.from(ensemble, (a) => a[iNow]).sort();
  const yLo = Math.min(last[Math.floor(nPaths * 0.004)], -1) - 0.6;
  const yHi = me[iNow] + MU * (T1 - now) + 1.0 * SIGMA * Math.sqrt(T1 - now) + 0.6;

  /* ---------- generation schedule ---------- */
  const appearAt = (k) => GEN_TAU * Math.log(k + 2);
  const traceFor = (k) => TRACE0 * Math.exp(-k / 5);
  const highlight = (k) => k < 6 || k % Math.floor(nPaths / 24) === 0;

  /* ---------- timeline of milestones ---------- */
  /** The organisation's mark, small, for the corner of a card. */
  const orgBadge = (o) => (o?.icon ? el('img.ms-logo', { src: o.icon, alt: o.name, title: o.name, draggable: 'false' }) : null);

  const INTRO = `${nPaths.toLocaleString('en')} random walks from the same starting point. The orange one is mine.`;
  const caption = el('p.ms-caption', {}, INTRO);
  const leaders = document.createElementNS(SVG, 'svg');
  leaders.setAttribute('class', 'ms-leaders');
  leaders.setAttribute('aria-hidden', 'true');
  const lines = milestones.map(() => leaders.appendChild(document.createElementNS(SVG, 'line')));
  const cards = milestones.map((m, k) =>
    el('li.ms-card', {
      style: { zIndex: k + 1 },
      tabindex: '-1',
      role: m.detail ? 'button' : null,
      'aria-haspopup': m.detail ? 'dialog' : null,
      'aria-label': m.detail ? `${m.when}: ${m.title}. Open details` : null,
    },
    el('span.ms-head', {}, orgBadge(orgs[m.org]), el('span.ms-when', {}, m.when)), // logo left: fanned cards cover each other's right edge
    el('span.ms-title', {}, m.title),
    m.detail ? el('span.ms-more', { 'aria-hidden': 'true' }, '+') : null));
  const band = el('div.ms-band', {}, leaders, el('ol.ms-cards', { 'aria-label': 'Milestones' }, cards));
  timelineRoot.append(caption, band);

  /* ---------- a card, opened ---------- */
  // Clicking a card grows it (FLIP: from the card's own box) into a larger
  // panel over the plot, with the details of that milestone. The life line
  // waits while it is open.
  const stage = timelineRoot.closest('.paths-sticky') || section;
  const scrim = el('div.ms-scrim', { 'aria-hidden': 'true', onclick: () => closeCard() });
  const panel = el('div.ms-detail', { role: 'dialog', 'aria-modal': 'true', 'aria-hidden': 'true', tabindex: '-1' });
  stage.append(scrim, panel);
  let openK = -1, panelAnim = null, lastFocus = null;

  function fillPanel(k) {
    const m = milestones[k], d = m.detail, o = orgs[m.org];
    const logo = o?.logo ? el('img.ms-d-logo', { src: o.logo, alt: o.name }) : null;
    panel.replaceChildren(el('div.ms-d-inner', {},
      el('button.ms-close', { type: 'button', 'aria-label': 'Close details', onclick: () => closeCard() }, '×'),
      el('div.ms-d-head', {},
        el('span.ms-when', {}, m.when),
        logo && (o.href ? el('a.ms-d-org', { href: o.href, target: '_blank', rel: 'noopener', title: o.name }, logo) : logo)),
      el('h3.ms-d-title', { id: `ms-d-${k}` }, m.title),
      m.where ? el('p.ms-d-where', {}, m.where) : null,
      el(`div.ms-d-body${d.image ? '.has-image' : ''}`, {},
        el('div.ms-d-text', {},
          el('p.ms-d-summary', {}, d.summary),
          d.points?.length ? el('p.ms-d-label', {}, 'Highlights') : null,
          d.points?.length ? el('ul.ms-d-points', {}, d.points.map((t) => el('li', {}, t))) : null),
        d.image ? el('figure.ms-d-figure', {}, el('img', { src: d.image, alt: '', loading: 'lazy' })) : null),
      d.links?.length
        ? el('p.ms-d-links', {}, d.links.map((l) => el('a.btn.btn--ghost.btn--sm', l.href.startsWith('#')
          ? { href: l.href, onclick: () => closeCard(true) }
          : { href: l.href, target: '_blank', rel: 'noopener' }, `${l.label} ↗`)))
        : null));
    panel.setAttribute('aria-labelledby', `ms-d-${k}`);
  }

  /** The card's box, relative to the stage. */
  function boxOf(node) {
    const a = node.getBoundingClientRect(), b = stage.getBoundingClientRect();
    return { x: a.left - b.left, y: a.top - b.top, w: a.width, h: a.height };
  }

  function openCard(k) {
    if (!milestones[k].detail || !shown[k]) return;
    if (openK >= 0) closeCard(true);
    openK = k;
    lastFocus = document.activeElement;
    fillPanel(k);
    const sw = stage.clientWidth, sh = stage.clientHeight;
    const w = Math.min(680, sw - 32);
    panel.style.width = `${w}px`;
    panel.style.maxHeight = `${Math.max(240, sh - 140)}px`;
    panel.classList.add('is-open');
    panel.setAttribute('aria-hidden', 'false');
    const h = panel.offsetHeight;
    const to = { x: (sw - w) / 2, y: clamp((sh - h) / 2 + 20, 84, Math.max(84, sh - h - 16)) };
    panel.style.left = `${to.x}px`;
    panel.style.top = `${to.y}px`;
    const from = boxOf(cards[k]);
    cards[k].classList.add('is-lifted');
    scrim.classList.add('is-on');
    panelAnim?.cancel();
    panelAnim = panel.animate([
      { transform: `translate(${from.x - to.x}px, ${from.y - to.y}px) scale(${from.w / w}, ${from.h / h})`, borderRadius: '10px' },
      { transform: 'none', borderRadius: '16px' },
    ], { duration: 460, easing: 'cubic-bezier(.2, .8, .2, 1)' });
    panel.classList.remove('is-ready');
    panelAnim.onfinish = () => { panel.classList.add('is-ready'); panel.focus({ preventScroll: true }); };
  }

  function closeCard(instant = false) {
    if (openK < 0) return;
    const k = openK;
    openK = -1;
    scrim.classList.remove('is-on');
    panel.classList.remove('is-ready');
    panel.setAttribute('aria-hidden', 'true');
    const done = () => {
      panel.classList.remove('is-open');
      cards[k].classList.remove('is-lifted');
    };
    panelAnim?.cancel();
    if (instant) { done(); return; }
    const to = boxOf(panel), from = boxOf(cards[k]);
    panelAnim = panel.animate([
      { transform: 'none', borderRadius: '16px', opacity: 1 },
      { transform: `translate(${from.x - to.x}px, ${from.y - to.y}px) scale(${from.w / to.w}, ${from.h / to.h})`, borderRadius: '10px', opacity: 0.6 },
    ], { duration: 320, easing: 'cubic-bezier(.4, 0, .2, 1)' });
    panelAnim.onfinish = done;
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
  }

  cards.forEach((c, k) => {
    c.addEventListener('click', () => openCard(k));
    c.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openCard(k); }
    });
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeCard(); });
  // Scrolling the chapter away closes it.
  new IntersectionObserver(([en]) => { if (!en.isIntersecting || en.intersectionRatio < 0.6) closeCard(true); }, { threshold: [0, 0.6] }).observe(stage);

  let hot = -1;
  cards.forEach((c, k) => {
    c.addEventListener('pointerenter', () => { hot = k; });
    c.addEventListener('pointerleave', () => { if (hot === k) hot = -1; });
  });

  const slots = milestones.map(() => ({ x: 0, y: 0 }));
  const shown = milestones.map(() => false);
  const flights = milestones.map(() => null);
  const slotT = (k) => `translate(${slots[k].x}px, ${slots[k].y}px)`;

  /** Rows of cards, each card as close to its own year as the row allows; a
   *  row that cannot fit them all fans its cards out like a deck. */
  function layoutTimeline() {
    const W = band.clientWidth;
    if (!W || !box) return;
    const narrow = W < 640;
    const rows = narrow || window.innerHeight >= 680 ? 3 : 2; // very short screens: fan more, keep the plot tall
    const gap = narrow ? 8 : 18;
    const perRow = Math.ceil(milestones.length / rows);
    // Narrow enough that a row fits side by side, with room to start near its first year.
    const cw = narrow ? 140 : clamp((W - gap * (perRow - 1)) / (perRow + 0.8), 168, 240);
    cards.forEach((c) => { c.style.width = `${cw}px`; c.style.height = ''; });
    const ch = Math.max(...cards.map((c) => c.offsetHeight)) || 90;
    cards.forEach((c) => { c.style.height = `${ch}px`; });
    const top = 14;
    band.style.height = `${top + rows * (ch + gap)}px`;
    for (let r = 0; r < rows; r++) {
      const ks = milestones.map((_, k) => k).filter((k) => k % rows === r);
      const want = ks.map((k) => clamp(X(milestones[k].t) - 15, 0, W - cw));
      let step = cw + gap;
      const span = W - cw - want[0];
      if (ks.length > 1 && (ks.length - 1) * step > span) step = Math.max(24, span / (ks.length - 1));
      let x = -Infinity;
      ks.forEach((k, j) => {
        x = Math.max(want[j], x + step);
        x = Math.min(x, W - cw - (ks.length - 1 - j) * step);
        slots[k] = { x: Math.max(0, x), y: top + r * (ch + gap) };
      });
    }
    cards.forEach((c, k) => {
      if (!flights[k]) {
        c.style.transform = shown[k] ? slotT(k) : dotT(k, 0.15);
        c.style.opacity = shown[k] ? '1' : '0';
        c.tabIndex = shown[k] && milestones[k].detail ? 0 : -1;
        c.classList.toggle('is-on', shown[k]);
      }
      const L = lines[k];
      L.setAttribute('x1', X(milestones[k].t));
      L.setAttribute('y1', 0);
      L.setAttribute('x2', slots[k].x + 15);
      L.setAttribute('y2', slots[k].y);
    });
  }

  /** Transform that puts card k on its milestone dot in the plot (`lift` px above it). */
  function dotT(k, scale, lift = 0) {
    const pr = canvas.getBoundingClientRect(), br = band.getBoundingClientRect();
    const m = milestones[k];
    const x = X(m.t) + pr.left - br.left - 15;
    const y = Y(me[iOf(m.t)]) + pr.top - br.top - lift;
    return `translate(${x}px, ${y}px) scale(${scale})`;
  }

  function fly(k, show) {
    shown[k] = show;
    const c = cards[k];
    const from = getComputedStyle(c).transform;
    const fromO = getComputedStyle(c).opacity;
    flights[k]?.cancel();
    const frames = show
      ? [
        { transform: dotT(k, 0.15), opacity: 0 },
        { transform: dotT(k, 0.7, 22), opacity: 1, offset: 0.22 },
        { transform: slotT(k), opacity: 1 },
      ]
      : [{ transform: from === 'none' ? slotT(k) : from, opacity: fromO }, { transform: dotT(k, 0.15), opacity: 0 }];
    const anim = c.animate(frames, {
      duration: show ? 760 : 420,
      easing: show ? 'cubic-bezier(.3, .7, .15, 1)' : 'cubic-bezier(.5, 0, .75, 0)',
      fill: 'forwards',
    });
    flights[k] = anim;
    lines[k].classList.toggle('on', show);
    anim.onfinish = () => {
      c.style.transform = show ? slotT(k) : dotT(k, 0.15);
      c.style.opacity = show ? '1' : '0';
      c.tabIndex = show && milestones[k].detail ? 0 : -1;
      c.classList.toggle('is-on', show);
      anim.cancel();
      if (flights[k] === anim) flights[k] = null;
    };
  }

  /* ---------- geometry & offscreen layers ---------- */
  let box = null, baked = 0;
  const cloud = document.createElement('canvas');
  const X = (t) => box.l + ((t - T0) / (T1 - T0)) * (box.r - box.l);
  const Y = (y) => box.b - ((y - yLo) / (yHi - yLo)) * (box.b - box.t);
  let cloudCtx = null, stride = 1;
  const view = hidpi(canvas, (s) => {
    const narrow = s.w < 640;
    box = { l: narrow ? 6 : 12, r: s.w - (narrow ? 10 : 24), t: 18, b: s.h - 30 };
    stride = narrow ? 2 : 1;
    paintOffscreen(s);
    layoutTimeline();
  });
  new ResizeObserver(() => layoutTimeline()).observe(band);
  document.fonts?.ready.then(layoutTimeline);

  function prep(c, s) {
    c.width = canvas.width; c.height = canvas.height;
    const g = c.getContext('2d');
    g.setTransform(s.dpr, 0, 0, s.dpr, 0, 0);
    g.clearRect(0, 0, s.w, s.h);
    g.beginPath();
    g.rect(0, box.t - 6, s.w, box.b - box.t + 6);
    g.clip();
    return g;
  }

  function bake(k) {
    const g = cloudCtx, a = ensemble[k];
    g.globalAlpha = highlight(k) ? 0.32 : nPaths > 1000 ? 0.05 : 0.08;
    g.lineWidth = highlight(k) ? 0.8 : 0.75;
    g.beginPath();
    g.moveTo(X(T0), Y(a[0]));
    for (let i = stride; i <= iNow; i += stride) g.lineTo(X(tAt(i)), Y(a[i]));
    g.stroke();
  }

  function paintOffscreen(s) {
    if (!s.w) return;
    cloudCtx = prep(cloud, s);
    cloudCtx.strokeStyle = ink;
    cloudCtx.lineJoin = 'round';
    for (let k = 0; k < baked; k++) bake(k);
  }

  /* ---------- frame ---------- */
  // Generation starts when cued: by the Fourier pen landing on t₀, or by
  // scroll position when nothing external has taken control.
  let cursor = T0, external = false, cued = false, genStart = null, readyAt = null;
  let hold = 0, nextMs = 0;

  /** The life line plays itself: steady through the years, a beat on each
   *  milestone (so its card can pop), and it stops at "now". */
  function advanceLife(dt) {
    if (openK >= 0) return; // reading a card
    if (hold > 0) { hold -= dt; return; }
    if (cursor >= now) return;
    let next = Math.min(now, cursor + LIFE_SPEED * dt);
    if (nextMs < milestones.length && next >= milestones[nextMs].t) {
      next = milestones[nextMs].t;
      hold = milestones[nextMs].t >= now ? NOW_HOLD : MS_HOLD;
      nextMs++;
    }
    cursor = next;
  }
  const done = () => readyAt !== null && cursor >= now && hold <= 0;

  /** Jump to the end state: everything sampled, my path drawn up to now. */
  function finish() {
    if (done()) return;
    const t = performance.now() / 1000;
    cued = true;
    if (genStart === null) genStart = t;
    if (cloudCtx) while (baked < nPaths) bake(baked++);
    if (readyAt === null) readyAt = t - 1;
    cursor = now; hold = 0; nextMs = milestones.length;
  }

  function replay() {
    closeCard(true);
    baked = 0;
    cloudCtx?.clearRect(0, 0, view.w, view.h);
    genStart = performance.now() / 1000;
    readyAt = null;
    cursor = T0; hold = 0; nextMs = 0;
  }
  replayBtn?.addEventListener('click', () => { cued = true; replay(); });

  function frame(time, dt) {
    const { ctx, w, h } = view;
    if (!box) return;

    if (!external && !cued && section.getBoundingClientRect().top < window.innerHeight * 0.3) cued = true;
    if (cued && genStart === null) genStart = time;
    const gt = genStart === null ? -1 : time - genStart;
    const count = gt < 0 ? 0 : clamp(Math.floor(Math.exp(gt / GEN_TAU) - 1), 0, nPaths);
    while (baked < count && gt >= appearAt(baked) + traceFor(baked)) bake(baked++);
    const ready = baked >= nPaths;
    if (ready && readyAt === null) readyAt = time;
    const settled = ready ? smooth(clamp((time - readyAt) / 0.5)) : 0;

    if (ready) advanceLife(time - readyAt > 0.5 ? dt : 0);

    ctx.clearRect(0, 0, w, h);
    const xc = X(cursor), xn = X(now);

    // Year grid.
    ctx.font = `10.5px ${mono}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const every = w < 640 ? 3 : 1;
    for (let yr = Math.ceil(T0); yr <= Math.floor(T1); yr++) {
      const x = X(yr);
      ctx.globalAlpha = 0.07;
      ctx.fillStyle = ink;
      ctx.fillRect(x, box.t, 1, box.b - box.t);
      if ((yr - 2016) % every === 0) {
        ctx.globalAlpha = yr <= cursor ? 0.6 : 0.3;
        ctx.fillText(`’${String(yr).slice(2)}`, x, box.b + 10);
      }
    }

    // Ensemble: everything generated so far; once my path starts, bright
    // behind the cursor and ghosted ahead of it.
    const lit = lerp(xn + 1, xc, settled);
    ctx.globalAlpha = 1;
    clipX(ctx, 0, lit, () => ctx.drawImage(cloud, 0, 0, w, h));
    ctx.globalAlpha = 0.2;
    clipX(ctx, lit, xn + 1, () => ctx.drawImage(cloud, 0, 0, w, h));

    // Paths still drawing themselves.
    ctx.strokeStyle = ink;
    ctx.fillStyle = ink;
    for (let k = baked; k < count; k++) {
      const u = clamp((gt - appearAt(k)) / traceFor(k));
      const end = Math.round(u * iNow);
      ctx.globalAlpha = k < 6 ? 0.85 : 0.45;
      ctx.lineWidth = k < 6 ? 1.2 : 0.8;
      polyline(ctx, ensemble[k], 0, end);
      if (k < 6) {
        ctx.beginPath();
        ctx.arc(X(tAt(end)), Y(ensemble[k][end]), 2.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // t₀, where every path starts.
    if (!ready) {
      ctx.globalAlpha = 1;
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.arc(X(T0), Y(0), 3.6, 0, Math.PI * 2);
      ctx.fill();
    }

    if (gt < 0) setText(hud.sample, 'awaiting t₀');
    else if (!ready) setText(hud.sample, `sampling ${count.toLocaleString('en')} / ${nPaths.toLocaleString('en')}`);
    else setText(hud.sample, done() ? `path #${ME} · now ↓ sample the future` : `path #${ME} of ${nPaths.toLocaleString('en')}`);

    // Now line.
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = ink;
    for (let y = box.t; y < box.b; y += 6) ctx.fillRect(xn, y, 1, 3);
    ctx.globalAlpha = 0.7;
    ctx.textAlign = 'left';
    ctx.fillText('now', xn + 6, box.t);

    const ic = Math.min(iNow, Math.max(0, Math.round((cursor - T0) / DT)));
    if (ready) {
      // Where every other life is at the same moment.
      if (cursor < now - 0.02 && cursor > T0 + 0.02) {
        ctx.globalAlpha = 0.35 * settled;
        ctx.fillStyle = ink;
        for (let k = 0; k < nPaths; k += 2) ctx.fillRect(xc - 0.75, Y(ensemble[k][ic]) - 0.75, 1.5, 1.5);
      }
      // My path, drawn only as far as the clock has run.
      ctx.strokeStyle = accent;
      ctx.globalAlpha = 1;
      ctx.lineWidth = 2.2;
      polyline(ctx, me, 0, ic);
    }

    // Milestones: a clear dot on the line for each one reached; each pops a
    // card into the timeline below.
    let active = -1;
    milestones.forEach((m, k) => {
      const on = ready && m.t <= cursor + 0.01;
      if (on) active = k;
      if (on !== shown[k]) fly(k, on);
    });
    cards.forEach((c, k) => c.classList.toggle('is-active', k === active));
    milestones.forEach((m, k) => {
      if (!shown[k]) return;
      const x = X(m.t), y = Y(me[iOf(m.t)]);
      const big = k === active || k === hot;
      ctx.globalAlpha = 1;
      ctx.fillStyle = paper;
      ctx.strokeStyle = accent;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(x, y, big ? 5 : 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      if (big) {
        const pulse = (time * 0.8) % 1;
        ctx.globalAlpha = 1 - pulse;
        ctx.beginPath();
        ctx.arc(x, y, 5 + pulse * 14, 0, Math.PI * 2);
        ctx.stroke();
      }
    });

    if (done()) setText(caption, '');
    else if (active >= 0) {
      const m = milestones[active];
      setText(caption, [m.when, m.where, m.note].filter(Boolean).join('  ·  '));
    } else setText(caption, INTRO);

    // Head of my path (it stops at "now"; the futures sprout from here).
    if (ready) {
      const xh = Math.min(xc, xn), yh = Y(me[ic]);
      if (done()) {
        const pulse = (time * 0.7) % 1;
        ctx.strokeStyle = accent;
        ctx.lineWidth = 1.2;
        ctx.globalAlpha = (1 - pulse) * 0.7;
        ctx.beginPath();
        ctx.arc(xh, yh, 5 + pulse * 16, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.arc(xh, yh, 3.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText('me', xh - 9, yh - 10);
      ctx.textBaseline = 'top';
    }
    ctx.globalAlpha = 1;

    setText(hud.t, `t = ${cursor.toFixed(2)}`);
  }

  function polyline(ctx, a, i0, i1) {
    if (i1 <= i0) return;
    ctx.beginPath();
    ctx.moveTo(X(tAt(i0)), Y(a[i0]));
    for (let i = i0 + 1; i <= i1; i++) ctx.lineTo(X(tAt(i)), Y(a[i]));
    ctx.stroke();
  }

  function clipX(ctx, x0, x1, draw) {
    if (x1 <= x0) return;
    ctx.save();
    ctx.beginPath();
    ctx.rect(x0, 0, x1 - x0, view.h);
    ctx.clip();
    draw();
    ctx.restore();
  }

  visibleLoop(section, frame, { margin: '0px' });

  return {
    /** t₀ origin of every path, in canvas px. */
    origin: () => (box ? [X(T0), Y(0)] : null),
    /** Hand the start of the simulation to an external cue. */
    takeControl: () => { external = true; },
    /** Start generating (once started, the ensemble stays). */
    cue: (on) => { if (on) cued = true; },
    /** My path at "now", in canvas px: where the futures sprout. */
    nowPoint: () => (box ? [X(now), Y(me[iNow])] : null),
    /** Pixels per year and per unit of X, so futures can start out in the plot's own scale. */
    scale: () => (box ? { year: X(T0 + 1) - X(T0), unit: Y(0) - Y(1), right: box.r } : null),
    done,
    finish,
  };
}
