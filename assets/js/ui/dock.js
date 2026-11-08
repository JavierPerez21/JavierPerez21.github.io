/**
 * The floating "Explore" button, bottom right. Clicking it fans a few links
 * out above it (resume, Google Scholar, images, GitHub); clicking again,
 * pressing Esc or clicking anywhere else folds them away.
 */
import { el } from '../lib/util.js';

const ICONS = {
  resume: 'M7 3h7l5 5v13H7z M14 3v5h5 M10 13h6 M10 17h6',
  scholar: 'M3 9l9-5 9 5-9 5z M7 11.5V16c0 1.5 2.2 3 5 3s5-1.5 5-3v-4.5',
  images: 'M4 6h16v12H4z M4 15l4.5-4.5 4 4 2.5-2.5L20 17 M15.5 9.5a.01.01 0 1 0 0 .02',
  github: 'M9 19c-4 1.3-4-2-6-2.5 M15 21v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6 0-1.2-.4-2.3-1.2-3.2.1-.3.5-1.5-.1-3.2 0 0-1-.3-3.3 1.2a11.5 11.5 0 0 0-6 0C7.1 2.8 6 3.1 6 3.1c-.6 1.7-.2 2.9-.1 3.2A4.6 4.6 0 0 0 4.7 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21',
};

const icon = (id) => {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('class', 'dock-icon');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', ICONS[id] || 'M5 12h14 M13 6l6 6-6 6');
  svg.append(path);
  return svg;
};

export function initDock(root, items = []) {
  if (!root || !items.length) return;
  const list = el('ul.dock-menu', { id: 'dock-menu' },
    // Rendered top-down; the last item sits right above the button.
    items.slice().reverse().map((it, i, all) => el('li', { style: { '--i': all.length - 1 - i } },
      el('a.dock-item', {
        href: it.href,
        download: it.download || null,
        target: it.external ? '_blank' : null,
        rel: it.external ? 'noopener' : null,
        tabindex: '-1',
      }, icon(it.id), el('span.dock-label', {}, it.label), it.hint ? el('span.dock-hint', { 'aria-hidden': 'true' }, it.hint) : null))));
  const toggle = el('button.dock-toggle', { type: 'button', 'aria-expanded': 'false', 'aria-controls': 'dock-menu' },
    el('span.dock-toggle-label', {}, 'Explore'), el('span.dock-plus', { 'aria-hidden': 'true' }));
  root.append(list, toggle);

  const links = [...list.querySelectorAll('a')];
  const set = (open) => {
    root.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    links.forEach((a) => { a.tabIndex = open ? 0 : -1; });
  };
  toggle.addEventListener('click', () => set(!root.classList.contains('is-open')));
  links.forEach((a) => a.addEventListener('click', () => set(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && root.classList.contains('is-open')) { set(false); toggle.focus(); }
  });
  document.addEventListener('pointerdown', (e) => { if (!root.contains(e.target)) set(false); });
}
