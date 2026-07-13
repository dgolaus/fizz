/* App wiring: nav state, mobile menu, reveals, hero demo loop,
   marquee pause, interactive Rush queue (FLIP), transcript viewer,
   terminal typing and the all-commands dialog. */
(() => {
  'use strict';

  const html = document.documentElement;
  const reduced = html.classList.contains('reduced');
  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.prototype.slice.call((c || document).querySelectorAll(s));

  /* ---------- nav scrolled state ---------- */
  const nav = $('#nav');
  function onScroll() {
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 24);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- mobile menu ---------- */
  const burger = $('#navBurger');
  const menu = $('#mobMenu');
  function closeMenu() {
    if (!menu || !burger) return;
    menu.classList.remove('open');
    burger.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Open menu');
    html.classList.remove('is-locked');
  }
  if (burger && menu) {
    burger.addEventListener('click', () => {
      const open = !menu.classList.contains('open');
      menu.classList.toggle('open', open);
      burger.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      html.classList.toggle('is-locked', open);
      if (open) {
        const first = $('a', menu);
        if (first) first.focus();
      }
    });
    $$('a', menu).forEach((a) => a.addEventListener('click', closeMenu));
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menu.classList.contains('open')) {
        closeMenu();
        burger.focus();
      }
    });
  }

  /* ---------- reveals ---------- */
  const reveals = $$('[data-rv]');
  if (reduced || !('IntersectionObserver' in window)) {
    reveals.forEach((el) => el.classList.add('in'));
  } else {
    const groups = new Map();
    reveals.forEach((el) => {
      const p = el.parentElement;
      const i = groups.get(p) || 0;
      el.style.transitionDelay = Math.min(i * 80, 320) + 'ms';
      groups.set(p, i + 1);
    });
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    reveals.forEach((el) => io.observe(el));
  }

  /* ---------- hero demo loop ---------- */
  const demo = $('#heroDemo');
  if (demo && !reduced) {
    const STATES = ['1', '2', '3'];
    const HOLD = [2400, 2500, 3400];
    let i = 0, timer = null, visible = true;

    function tick() {
      demo.setAttribute('data-s', STATES[i]);
      timer = setTimeout(() => {
        i = (i + 1) % STATES.length;
        tick();
      }, HOLD[i]);
    }
    function play() { if (timer == null) { tick(); } }
    function pause() { if (timer != null) { clearTimeout(timer); timer = null; } }
    function evaluate() { (visible && !document.hidden) ? play() : pause(); }

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        const last = entries[entries.length - 1];
        visible = last ? last.isIntersecting : true;
        evaluate();
      }, { threshold: 0.2 });
      io.observe(demo);
    } else {
      play();
    }
    document.addEventListener('visibilitychange', evaluate);
  }

  /* ---------- marquee pause offscreen ---------- */
  const band = $('#band');
  if (band && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      const last = entries[entries.length - 1];
      band.classList.toggle('off', !(last && last.isIntersecting));
    }, { threshold: 0 });
    io.observe(band);
  }

  /* ---------- interactive queue (FLIP Rush) ---------- */
  const list = $('#iqList');
  const rushRow = $('#iqRushRow');
  const rushBtn = $('#iqRushBtn');
  const live = $('#iqLive');
  const count = $('#iqCount');

  if (list && rushRow && rushBtn) {
    rushBtn.addEventListener('click', () => {
      const rows = $$('.dq-row', list);
      const firstTops = rows.map((r) => r.getBoundingClientRect().top);
      const wasRushed = rushRow.classList.contains('rushed');

      if (!wasRushed) list.insertBefore(rushRow, list.firstElementChild);
      else list.appendChild(rushRow);
      rushRow.classList.toggle('rushed', !wasRushed);

      // Renumber positions by DOM order
      $$('.dq-row', list).forEach((r, idx) => {
        const pos = $('.dq-pos', r);
        if (pos) pos.textContent = String(idx + 1);
      });

      if (count) count.textContent = wasRushed ? '3 pending' : '3 pending · 1 rush';
      if (live) live.textContent = wasRushed
        ? 'Client #3 returned to position 3.'
        : 'Client #3 moved to position 1 with Rush Priority.';
      rushBtn.textContent = wasRushed ? 'Rush' : 'Undo';
      rushBtn.setAttribute('aria-pressed', String(!wasRushed));

      if (!reduced) {
        // FLIP: invert to old positions, then release to the new ones
        rows.forEach((r, idx) => {
          const d = firstTops[idx] - r.getBoundingClientRect().top;
          if (!d) return;
          r.style.transition = 'none';
          r.style.transform = 'translateY(' + d + 'px)';
        });
        void list.offsetHeight; // reflow
        rows.forEach((r) => {
          r.style.transition = '';
          r.style.transform = '';
        });
      }
    });
  }

  /* ---------- transcript viewer ---------- */
  const TICKETS = {
    t41: {
      num: '041', type: 'Thumbnail order',
      meta: 'Opened Jul 12 · Closed Jul 15 · Client #1 + Artist',
      msgs: [
        { who: 'Client #1', a: '', t: 'Jul 12 · 09:02', text: 'hi! could you make a thumbnail for my game?' },
        { who: 'Artist', a: 'ava-red', t: 'Jul 12 · 09:20', text: 'sure. i will send a first version today.' },
        { who: 'Client #1', a: '', t: 'Jul 14 · 18:12', text: 'could you make the main object stand out more?' },
        { who: 'Artist', a: 'ava-red', t: 'Jul 14 · 18:30', text: 'yes, i will adjust the contrast and send an updated version.' },
        { who: 'Artist', a: 'ava-red', t: 'Jul 15 · 16:40', text: 'final files are attached below.', att: ['thumbnail-final.png', '2.4 MB'] },
        { who: 'Client #1', a: '', t: 'Jul 15 · 16:52', text: 'looks great, thank you.' }
      ],
      note: 'private note · client prefers bold titles'
    },
    t40: {
      num: '040', type: 'Game icon order',
      meta: 'Opened Jul 08 · Closed Jul 10 · Client #2 + Artist',
      msgs: [
        { who: 'Client #2', a: '', t: 'Jul 08 · 14:11', text: 'hi! one game icon, same style as my banner please.' },
        { who: 'Artist', a: 'ava-red', t: 'Jul 08 · 14:25', text: 'sure. i will send a first version tomorrow.' },
        { who: 'Artist', a: 'ava-red', t: 'Jul 09 · 19:03', text: 'here is the first version.', att: ['icon-v1.png', '1.1 MB'] },
        { who: 'Client #2', a: '', t: 'Jul 10 · 10:40', text: 'perfect, approved.' }
      ],
      note: 'private note · reuse the banner palette'
    },
    t39: {
      num: '039', type: 'Banner order',
      meta: 'Opened Jul 05 · Closed Jul 07 · Client #3 + Artist',
      msgs: [
        { who: 'Client #3', a: '', t: 'Jul 05 · 11:32', text: 'can the banner match my thumbnail colors?' },
        { who: 'Artist', a: 'ava-red', t: 'Jul 05 · 11:47', text: 'yes, sending a preview soon.' },
        { who: 'Artist', a: 'ava-red', t: 'Jul 06 · 20:15', text: 'preview attached.', att: ['banner-preview.png', '3.0 MB'] },
        { who: 'Client #3', a: '', t: 'Jul 07 · 09:05', text: 'love it.' }
      ],
      note: 'private note · deliver in two sizes'
    }
  };

  const tsApp = $('#tsApp');
  const tsMain = $('#tsMain');

  function esc(s) {
    return String(s).replace(/[&<>"]/g, (c) => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]
    ));
  }

  function renderTicket(key) {
    const d = TICKETS[key];
    if (!d || !tsMain) return;
    let out = '';
    out += '<div class="ts-top"><span class="k-label">Ticket #' + d.num + ' · ' + esc(d.type) + '</span>';
    out += '<span class="chip chip-closed">Closed</span></div>';
    out += '<p class="ts-meta">' + esc(d.meta) + '</p>';
    out += '<div class="ts-msgs">';
    d.msgs.forEach((m, i) => {
      out += '<div class="bubble msg" style="--i:' + i + '">';
      out += '<span class="ava ' + m.a + '"></span><div>';
      out += '<p class="who">' + esc(m.who) + ' <time>' + esc(m.t) + '</time></p>';
      out += '<p class="txt">' + esc(m.text) + '</p>';
      if (m.att) {
        out += '<div class="att"><span class="att-ic" aria-hidden="true">▣</span>';
        out += '<span class="att-name">' + esc(m.att[0]) + '</span>';
        out += '<span class="att-size">' + esc(m.att[1]) + '</span></div>';
      }
      out += '</div></div>';
    });
    out += '</div>';
    out += '<p class="ts-note">' + esc(d.note) + '</p>';
    out += '<p class="ts-foot k-label">Transcript saved · channel deleted</p>';
    tsMain.innerHTML = out;

    if (tsApp && !reduced) {
      tsApp.classList.remove('seen');
      void tsApp.offsetHeight;
      tsApp.classList.add('seen');
    } else if (tsApp) {
      tsApp.classList.add('seen');
    }
  }

  $$('.ts-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      $$('.ts-tab').forEach((t) => t.classList.toggle('on', t === tab));
      renderTicket(tab.getAttribute('data-t'));
    });
  });

  // Stagger indexes for the server-rendered initial ticket
  if (tsApp) {
    $$('.msg', tsApp).forEach((m, i) => m.style.setProperty('--i', String(i)));
    if (reduced || !('IntersectionObserver' in window)) {
      tsApp.classList.add('seen');
    } else {
      const io = new IntersectionObserver((entries) => {
        if (entries[0] && entries[0].isIntersecting) {
          tsApp.classList.add('seen');
          io.disconnect();
        }
      }, { threshold: 0.25 });
      io.observe(tsApp);
    }
  }

  /* ---------- terminal typing ---------- */
  const term = $('#term');
  if (term) {
    const lines = $$('.t-line', term);
    const show = () => lines.forEach((l, i) => setTimeout(() => l.classList.add('show'), i * 280));
    if (reduced || !('IntersectionObserver' in window)) {
      lines.forEach((l) => l.classList.add('show'));
    } else {
      const io = new IntersectionObserver((entries) => {
        if (entries[0] && entries[0].isIntersecting) { show(); io.disconnect(); }
      }, { threshold: 0.4 });
      io.observe(term);
    }
  }

  /* ---------- all-commands dialog ---------- */
  const dlg = $('#cmdsDialog');
  const dlgClose = $('#cmdsClose');
  if (dlg && typeof dlg.showModal === 'function') {
    const unlock = () => html.classList.remove('is-locked');
    const closeDlg = () => { dlg.close(); unlock(); };
    $$('[data-open-commands]').forEach((b) => {
      b.addEventListener('click', () => {
        dlg.showModal();
        html.classList.add('is-locked');
      });
    });
    // Event listeners cover the native Escape path; explicit paths unlock synchronously
    dlg.addEventListener('close', unlock);
    dlg.addEventListener('cancel', unlock);
    dlg.addEventListener('click', (e) => { if (e.target === dlg) closeDlg(); });
    if (dlgClose) dlgClose.addEventListener('click', closeDlg);
  } else if (dlg) {
    // Very old browser fallback: reveal as a plain block
    $$('[data-open-commands]').forEach((b) => {
      b.addEventListener('click', () => dlg.setAttribute('open', ''));
    });
    if (dlgClose) dlgClose.addEventListener('click', () => dlg.removeAttribute('open'));
  }
})();
