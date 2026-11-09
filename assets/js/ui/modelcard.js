/** §04 · Résumé: the whole CV on one card. */
import { el } from '../lib/util.js';

export function renderModelCard(root, { modelCard: mc, skillGroups, profile }) {
  const ext = (href) => (href.startsWith('http') ? { target: '_blank', rel: 'noopener' } : {});

  const updated = new Date(`${profile.updated}-01T12:00:00`).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
  const head = el('header.mc-head', {},
    el('p.mc-id', {},
      el('strong', {}, profile.name),
      el('span.mc-owner', {}, ` · ${profile.now}`),
      el('span.mc-ver', {}, `Updated ${updated}`)),
    el('ul.mc-badges', {}, mc.badges.map((b) => el('li', {}, b))));

  const capabilities = el('ul.mc-caps', {}, Object.values(skillGroups).map((g) =>
    el('li', {}, el('strong', {}, g.label), el('span', {}, g.text))));

  const rows = el('dl.mc-rows', {},
    mc.rows.slice(0, 3).flatMap((r) => [el('dt', {}, r.k), el('dd', {}, r.v)]),
    el('dt', {}, 'Skills'), el('dd', {}, capabilities),
    mc.rows.slice(3).flatMap((r) => [
      el('dt', {}, r.k),
      el('dd', {}, r.v, r.link ? [' ', el('a.inline', { href: r.link.href, ...ext(r.link.href) }, r.link.label)] : null),
    ]));

  const evals = el('table.mc-evals', {},
    el('thead', {}, el('tr', {}, el('th', {}, 'Highlight'), el('th', {}, 'Result'))),
    el('tbody', {}, mc.evals.map((e) =>
      el('tr', {}, el('td', {}, e.bench, el('small', {}, e.note)), el('td.mc-score', {}, e.score)))));

  const side = el('aside.mc-side', {},
    el('section', {}, el('h3.label', {}, 'Key figures'), evals),
    el('section', {}, el('h3.label', {}, 'Honours'),
      mc.honors.map((g) => el('div.mc-group', {},
        el('h4.mc-sub', {}, g.label),
        el('ul.mc-list', {}, g.items.map((h) => el('li', {}, h)))))),
    el('section', {}, el('h3.label', {}, 'Certifications'),
      el('ul.mc-list', {}, mc.certs.map((c) => el('li', {}, el('a.inline', { href: c.href, ...ext(c.href) }, c.label))))));

  root.append(head, el('div.mc-grid', {}, rows, side));
}
