/** §04 · Model card: the whole CV, in the format of a model card. */
import { el } from '../lib/util.js';

export function renderModelCard(root, { modelCard: mc, skillGroups, profile }) {
  const ext = (href) => (href.startsWith('http') ? { target: '_blank', rel: 'noopener' } : {});

  const head = el('header.mc-head', {},
    el('p.mc-id', {},
      el('span.mc-owner', {}, 'javierperez21 / '),
      el('strong', {}, mc.id),
      el('span.mc-ver', {}, mc.version)),
    el('ul.mc-badges', {}, mc.badges.map((b) => el('li', {}, b))));

  const capabilities = el('ul.mc-caps', {}, Object.values(skillGroups).map((g) =>
    el('li', {}, el('strong', {}, g.label), el('span', {}, g.text))));

  const rows = el('dl.mc-rows', {},
    mc.rows.slice(0, 3).flatMap((r) => [el('dt', {}, r.k), el('dd', {}, r.v)]),
    el('dt', {}, 'Capabilities'), el('dd', {}, capabilities),
    mc.rows.slice(3).flatMap((r) => [
      el('dt', {}, r.k),
      el('dd', {}, r.v, r.link ? [' ', el('a.inline', { href: r.link.href, ...ext(r.link.href) }, r.link.label)] : null),
    ]));

  const evals = el('table.mc-evals', {},
    el('thead', {}, el('tr', {}, el('th', {}, 'Benchmark'), el('th', {}, 'Score'))),
    el('tbody', {}, mc.evals.map((e) =>
      el('tr', {}, el('td', {}, e.bench, el('small', {}, e.note)), el('td.mc-score', {}, e.score)))));

  const side = el('aside.mc-side', {},
    el('section', {}, el('h3.label', {}, 'Evaluation'), evals),
    el('section', {}, el('h3.label', {}, 'Honours'), el('ul.mc-list', {}, mc.honors.map((h) => el('li', {}, h)))),
    el('section', {}, el('h3.label', {}, 'Certifications'),
      el('ul.mc-list', {}, mc.certs.map((c) => el('li', {}, el('a.inline', { href: c.href, ...ext(c.href) }, c.label))))),
    el('section', {}, el('h3.label', {}, 'Citation'),
      el('pre.mc-cite', {}, `@human{${profile.name.toLowerCase().replace(/\s+/g, '')}${mc.version.slice(1, 5)},\n  title  = {${profile.name}},\n  role   = {${profile.role}},\n  where  = {${profile.location}},\n  email  = {${profile.email}}\n}`)));

  root.append(head, el('div.mc-grid', {}, rows, side));
}
