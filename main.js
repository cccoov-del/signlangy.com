// SignLangy website: sign tiles that play on tap (or hover with a mouse),
// looping videos that only run while on screen, and gentle fade-ins.
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  const play = (v) => { const p = v.play(); if (p && p.catch) p.catch(() => {}); };

  // Sign tiles: one plays at a time.
  const tiles = [...document.querySelectorAll('.sign')];
  const stop = (tile) => {
    const v = tile.querySelector('video');
    v.pause();
    tile.classList.remove('on');
    tile.setAttribute('aria-pressed', 'false');
  };
  const start = (tile) => {
    tiles.forEach((t) => t !== tile && t.classList.contains('on') && stop(t));
    const v = tile.querySelector('video');
    v.preload = 'auto';
    play(v);
    tile.classList.add('on');
    tile.setAttribute('aria-pressed', 'true');
  };
  tiles.forEach((tile) => {
    const name = tile.querySelector('b').textContent;
    tile.setAttribute('aria-label', `Play the sign ${name}`);
    tile.addEventListener('click', () => (tile.classList.contains('on') ? stop(tile) : start(tile)));
    if (finePointer) {
      tile.addEventListener('mouseenter', () => start(tile));
      tile.addEventListener('mouseleave', () => stop(tile));
    }
  });

  // Hero and "explained" videos loop by themselves, but only while visible,
  // and never when the visitor prefers less motion.
  const loops = [...document.querySelectorAll('video.autoplay')];
  if ('IntersectionObserver' in window) {
    const seen = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        const v = e.target;
        if (e.isIntersecting && !reduceMotion) { v.preload = 'auto'; play(v); } else { v.pause(); }
      });
    }, { threshold: 0.35 });
    loops.forEach((v) => seen.observe(v));

    // Pause a playing tile once it scrolls away.
    const away = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (!e.isIntersecting && e.target.classList.contains('on')) stop(e.target); });
    });
    tiles.forEach((t) => away.observe(t));

    // Fade-ins.
    const reveals = document.querySelectorAll('.reveal');
    if (reduceMotion) {
      reveals.forEach((el) => el.classList.add('in'));
    } else {
      const show = new IntersectionObserver((entries) => {
        entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); show.unobserve(e.target); } });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
      reveals.forEach((el) => show.observe(el));
    }
  } else {
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('in'));
    if (!reduceMotion) loops.forEach(play);
  }

  // FAQ: keep one answer open at a time.
  const items = document.querySelectorAll('details');
  items.forEach((d) => d.addEventListener('toggle', () => {
    if (d.open) items.forEach((o) => o !== d && (o.open = false));
  }));

  document.querySelectorAll('.year').forEach((el) => { el.textContent = new Date().getFullYear(); });
})();
