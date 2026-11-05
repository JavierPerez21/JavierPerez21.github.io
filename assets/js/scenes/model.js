/**
 * §03 · Representation: a forward pass through a small transformer.
 *
 * Layers are planes of neurons in 3D; scrolling flies the camera through
 * them. Anonymous neurons flicker, activations travel along the weights,
 * and the *named* neurons are things I have done. Their labels are real
 * DOM buttons (focusable, clickable) positioned on top of the canvas.
 */
import { rng } from '../lib/rng.js';
import { clamp, cssVar, el, hidpi, invLerp, isCoarse, lerp, reducedMotion, scrollProgress, smoother, visibleLoop } from '../lib/util.js';

const D = 1300; // spacing between layers (world units)
const F = 760; // camera distance at which a layer is "in focus"
const NEAR = 40;
const XW = 1000; // half-width of a layer plane

export function insideModel({ section, canvas, labelsRoot, hud, layers, tokens, skillGroups, onOpen }) {
  const chalk = cssVar('--chalk') || '#ecebe6';
  const accent = cssVar('--accent') || '#ff4d1f';
  const mono = cssVar('--mono') || 'monospace';
  const groupColor = Object.fromEntries(Object.keys(skillGroups).map((g) => [g, cssVar(`--g-${g}`) || chalk]));
  const still = reducedMotion();
  const coarse = isCoarse();
  const rand = rng(2017);
  const L = layers.length;

  /* ---------- build the network ---------- */
  const planes = layers.map((layer, k) => {
    const anon = [];
    const cols = coarse ? 11 : 15, rows = coarse ? 13 : 10;
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        if (rand() < 0.2) continue;
        anon.push({
          u: lerp(-1.4, 1.4, (i + 0.5 + rand.range(-0.4, 0.4)) / cols),
          v: lerp(-1.4, 1.4, (j + 0.5 + rand.range(-0.4, 0.4)) / rows),
          ph: rand() * Math.PI * 2,
          fr: rand.range(0.5, 1.8),
          base: rand.range(0.12, 0.42),
        });
      }
    }
    const entries = layer.kind === 'tokens'
      ? tokens.map((t) => ({ kind: 'token', data: t }))
      : layer.items.map((it) => ({ kind: 'item', data: it }));
    const named = entries.map((e) => ({ ...e, u: 0, v: 0, nid: `n${1000 + rand.int(8999)}`, k, vis: false, left: false }));
    return { layer, k, z: k * D, anon, named, edges: [] };
  });

  for (let k = 0; k < L - 1; k++) {
    const A = [...planes[k].anon, ...planes[k].named];
    const B = [...planes[k + 1].anon, ...planes[k + 1].named];
    const edges = [];
    for (let e = 0; e < (coarse ? 110 : 170); e++) {
      const a = planes[k].anon[rand.int(planes[k].anon.length)];
      for (let tries = 0; tries < 14; tries++) {
        const b = planes[k + 1].anon[rand.int(planes[k + 1].anon.length)];
        if (Math.hypot(b.u - a.u, b.v - a.v) < 0.75) { edges.push({ a, b }); break; }
      }
    }
    for (const n of planes[k].named) for (let j = 0; j < 3; j++) edges.push({ a: n, b: B[rand.int(B.length)], hub: true });
    for (const n of planes[k + 1].named) for (let j = 0; j < 3; j++) edges.push({ a: A[rand.int(A.length)], b: n, hub: true });
    planes[k].edges = edges;
  }

  // Attention lines: token → every item that uses it (can skip layers).
  const tokenNeuron = Object.fromEntries(planes[0].named.map((n) => [n.data.id, n]));
  const semantic = [];
  for (const P of planes.slice(1)) {
    for (const n of P.named) for (const tag of n.data.tags || []) if (tokenNeuron[tag]) semantic.push({ a: tokenNeuron[tag], b: n });
  }

  /* ---------- labels (DOM) ---------- */
  let hovered = null;
  const payloadFor = (n) => (n.kind === 'token'
    ? {
        kind: 'token',
        token: n.data,
        group: skillGroups[n.data.group],
        related: semantic.filter((s) => s.a === n).map((s) => ({ label: s.b.data.title, sub: layers[s.b.k].title, open: () => onOpen(payloadFor(s.b)) })),
      }
    : {
        kind: 'item',
        item: n.data,
        layer: layers[n.k],
        nid: `L${n.k} · ${n.nid}`,
        related: (n.data.tags || []).map((t) => tokenNeuron[t]).filter(Boolean)
          .map((m) => ({ label: m.data.label, group: m.data.group, open: () => onOpen(payloadFor(m)) })),
      });
  for (const P of planes) {
    for (const n of P.named) {
      const isTok = n.kind === 'token';
      const inner = isTok
        ? el('span.neuron-inner', {}, el('span.neuron-title', {}, n.data.label))
        : el('span.neuron-inner', {},
            el('span.neuron-id', {}, `L${P.k} · ${n.nid}`),
            el('span.neuron-title', {}, n.data.title),
            el('span.neuron-tag', {}, n.data.tag));
      n.el = el(`button.neuron${isTok ? '.neuron--token' : ''}`, {
        type: 'button',
        tabindex: '-1',
        'data-group': isTok ? n.data.group : null,
        'aria-label': isTok ? `${n.data.label}: ${skillGroups[n.data.group].label}` : `${n.data.title}. ${n.data.tag}`,
        onclick: () => onOpen(payloadFor(n)),
        onpointerenter: () => { hovered = n; },
        onpointerleave: () => { if (hovered === n) hovered = null; },
        onfocus: () => { hovered = n; },
        onblur: () => { if (hovered === n) hovered = null; },
      }, inner);
      labelsRoot.append(n.el);
    }
  }

  /* ---------- layout ---------- */
  let X = XW, Y = XW, fl = 1, cx = 0, cy = 0, portrait = false, pxU = 1;
  const view = hidpi(canvas, (s) => {
    portrait = s.h > s.w * 1.1 || s.w < 720;
    pxU = 0.92 * (s.w / 2); // screen px per unit of u, for a layer in focus
    X = XW;
    Y = XW * (s.h / s.w);
    fl = 0.92 * (s.w / 2) * (F / XW);
    cx = s.w / 2;
    cy = s.h / 2;
    layout();
  });

  document.fonts?.ready.then(() => layout());

  function layout() {
    for (const P of planes) {
      const named = P.named;
      if (P.layer.kind === 'tokens') {
        const groups = Object.keys(skillGroups);
        const centers = portrait
          ? groups.map((_, i) => [-0.2, lerp(-0.42, 0.6, i / (groups.length - 1))])
          : [[-0.5, -0.44], [0.42, -0.46], [-0.48, 0.34], [0.42, 0.36]];
        groups.forEach((g, gi) => {
          const members = named.filter((m) => m.data.group === g);
          const perRow = portrait ? 2 : Math.ceil(members.length / 2);
          const rowsN = Math.ceil(members.length / perRow);
          // Width of dot + gap + chip, measured from the DOM, in u units.
          const span = (m) => (m.el.firstChild.offsetWidth + 30) / pxU;
          for (let row = 0; row < rowsN; row++) {
            const inRow = members.slice(row * perRow, (row + 1) * perRow);
            const width = inRow.reduce((a, m) => a + span(m), 0);
            let u = centers[gi][0] - width / 2 + (portrait ? 0 : (row % 2) * 0.04);
            for (const m of inRow) {
              m.u = u;
              m.v = centers[gi][1] + (row - (rowsN - 1) / 2) * (portrait ? 0.095 : 0.17);
              m.left = false;
              u += span(m);
            }
          }
        });
      } else {
        const n = named.length;
        if (portrait) {
          named.forEach((m, j) => {
            m.u = j % 2 ? -0.32 : -0.82;
            m.v = lerp(-0.34, 0.7, n === 1 ? 0.5 : j / (n - 1));
            m.left = false;
          });
        } else {
          // Rows of labels (dot on the left, card to its right), centred on screen.
          const top = Math.ceil(n / 2);
          const labelU = 260 / pxU;
          const span = Math.max(0.6, (260 + 44) / pxU);
          named.forEach((m, j) => {
            const row = j < top ? 0 : 1;
            const idx = row ? j - top : j;
            const cnt = row ? n - top : top;
            const width = (cnt - 1) * span + labelU;
            m.u = -width / 2 + idx * span + (row ? 1 : -1) * span * 0.09;
            m.v = row ? 0.2 : -0.36;
            m.left = false;
          });
        }
      }
      for (const m of named) m.el.classList.toggle('neuron--left', m.left);
    }
  }

  const project = (u, v, z, out) => {
    const d = z - cam.z;
    if (d < NEAR) return null;
    const s = fl / d;
    out.x = cx + (u * X - cam.x) * s;
    out.y = cy + (v * Y - cam.y) * s;
    out.s = s;
    out.d = d;
    return out;
  };

  /* ---------- camera ---------- */
  const Zs = -F - 1.7 * D;
  const Zk = (k) => k * D - F;
  const Ze = (L - 1) * D + 0.5 * D;
  const cam = { x: 0, y: 0, z: Zs };
  const mouse = { x: 0, y: 0 };
  if (!coarse) {
    window.addEventListener('pointermove', (e) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
    }, { passive: true });
  }

  function targetZ(p) {
    const s = p * (L + 1);
    if (s < 1) return lerp(Zs, Zk(0), smoother(invLerp(0.25, 1, s)));
    const k = Math.min(L - 1, Math.floor(s - 1));
    const f = s - 1 - k;
    return lerp(Zk(k), k === L - 1 ? Ze : Zk(k + 1), smoother(invLerp(0.55, 1, f)));
  }

  /* ---------- pulses ---------- */
  const pulses = Array.from({ length: coarse ? 40 : 80 }, () => spawn({}, true));
  function spawn(p, initial = false) {
    // Prefer weights near the camera so activations are visible.
    const near = planes.filter((P) => P.edges.length && P.z - cam.z > -D && P.z - cam.z < 3.2 * D);
    const P = (near.length ? near : planes.filter((q) => q.edges.length))[rand.int(near.length || L - 1)];
    p.k = P.k;
    p.e = P.edges[rand.int(P.edges.length)];
    p.t = initial ? rand() : 0;
    p.v = rand.range(0.35, 0.9);
    return p;
  }

  /* ---------- HUD ---------- */
  let shownLayer = -2;
  function setHud(k) {
    if (k === shownLayer) return;
    shownLayer = k;
    section.classList.toggle('is-deep', k >= 0);
    hud.rail.forEach((r, i) => r.classList.toggle('on', i === k));
    if (k < 0) return;
    const layer = layers[k];
    hud.op.textContent = `L${k} · ${layer.op}`;
    hud.title.textContent = layer.title;
    hud.span.textContent = layer.span;
    hud.blurb.textContent = layer.blurb;
    hud.box.classList.remove('swap');
    void hud.box.offsetWidth;
    hud.box.classList.add('swap');
  }

  /* ---------- frame ---------- */
  const A = { x: 0, y: 0, s: 0, d: 0 }, B = { x: 0, y: 0, s: 0, d: 0 };
  const vars = {};
  const setVar = (name, value) => {
    const v = value.toFixed(3);
    if (vars[name] !== v) { vars[name] = v; section.style.setProperty(name, v); }
  };

  function frame(time, dt) {
    const p = scrollProgress(section);
    const tz = targetZ(p);
    const ease = still ? 1 : 1 - Math.exp(-dt * 6);
    cam.z += (tz - cam.z) * ease;
    cam.x += (mouse.x * 70 + (still ? 0 : Math.sin(time * 0.21) * 24) - cam.x) * ease * 0.5;
    cam.y += (mouse.y * 45 + (still ? 0 : Math.cos(time * 0.17) * 16) - cam.y) * ease * 0.5;
    setVar('--intro', 1 - smoother(invLerp(0.04, 0.16, p)));
    setVar('--outro', smoother(invLerp(0.93, 0.99, p)));

    const { ctx, w, h } = view;
    ctx.clearRect(0, 0, w, h);

    // Which layer is in focus?
    let focusK = -1, best = Infinity;
    for (const P of planes) {
      const d = P.z - cam.z;
      const off = Math.abs(d - F);
      if (d > NEAR && off < best && off < F * 0.5) { best = off; focusK = P.k; }
    }
    setHud(p > 0.96 ? -1 : focusK);

    for (let k = L - 1; k >= 0; k--) {
      if (k < L - 1) drawEdges(ctx, planes[k], planes[k + 1], time);
      drawPlane(ctx, planes[k], time);
    }
    if (hovered) drawSemantic(ctx);
    drawPulses(ctx, dt);
    ctx.globalAlpha = 1;
    placeLabels();
  }

  const planeAlpha = (d) => clamp(invLerp(NEAR, F * 0.55, d)) * (1 - invLerp(F + D * 1.6, F + D * 3.4, d));

  function drawPlane(ctx, P, time) {
    const d = P.z - cam.z;
    if (d < NEAR) return;
    const alpha = planeAlpha(d);
    if (alpha <= 0.002) return;

    // Frame of the layer + its name.
    const c0 = project(-1.06, -1.06, P.z, A);
    const c1 = project(1.06, 1.06, P.z, B);
    ctx.globalAlpha = alpha * 0.16;
    ctx.strokeStyle = chalk;
    ctx.lineWidth = 1;
    ctx.strokeRect(c0.x, c0.y, c1.x - c0.x, c1.y - c0.y);
    ctx.globalAlpha = alpha * 0.55;
    ctx.fillStyle = chalk;
    ctx.font = `${Math.max(9, Math.min(13, 11 * A.s * 1.4))}px ${mono}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillText(`L${P.k} · ${P.layer.op}`, c0.x + 2, c0.y - 6);

    // Anonymous neurons.
    for (const n of P.anon) {
      if (!project(n.u, n.v, P.z, A)) continue;
      if (A.x < -20 || A.x > view.w + 20 || A.y < -20 || A.y > view.h + 20) continue;
      const act = still ? 0 : Math.max(0, Math.sin(time * n.fr + n.ph)) ** 12;
      const r = Math.max(0.7, 2.4 * A.s * (1 + act));
      ctx.globalAlpha = alpha * (n.base + act * 0.75);
      ctx.fillStyle = act > 0.4 ? accent : chalk;
      if (r < 1.6) ctx.fillRect(A.x - r, A.y - r, r * 2, r * 2);
      else { ctx.beginPath(); ctx.arc(A.x, A.y, r, 0, Math.PI * 2); ctx.fill(); }
    }

    // Token cluster captions on the embedding layer.
    if (P.layer.kind === 'tokens') {
      const focus = clamp(1 - Math.abs(d - F) / (F * 0.42));
      if (focus > 0.01) {
        ctx.globalAlpha = alpha * focus * 0.5;
        ctx.font = `10.5px ${mono}`;
        ctx.textBaseline = 'bottom';
        for (const g of Object.keys(skillGroups)) {
          const members = P.named.filter((m) => m.data.group === g);
          const u = Math.min(...members.map((m) => m.u));
          const v = Math.min(...members.map((m) => m.v));
          if (!project(u, v, P.z, A)) continue;
          ctx.fillStyle = groupColor[g];
          ctx.fillText(skillGroups[g].label.toUpperCase(), A.x - 8, A.y - 20);
        }
      }
    }

    // Named neurons.
    for (const n of P.named) {
      if (!project(n.u, n.v, P.z, A)) continue;
      const hot = hovered === n;
      const col = n.kind === 'token' ? groupColor[n.data.group] : accent;
      const r = Math.max(1.4, (hot ? 9 : 6) * A.s);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc(A.x, A.y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = alpha * (hot ? 0.9 : 0.35);
      ctx.strokeStyle = col;
      ctx.beginPath();
      ctx.arc(A.x, A.y, r + 5 * A.s + (still ? 0 : Math.sin(time * 2 + n.u * 3) * 1.5 * A.s), 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  /** Project an edge, clipping it against the near plane. */
  function edgeEnds(a, za, b, zb) {
    const da = za - cam.z, db = zb - cam.z;
    if (db < NEAR) return false;
    let u = a.u, v = a.v, z = za;
    if (da < NEAR) {
      const s = (cam.z + NEAR - za) / (zb - za);
      u = a.u + (b.u - a.u) * s;
      v = a.v + (b.v - a.v) * s;
      z = cam.z + NEAR;
    }
    project(u, v, z, A);
    project(b.u, b.v, zb, B);
    return true;
  }

  function drawEdges(ctx, P, Q) {
    const dA = P.z - cam.z, dB = Q.z - cam.z;
    if (dB < NEAR) return;
    const alpha = Math.min(planeAlpha(Math.max(dA, NEAR + 1)) + (dA < NEAR ? 0.6 : 0), planeAlpha(dB) + 0.25);
    if (alpha <= 0.003) return;
    ctx.strokeStyle = chalk;
    ctx.lineWidth = 0.6;
    ctx.globalAlpha = alpha * 0.07;
    ctx.beginPath();
    for (const e of P.edges) {
      if (!edgeEnds(e.a, P.z, e.b, Q.z)) continue;
      ctx.moveTo(A.x, A.y);
      ctx.lineTo(B.x, B.y);
    }
    ctx.stroke();
    if (hovered && (hovered.k === P.k || hovered.k === Q.k)) {
      ctx.strokeStyle = accent;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.55;
      ctx.beginPath();
      for (const e of P.edges) {
        if (e.a !== hovered && e.b !== hovered) continue;
        if (!edgeEnds(e.a, P.z, e.b, Q.z)) continue;
        ctx.moveTo(A.x, A.y);
        ctx.lineTo(B.x, B.y);
      }
      ctx.stroke();
    }
  }

  function drawSemantic(ctx) {
    ctx.strokeStyle = accent;
    ctx.lineWidth = 1.2;
    ctx.globalAlpha = 0.75;
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    for (const s of semantic) {
      if (s.a !== hovered && s.b !== hovered) continue;
      if (!edgeEnds(s.a, s.a.k * D, s.b, s.b.k * D)) continue;
      ctx.moveTo(A.x, A.y);
      ctx.lineTo(B.x, B.y);
    }
    ctx.stroke();
    ctx.setLineDash([]);
  }

  function drawPulses(ctx, dt) {
    if (still) return;
    ctx.fillStyle = accent;
    for (const p of pulses) {
      p.t += dt * p.v;
      if (p.t >= 1) { spawn(p); continue; }
      const P = planes[p.k];
      const za = P.z, zb = P.z + D;
      const z = za + (zb - za) * p.t;
      const u = p.e.a.u + (p.e.b.u - p.e.a.u) * p.t;
      const v = p.e.a.v + (p.e.b.v - p.e.a.v) * p.t;
      if (!project(u, v, z, A)) continue;
      const fade = Math.sin(Math.PI * p.t);
      ctx.globalAlpha = 0.9 * fade * clamp(planeAlpha(A.d) + 0.3);
      const r = Math.max(0.8, 2.2 * A.s);
      ctx.beginPath();
      ctx.arc(A.x, A.y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function placeLabels() {
    for (const P of planes) {
      const d = P.z - cam.z;
      const focus = d < NEAR ? 0 : clamp(1 - Math.abs(d - F) / (F * 0.42));
      for (const n of P.named) {
        const pr = focus > 0.02 ? project(n.u, n.v, P.z, A) : null;
        if (!pr) {
          if (n.vis) { n.el.classList.remove('is-vis', 'is-live'); n.el.tabIndex = -1; n.vis = false; }
          continue;
        }
        if (!n.vis) { n.el.classList.add('is-vis'); n.vis = true; }
        n.el.style.transform = `translate3d(${pr.x.toFixed(1)}px, ${pr.y.toFixed(1)}px, 0)`;
        n.el.style.opacity = String(Math.min(1, focus * 1.4));
        const live = focus > 0.55;
        if (live !== n.el.classList.contains('is-live')) {
          n.el.classList.toggle('is-live', live);
          n.el.tabIndex = live ? 0 : -1;
        }
      }
    }
  }

  visibleLoop(section, frame, { margin: '0px' });
}
