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

  // inner page header video fades in once it can play
  document.querySelectorAll('.ph-bg video').forEach(v => {
    const on = () => v.classList.add('on');
    if (v.readyState >= 3) on(); else v.addEventListener('canplay', on, { once: true });
    v.addEventListener('error', on, true);
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { v.removeAttribute('autoplay'); v.pause(); on(); }
  });

  // mobile / tablet menu: hamburger morphs into a close (X) button
  const mb = $('.menu-btn'), mm = $('#mmenu');
  if (mb && mm) {
    const setMenu = open => {
      mm.hidden = !open; mb.classList.toggle('open', open);
      mb.setAttribute('aria-expanded', open); mb.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      document.body.style.overflow = open ? 'hidden' : ''; document.body.classList.toggle('menu-open', open);
    };
    mb.addEventListener('click', () => setMenu(mm.hidden));
    mm.addEventListener('click', e => { if (e.target.tagName === 'A') setMenu(false); });
    addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
    addEventListener('resize', () => { if (innerWidth > 1024) setMenu(false); });
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

  // copy email
  $$('.copy-btn').forEach(b => b.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(b.dataset.copy); b.textContent = 'Copied'; }
    catch { b.textContent = b.dataset.copy; }
    setTimeout(() => b.textContent = 'Copy email', 2000);
  }));

  // contact form: Web3Forms + honeypot + time-trap + validation
  const form = $('#contact-form');
  if (form) {
    const started = Date.now();
    const status = $('.status', form), btn = $('button[type=submit]', form);
    const say = (t, cls) => { status.textContent = t; status.className = 'status ' + (cls || ''); };
    form.addEventListener('submit', async e => {
      e.preventDefault();
      $$('.err', form).forEach(x => x.remove());
      let bad = false;
      $$('[required]', form).forEach(f => {
        if (!f.checkValidity()) { bad = true; const m = document.createElement('span'); m.className = 'err'; m.textContent = f.type === 'email' ? 'Please enter a valid email.' : 'Please fill this in.'; f.after(m); }
      });
      if (bad) return say('Please check the highlighted fields.', 'bad');
      const data = Object.fromEntries(new FormData(form));
      // bots: tick the hidden box or submit within seconds of loading
      if (data.botcheck || Date.now() - started < 3000) return say('Thanks! Your message has been sent.', 'ok');
      if (!form.dataset.key) {
        const body = encodeURIComponent(`${data.message}\n\n${data.name} · ${data.email} · ${data.project_type}`);
        location.href = `mailto:${form.dataset.email}?subject=${encodeURIComponent('Project enquiry')}&body=${body}`;
        return say('Opening your email app…');
      }
      if ('h-captcha-response' in data && !data['h-captcha-response']) return say('Please complete the captcha.', 'bad');
      delete data.botcheck; delete data._started;
      btn.disabled = true; say('Sending…');
      try {
        const r = await fetch(form.action, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data) });
        const j = await r.json();
        if (r.ok && j.success) { form.reset(); say('Thanks! Your message has been sent. I\'ll reply soon.', 'ok'); }
        else say(j.message || 'Something went wrong. Please email me directly.', 'bad');
      } catch { say('Network error. Please email me directly.', 'bad'); }
      finally { btn.disabled = false; if (window.hcaptcha) try { hcaptcha.reset(); } catch {} }
    });
  }

  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

  // custom cursor: a circle that inverts whatever is under it
  const cur = $('.cursor');
  if (cur && fine) {
    root.classList.add('has-cursor');
    let x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y;
    addEventListener('pointermove', e => { x = e.clientX; y = e.clientY; cur.classList.add('on'); }, { passive: true });
    document.addEventListener('pointerleave', () => cur.classList.remove('on'));
    addEventListener('pointerdown', () => cur.classList.add('down'));
    addEventListener('pointerup', () => cur.classList.remove('down'));
    document.addEventListener('pointerover', e => cur.classList.toggle('big', !!e.target.closest('a, button, label, input, textarea, select, .tile')));
    const k = reduce ? 1 : 0.22;
    const loop = () => { cx += (x - cx) * k; cy += (y - cy) * k; cur.style.transform = `translate3d(${cx}px, ${cy}px, 0)`; requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  }

  // hero: reveal the original colour video in a soft circle around the cursor
  const hero = $('.hero'), vc = $('.hero .v-color'), vb = $('.hero .v-bw');
  if (hero && vc && vb && fine && innerWidth > 900 && !reduce) {
    vc.src = vc.dataset.src; vc.load();
    let mx = -999, my = -999, tx = mx, ty = my, r = 0, tr = 0, inside = false;
    hero.addEventListener('pointerenter', e => { inside = true; const b = hero.getBoundingClientRect(); mx = tx = e.clientX - b.left; my = ty = e.clientY - b.top; vc.play().catch(() => {}); });
    hero.addEventListener('pointermove', e => { const b = hero.getBoundingClientRect(); tx = e.clientX - b.left; ty = e.clientY - b.top; });
    hero.addEventListener('pointerleave', () => { inside = false; });
    const step = () => {
      tr = inside ? Math.max(180, innerWidth * 0.14) : 0;
      r += (tr - r) * 0.08; mx += (tx - mx) * 0.14; my += (ty - my) * 0.14;
      hero.style.setProperty('--mx', mx.toFixed(1) + 'px'); hero.style.setProperty('--my', my.toFixed(1) + 'px'); hero.style.setProperty('--r', r.toFixed(1) + 'px');
      if (vc.readyState >= 2 && Math.abs(vc.currentTime - vb.currentTime) > 0.08) vc.currentTime = vb.currentTime;
      if (!inside && r < 1 && !vc.paused) vc.pause();
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

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
