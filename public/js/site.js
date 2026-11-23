(() => {
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  // entrance: stagger title lines and fades in reading order
  $$('.rise').forEach((el, i) => el.style.transitionDelay = (0.35 + i * 0.12) + 's');
  $$('[data-delay]').forEach(el => el.style.transitionDelay = el.dataset.delay + 's');
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('ready')));

  // hero video (home)
  const v = $('.hero video');
  if (v) {
    const hero = $('.hero');
    const showV = () => v.classList.add('on');
    if (v.readyState >= 2) showV(); else v.addEventListener('loadeddata', showV, { once: true });
    const fail = () => { if (!v.classList.contains('on')) hero.classList.add('novid'); };
    v.addEventListener('error', fail); setTimeout(fail, 3500);
    if (reduce) v.pause();
  }

  // mobile menu
  const mb = $('.menu-btn'), mm = $('#mmenu');
  if (mb && mm) {
    const setMenu = open => {
      mm.hidden = !open; mb.setAttribute('aria-expanded', open); mb.textContent = open ? 'close' : 'menu';
      document.body.style.overflow = open ? 'hidden' : '';
      Object.assign(mb.style, open ? { position: 'fixed', right: '22px', top: '28px' } : { position: '', right: '', top: '' });
    };
    mb.addEventListener('click', () => setMenu(mm.hidden));
    mm.addEventListener('click', e => { if (e.target.tagName === 'A') setMenu(false); });
    addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
    addEventListener('resize', () => { if (innerWidth > 900) setMenu(false); });
  }

  // Sydney clock
  const clock = $('#clock');
  if (clock) {
    const tick = () => clock.textContent = 'Sydney ' + new Intl.DateTimeFormat('en-AU', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Australia/Sydney' }).format(new Date());
    tick(); setInterval(tick, 30000);
  }

  // scroll reveals
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12 });
  const cols = parseInt(getComputedStyle(root).getPropertyValue('--cols')) || 2;
  $$('.reveal').forEach((el, i) => { el.style.transitionDelay = (el.dataset.stagger ? (i % cols) * 0.1 : 0) + 's'; io.observe(el); });
  setTimeout(() => $$('.reveal:not(.in)').forEach(el => { if (el.getBoundingClientRect().top < innerHeight * 1.2) el.classList.add('in'); }), 3000);

  // work filters
  const filters = $$('.filter');
  if (filters.length) {
    filters.forEach(btn => btn.addEventListener('click', () => {
      filters.forEach(b => b.setAttribute('aria-pressed', b === btn));
      const f = btn.dataset.f;
      $$('.pgrid .tile').forEach(t => {
        const show = f === 'all' || t.dataset.cat.split(' ').includes(f);
        t.classList.toggle('out', !show);
        setTimeout(() => t.hidden = !show, show ? 0 : 350);
        if (show) requestAnimationFrame(() => t.classList.remove('out'));
      });
    }));
  }

  // video embeds: load the player only when asked (fast pages, no tracking until play)
  $$('.embed').forEach(b => b.addEventListener('click', () => {
    const id = b.dataset.id, k = b.dataset.kind;
    const src = k === 'youtube' ? `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0` : `https://player.vimeo.com/video/${id}?autoplay=1`;
    b.innerHTML = `<iframe src="${src}" title="Video" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`;
  }, { once: true }));

  if (reduce) return;
  // signature: colour blooms near the viewport centre; ghost word parallax
  const imgs = $$('.frame img');
  const ghost = $('.ghost'), anchor = ghost && ghost.closest('section');
  let gy = 0;
  const frame = () => {
    const vh = innerHeight;
    imgs.forEach(img => {
      const r = img.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      const d = Math.abs((r.top + r.height / 2) - vh / 2) / (vh * 0.55);
      img.style.setProperty('--g', Math.min(1, Math.max(0, d)).toFixed(3));
    });
    if (ghost) {
      const target = -anchor.getBoundingClientRect().top * (+ghost.dataset.speed || 0.08);
      gy += (target - gy) * 0.12;
      ghost.style.transform = ghost.dataset.axis === 'x' ? `translateX(${gy.toFixed(1)}px)` : `translateY(${gy.toFixed(1)}px)`;
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
})();
