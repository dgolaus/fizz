/* Intro sequence. Shows once per session (sessionStorage), skippable,
   disabled for reduced motion, and can never trap the page: a failsafe
   timeout always releases, and without JS the overlay stays hidden. */
(() => {
  'use strict';

  const el = document.getElementById('intro');
  const html = document.documentElement;
  const body = document.body;

  const finishState = () => {
    el.hidden = true;
    html.classList.remove('is-locked');
    body.classList.add('ready');
  };

  if (!el) { body.classList.add('ready'); return; }

  const reduced = html.classList.contains('reduced');
  let seen = false;
  try { seen = sessionStorage.getItem('fizzIntro') === '1'; } catch (e) {}

  if (reduced || seen) { finishState(); return; }

  try { sessionStorage.setItem('fizzIntro', '1'); } catch (e) {}

  el.hidden = false;
  html.classList.add('is-locked');

  const timers = [];
  let done = false;

  function finish() {
    if (done) return;
    done = true;
    timers.forEach(clearTimeout);
    finishState();
  }

  const phase = (n) => el.setAttribute('data-phase', String(n));

  phase(0);
  timers.push(setTimeout(() => phase(1), 520));
  timers.push(setTimeout(() => phase(2), 1450));
  timers.push(setTimeout(() => phase(3), 1900)); // wipe up
  timers.push(setTimeout(finish, 2560));
  timers.push(setTimeout(finish, 4500)); // failsafe, always releases

  const skip = document.getElementById('introSkip');
  if (skip) skip.addEventListener('click', finish);
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !el.hidden) finish();
  });
})();
