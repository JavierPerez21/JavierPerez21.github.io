/**
 * §01 → §02 · From series to samples.
 *
 * Past a point in the hero the epicycle chain lets go of the name: the circles
 * collapse into the pen, and the pen goes for a random walk over the page (an
 * Ornstein–Uhlenbeck process around an anchor that slides towards the plot).
 * The walk starts slow and speeds up as you scroll, then its noise is damped
 * to zero so it converges on t₀ of the Monte Carlo plot. Arriving there cues
 * the ensemble. Scrolling back up runs it all in reverse.
 */
import { clamp, cssVar, hidpi, invLerp, lerp, smooth } from '../lib/util.js';

const DETACH_AT = 0.22; // fraction of the hero scrolled before the chain lets go
const THETA = 0.7; // mean reversion of the walk (1/s)
const SPREAD = 0.2; // stationary std of the walk, as a fraction of the viewport
const TRAIL_S = 1.6; // seconds of walk kept as a trail

export function seriesToSamples({ hero, heroCanvas, fourier, pathsSection, plotCanvas, paths }) {
  const ink = cssVar('--ink') || '#121212';
  const accent = cssVar('--accent') || '#ff4d1f';
  const mono = cssVar('--mono') || 'monospace';

  const canvas = document.createElement('canvas');
  canvas.className = 'bridge-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.append(canvas);
  const view = hidpi(canvas, () => {});
  const sticky = plotCanvas.closest('.paths-sticky');
  paths.takeControl();

  let start = null, painted = false, last = 0;
  const walk = { x: 0, y: 0 };
  const trail = [];
  const gauss = () => Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(2 * Math.PI * Math.random());

  function clear() {
    if (!painted) return;
    view.ctx.clearRect(0, 0, view.w, view.h);
    painted = false;
  }

  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min(1 / 30, (now - (last || now)) / 1000);
    last = now;

    const s = window.scrollY, vw = window.innerWidth, vh = window.innerHeight;
    const sA = hero.getBoundingClientRect().top + s + hero.offsetHeight * DETACH_AT;
    const sLand = pathsSection.getBoundingClientRect().top + s;
    const attached = 1 - smooth(invLerp(sA, sA + vh * 0.18, s));
    const e = clamp((s - sA) / Math.max(1, sLand - sA));

    fourier.setDetached(attached < 1);
    if (attached >= 1 || e >= 1) {
      start = null; walk.x = walk.y = 0; trail.length = 0;
      clear();
      if (e >= 1) paths.cue(true);
      return;
    }

    const chain = fourier.chain();
    const origin = paths.origin();
    if (!chain || !origin) return;

    const hr = heroCanvas.getBoundingClientRect();
    const n = chain.pts.length / 2;
    const homeX = (i) => hr.left + chain.pts[i * 2];
    const homeY = (i) => hr.top + chain.pts[i * 2 + 1];

    // Take-off: the tip as it sat when the scroll crossed sA. Landing: t₀ of
    // the plot, at the spot it occupies once the plot is pinned.
    if (!start) start = [homeX(n - 1), homeY(n - 1) + (s - sA)];
    const pr = plotCanvas.getBoundingClientRect();
    const end = [pr.left + origin[0], pr.top - sticky.getBoundingClientRect().top + origin[1]];

    // The walk: slow at first, faster the further you scroll; its noise is
    // damped out over the last stretch so it settles exactly on t₀.
    const speed = lerp(0.35, 3.4, e ** 1.2);
    const sigma = SPREAD * Math.min(vw, vh) * Math.sqrt(2 * THETA);
    const h = dt * speed;
    walk.x += -THETA * walk.x * h + sigma * Math.sqrt(h) * gauss();
    walk.y += -THETA * walk.y * h + sigma * Math.sqrt(h) * gauss();
    const settle = 1 - smooth(invLerp(0.68, 0.97, e));
    const anchor = [lerp(start[0], end[0], smooth(e)), lerp(start[1], end[1], smooth(e))];
    const free = [
      clamp(anchor[0] + walk.x * settle, 24, vw - 24),
      clamp(anchor[1] + walk.y * settle, 84, vh - 24),
    ];
    const pen = [lerp(free[0], homeX(n - 1), attached), lerp(free[1], homeY(n - 1), attached)];

    trail.push([pen[0], pen[1], now]);
    while (trail.length && now - trail[0][2] > TRAIL_S * 1000) trail.shift();

    draw(chain, n, homeX, homeY, pen, attached, settle);
  }

  function draw(chain, n, homeX, homeY, pen, attached, settle) {
    const { ctx, w, h } = view;
    ctx.clearRect(0, 0, w, h);
    painted = true;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // The chain folds into the pen as it lets go of the name.
    if (attached > 0.002) {
      const k = smooth(attached);
      const strength = fourier.strength() * k;
      const jx = (i) => lerp(pen[0], homeX(i), k);
      const jy = (i) => lerp(pen[1], homeY(i), k);
      ctx.strokeStyle = ink;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i < n - 2; i++) {
        const r = chain.radii[i] * k;
        if (r < 0.5) continue;
        ctx.moveTo(jx(i) + r, jy(i));
        ctx.arc(jx(i), jy(i), r, 0, Math.PI * 2);
      }
      ctx.globalAlpha = 0.2 * strength;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(jx(0), jy(0));
      for (let i = 1; i < n; i++) ctx.lineTo(jx(i), jy(i));
      ctx.globalAlpha = 0.6 * strength;
      ctx.stroke();
    }

    // The walk so far: a Brownian path, fading with age.
    const nowMs = trail.length ? trail[trail.length - 1][2] : 0;
    ctx.strokeStyle = ink;
    ctx.lineWidth = 1;
    for (let i = 1; i < trail.length; i++) {
      ctx.globalAlpha = 0.45 * (1 - (nowMs - trail[i][2]) / (TRAIL_S * 1000)) ** 1.5 * (1 - attached);
      ctx.beginPath();
      ctx.moveTo(trail[i - 1][0], trail[i - 1][1]);
      ctx.lineTo(trail[i][0], trail[i][1]);
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.arc(pen[0], pen[1], 3.6, 0, Math.PI * 2);
    ctx.fill();

    // Settled on the start of time.
    const here = 1 - smooth(invLerp(0, 0.35, settle));
    if (here > 0) {
      ctx.globalAlpha = here * 0.8;
      ctx.fillStyle = ink;
      ctx.font = `11px ${mono}`;
      ctx.textBaseline = 'middle';
      ctx.fillText('t₀', pen[0] + 10, pen[1] - 1);
      const pulse = ((nowMs / 1000) * 0.8) % 1;
      ctx.strokeStyle = accent;
      ctx.globalAlpha = here * (1 - pulse) * 0.8;
      ctx.beginPath();
      ctx.arc(pen[0], pen[1], 5 + pulse * 14, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  requestAnimationFrame(frame);
}
