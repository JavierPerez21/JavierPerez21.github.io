/**
 * Detail panel for a neuron (a project, paper or token).
 * Slides in from the right on desktop and up from the bottom on phones.
 */
import { el } from '../lib/util.js';

export function createDrawer(root) {
  const panel = root.querySelector('.drawer-panel');
  const body = root.querySelector('.drawer-body');
  let lastFocus = null;

  const close = () => {
    if (!root.classList.contains('is-open')) return;
    root.classList.remove('is-open');
    root.setAttribute('aria-hidden', 'true');
    document.documentElement.classList.remove('is-locked');
    lastFocus?.focus?.({ preventScroll: true });
  };

  root.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) close(); });
  document.addEventListener('keydown', (e) => {
    if (!root.classList.contains('is-open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'Tab') trapFocus(e);
  });

  function trapFocus(e) {
    const f = [...panel.querySelectorAll('a[href], button:not([disabled])')];
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function open(payload) {
    if (!root.classList.contains('is-open')) lastFocus = document.activeElement;
    body.replaceChildren(...(payload.kind === 'token' ? renderToken(payload) : renderItem(payload)).filter(Boolean));
    panel.scrollTop = 0;
    root.classList.add('is-open');
    root.setAttribute('aria-hidden', 'false');
    document.documentElement.classList.add('is-locked');
    requestAnimationFrame(() => panel.focus({ preventScroll: true }));
  }

  return { open, close };
}

function activation(seed, n = 36) {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  const bars = [];
  for (let i = 0; i < n; i++) {
    h = Math.imul(h ^ (h >>> 13), 0x5bd1e995);
    const v = ((h >>> 0) % 1000) / 1000;
    bars.push(el('i', { style: { '--a': (0.08 + v ** 2.2 * 0.92).toFixed(3) } }));
  }
  return el('div.drawer-act', { 'aria-hidden': 'true' }, bars);
}

function renderItem({ item, layer, nid, related }) {
  return [
    el('p.drawer-kicker', {}, el('span', {}, nid), el('span', {}, `${layer.op} · ${layer.title}`)),
    activation(item.id),
    el('h2.drawer-title', { id: 'drawer-title' }, item.title),
    item.meta ? el('p.drawer-meta', {}, item.meta) : null,
    item.summary ? el('p.drawer-lead', {}, item.summary) : null,
    item.points?.length ? el('ul.drawer-points', {}, item.points.map((p) => el('li', {}, p))) : null,
    item.image ? el('figure.drawer-fig', {}, el('img', { src: item.image, alt: '', loading: 'lazy', decoding: 'async' })) : null,
    item.links?.length
      ? el('div.drawer-links', {}, item.links.map((l) =>
          el('a.btn', { href: l.href, target: l.href.startsWith('http') ? '_blank' : null, rel: 'noopener' }, l.label, el('span', { 'aria-hidden': 'true' }, ' ↗'))))
      : null,
    related?.length
      ? el('div.drawer-related', {},
          el('p.label', {}, 'Strongest input tokens'),
          el('div.chips', {}, related.map((r) =>
            el('button.chip', { type: 'button', 'data-group': r.group, onclick: r.open }, r.label))))
      : null,
  ];
}

function renderToken({ token, group, related }) {
  return [
    el('p.drawer-kicker', {}, el('span', {}, 'token'), el('span', {}, group.label)),
    activation(token.id),
    el('h2.drawer-title.drawer-title--mono', { id: 'drawer-title' }, `"${token.label}"`),
    el('p.drawer-lead', {}, group.text),
    related?.length
      ? el('div.drawer-related', {},
          el('p.label', {}, `Attends to · ${related.length}`),
          el('ul.drawer-attn', {}, related.map((r) =>
            el('li', {}, el('button', { type: 'button', onclick: r.open }, el('span', {}, r.label), el('small', {}, r.sub))))))
      : null,
  ];
}
