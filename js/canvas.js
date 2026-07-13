/* Hero background canvas: a quiet network of commissions.
   Nodes stand for clients, tickets and orders. Hairline links connect
   nearby nodes; the cursor gently pulls the ones close to it, like a
   client connecting to the artist. Pauses when hidden or out of view. */
(() => {
  'use strict';

  const canvas = document.getElementById('net');
  if (!canvas) return;

  let ctx = null;
  try { ctx = canvas.getContext('2d'); } catch (e) { return; }
  if (!ctx) { canvas.remove(); return; }

  const html = document.documentElement;
  const reduced = html.classList.contains('reduced');

  const LINK_DIST = 120;
  const MOUSE_R = 160;
  const MOUSE_PULL = 16;

  let w = 0, h = 0, dpr = 1;
  let nodes = [];
  let running = false;
  let rafId = null;
  let inView = true;
  let resizeT = null;

  const pointer = { x: -9999, y: -9999, cx: -9999, cy: -9999, active: false };

  const isSmall = () => matchMedia('(max-width: 859px)').matches;

  function size() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    const r = canvas.getBoundingClientRect();
    w = Math.max(1, r.width);
    h = Math.max(1, r.height);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed();
  }

  function seed() {
    const cap = isSmall() ? 34 : 88;
    const count = Math.min(cap, Math.round((w * h) / 16000));
    nodes = [];
    for (let i = 0; i < count; i++) {
      nodes.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.14,
        vy: (Math.random() - 0.5) * 0.14,
        r: 1.1 + Math.random() * 1.5,
        red: Math.random() < 0.09,
        ph: Math.random() * Math.PI * 2
      });
    }
  }

  function frame(t) {
    if (!running) return;

    // Lerp the pointer for soft influence
    pointer.cx += (pointer.x - pointer.cx) * 0.07;
    pointer.cy += (pointer.y - pointer.cy) * 0.07;

    ctx.clearRect(0, 0, w, h);

    const n = nodes.length;
    const time = t * 0.001;

    // Move and compute draw positions (with limited mouse pull)
    for (let i = 0; i < n; i++) {
      const p = nodes[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < -20) p.x = w + 20; else if (p.x > w + 20) p.x = -20;
      if (p.y < -20) p.y = h + 20; else if (p.y > h + 20) p.y = -20;

      let dx = p.x + Math.sin(time * 0.6 + p.ph) * 4;
      let dy = p.y + Math.cos(time * 0.5 + p.ph) * 4;

      let near = 0;
      if (pointer.active) {
        const mx = pointer.cx - dx;
        const my = pointer.cy - dy;
        const d = Math.hypot(mx, my);
        if (d < MOUSE_R && d > 0.001) {
          near = 1 - d / MOUSE_R;
          dx += (mx / d) * near * MOUSE_PULL;
          dy += (my / d) * near * MOUSE_PULL;
        }
      }
      p.dx = dx; p.dy = dy; p.near = near;
    }

    // Links
    ctx.lineWidth = 1;
    for (let i = 0; i < n; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < n; j++) {
        const b = nodes[j];
        const ddx = a.dx - b.dx;
        const ddy = a.dy - b.dy;
        const d2 = ddx * ddx + ddy * ddy;
        if (d2 > LINK_DIST * LINK_DIST) continue;
        const d = Math.sqrt(d2);
        const boost = 1 + Math.max(a.near, b.near) * 1.4;
        const alpha = (1 - d / LINK_DIST) * 0.11 * boost;
        const redLink = a.red || b.red;
        ctx.strokeStyle = redLink
          ? 'rgba(255,59,59,' + (alpha * 0.9).toFixed(3) + ')'
          : 'rgba(235,235,242,' + alpha.toFixed(3) + ')';
        ctx.beginPath();
        ctx.moveTo(a.dx, a.dy);
        ctx.lineTo(b.dx, b.dy);
        ctx.stroke();
      }
    }

    // Dots
    for (let i = 0; i < n; i++) {
      const p = nodes[i];
      const glow = 0.32 + p.near * 0.5;
      ctx.fillStyle = p.red
        ? 'rgba(255,59,59,' + (glow + 0.15).toFixed(3) + ')'
        : 'rgba(235,235,242,' + glow.toFixed(3) + ')';
      ctx.beginPath();
      ctx.arc(p.dx, p.dy, p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    rafId = requestAnimationFrame(frame);
  }

  function start() {
    if (running || reduced) return;
    running = true;
    rafId = requestAnimationFrame(frame);
  }

  function stop() {
    running = false;
    if (rafId != null) cancelAnimationFrame(rafId);
    rafId = null;
  }

  function evaluate() {
    if (inView && !document.hidden) start(); else stop();
  }

  // Pointer (desktop only; touch keeps ambient drift)
  if (!isSmall()) {
    window.addEventListener('pointermove', (e) => {
      const r = canvas.getBoundingClientRect();
      pointer.x = e.clientX - r.left;
      pointer.y = e.clientY - r.top;
      pointer.active = true;
    }, { passive: true });
    window.addEventListener('pointerleave', () => { pointer.active = false; }, { passive: true });
  }

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      const last = entries[entries.length - 1];
      inView = last ? last.isIntersecting : true;
      evaluate();
    }, { threshold: 0 });
    io.observe(canvas);
  }

  document.addEventListener('visibilitychange', evaluate);

  window.addEventListener('resize', () => {
    clearTimeout(resizeT);
    resizeT = setTimeout(size, 160);
  }, { passive: true });

  try {
    size();
    if (reduced) {
      // One static frame for texture, no motion
      running = true;
      frame(0);
      running = false;
      if (rafId != null) cancelAnimationFrame(rafId);
    } else {
      evaluate();
    }
  } catch (e) {
    canvas.remove(); // CSS red glow fallback stays
  }
})();
