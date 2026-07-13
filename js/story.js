/* Scroll storytelling engine for the workflow section.
   One panel morphs through the real Fizz flow while the user scrolls:
   ticket opens, joins the queue, Rush overtakes, status moves, files
   are delivered, the ticket becomes a transcript. Desktop only; mobile
   and reduced motion get the stacked stage cards instead (CSS). */
(() => {
  'use strict';

  const track = document.getElementById('storyTrack');
  if (!track) return;

  const html = document.documentElement;
  if (html.classList.contains('reduced')) return;

  const $ = (id) => document.getElementById(id);

  const layers = {
    ticket: $('slTicket'),
    queue: $('slQueue'),
    deliver: $('slDeliver'),
    archive: $('slArchive')
  };
  const rowA = $('stRowA'), rowB = $('stRowB'), rowC = $('stRowC');
  const badge = $('stBadge');
  const chipWait = $('stChipWait'), chipProg = $('stChipProg');
  const c2 = $('stC2'), c3 = $('stC3');
  const note = $('stNote');
  const m1 = $('stM1'), m2 = $('stM2');
  const attBar = $('stAttBar');
  const stamp = $('stStamp');
  const word = $('stWord');
  const bar = $('stBarFillRail');
  const railItems = Array.prototype.slice.call(document.querySelectorAll('.st-i'));

  if (!layers.ticket || !layers.queue || !layers.deliver || !layers.archive) return;

  const STEP = 68; // px between queue slots
  const WORDS = ['Open', 'Queue', 'Priority', 'Progress', 'Deliver', 'Archive'];
  const RAIL = [[0, 0.16], [0.16, 0.33], [0.33, 0.50], [0.50, 0.68], [0.68, 0.85], [0.85, 1.001]];

  const mq = matchMedia('(min-width: 1100px)');

  let active = false;
  let rafId = null;
  let top = 0, len = 1;
  let wordIdx = -1;
  let resizeT = null;

  const smooth = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
  const seg = (p, a, b) => smooth((p - a) / (b - a));

  function measure() {
    const r = track.getBoundingClientRect();
    top = r.top + window.scrollY;
    len = Math.max(1, track.offsetHeight - window.innerHeight);
  }

  function layerAlpha(el, p, a, b, holdEnd) {
    const f = Math.min(0.05, (b - a) * 0.3);
    let al = seg(p, a, a + f);
    if (!holdEnd) al *= 1 - seg(p, b - f, b);
    el.style.opacity = al.toFixed(3);
    el.style.transform = 'translateY(' + ((1 - al) * 14).toFixed(2) + 'px)';
    el.style.pointerEvents = al > 0.5 ? 'auto' : 'none';
  }

  function apply(p) {
    // Panel layers
    layerAlpha(layers.ticket, p, 0.00, 0.16, false);
    layerAlpha(layers.queue, p, 0.16, 0.68, false);
    layerAlpha(layers.deliver, p, 0.68, 0.85, false);
    layerAlpha(layers.archive, p, 0.85, 1.0, true);

    // Stage 2: Client #1 slides into the queue
    const enter = seg(p, 0.18, 0.26);
    const extraY = (1 - enter) * 26;
    c2.style.opacity = (1 - seg(p, 0.21, 0.25)).toFixed(3);
    c3.style.opacity = seg(p, 0.21, 0.25).toFixed(3);

    // Stage 3: Rush overtakes (slot positions interpolate)
    const q = seg(p, 0.36, 0.47);
    rowA.style.transform = 'translateY(' + ((0 + q) * STEP).toFixed(2) + 'px)';
    rowB.style.transform = 'translateY(' + ((1 + q) * STEP).toFixed(2) + 'px)';
    rowC.style.opacity = enter.toFixed(3);
    rowC.style.transform = 'translateY(' + ((2 - 2 * q) * STEP + extraY).toFixed(2) + 'px)';

    const b = seg(p, 0.335, 0.365);
    badge.style.opacity = b.toFixed(3);
    badge.style.transform = 'scale(' + (0.85 + 0.15 * b).toFixed(3) + ')';
    const hl = Math.sin(Math.PI * q);
    rowC.style.borderColor = 'rgba(255,59,59,' + (0.12 + 0.4 * hl).toFixed(3) + ')';

    // Stage 4: status flips, private note appears
    const flip = seg(p, 0.53, 0.575);
    chipWait.style.opacity = (1 - flip).toFixed(3);
    chipProg.style.opacity = flip.toFixed(3);
    const nt = seg(p, 0.58, 0.64);
    note.style.opacity = nt.toFixed(3);
    note.style.transform = 'translateY(' + ((1 - nt) * 8).toFixed(2) + 'px)';

    // Stage 5: delivery messages and attachment
    const a1 = seg(p, 0.70, 0.74);
    m1.style.opacity = a1.toFixed(3);
    m1.style.transform = 'translateY(' + ((1 - a1) * 10).toFixed(2) + 'px)';
    attBar.style.transform = 'scaleX(' + seg(p, 0.735, 0.795).toFixed(3) + ')';
    const a2 = seg(p, 0.80, 0.84);
    m2.style.opacity = a2.toFixed(3);
    m2.style.transform = 'translateY(' + ((1 - a2) * 10).toFixed(2) + 'px)';

    // Stage 6: archive stamp
    const st = seg(p, 0.895, 0.94);
    stamp.style.opacity = st.toFixed(3);
    stamp.style.transform = 'scale(' + (0.94 + 0.06 * st).toFixed(3) + ')';

    // Rail + progress bar + background word
    let idx = 0;
    for (let i = 0; i < RAIL.length; i++) {
      const on = p >= RAIL[i][0] && p < RAIL[i][1];
      railItems[i].classList.toggle('on', on);
      if (on) idx = i;
    }
    if (bar) bar.style.transform = 'scaleY(' + Math.max(0, Math.min(1, p)).toFixed(4) + ')';
    if (idx !== wordIdx) {
      wordIdx = idx;
      word.style.opacity = '0';
      const target = WORDS[idx];
      setTimeout(() => {
        if (wordIdx === idx) { word.textContent = target; word.style.opacity = ''; }
      }, 150);
    }
  }

  function loop() {
    if (!active) return;
    const p = Math.max(0, Math.min(1, (window.scrollY - top) / len));
    apply(p);
    rafId = requestAnimationFrame(loop);
  }

  function enable() {
    if (active || !mq.matches) return;
    measure();
    active = true;
    rafId = requestAnimationFrame(loop);
  }

  function disable() {
    active = false;
    if (rafId != null) cancelAnimationFrame(rafId);
    rafId = null;
  }

  let inView = false;

  function evaluate() {
    if (inView && mq.matches && !document.hidden) enable();
    else disable();
  }

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      const last = entries[entries.length - 1];
      inView = !!(last && last.isIntersecting);
      evaluate();
    }, { threshold: 0 });
    io.observe(track);
  } else {
    inView = true;
    evaluate();
  }

  const onMq = () => { disable(); evaluate(); };
  if (mq.addEventListener) mq.addEventListener('change', onMq);

  window.addEventListener('resize', () => {
    clearTimeout(resizeT);
    resizeT = setTimeout(() => { measure(); evaluate(); }, 160);
  }, { passive: true });

  document.addEventListener('visibilitychange', evaluate);

  measure();
  if (mq.matches) apply(0);
})();
