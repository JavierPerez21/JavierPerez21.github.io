/** Top bar: Madrid clock and active chapter. */
export function initNav({ timezone }) {
  const clock = document.querySelector('[data-clock]');
  if (clock) {
    const fmt = new Intl.DateTimeFormat('en-GB', { timeZone: timezone, hour: '2-digit', minute: '2-digit', timeZoneName: 'short' });
    const tick = () => { clock.textContent = fmt.format(new Date()).replace(/^(\d\d:\d\d)\s*/, '$1 '); };
    tick();
    setInterval(tick, 15000);
  }

  const links = new Map([...document.querySelectorAll('[data-nav]')].map((a) => [a.getAttribute('href').slice(1), a]));
  const chapters = [...document.querySelectorAll('[data-chapter]')];
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      links.forEach((a, id) => a.classList.toggle('is-active', id === e.target.id));
      document.documentElement.dataset.chapter = e.target.id;
    }
  }, { rootMargin: '-50% 0px -50% 0px' });
  chapters.forEach((c) => io.observe(c));
}
