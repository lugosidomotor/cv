/* Main JS: a11y nav, smooth scroll, scroll animations, PWA SW registration */

document.addEventListener('DOMContentLoaded', () => {
  // Accessible mobile nav (index + portfolio)
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  const setMenuOpen = (open) => {
    if (!navToggle || !navLinks) return;
    navLinks.classList.toggle('active', open);
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
      setMenuOpen(!isOpen);
    });

    navLinks.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => setMenuOpen(false));
    });

    document.addEventListener('click', (e) => {
      const inside = navLinks.contains(e.target) || navToggle.contains(e.target);
      if (!inside) setMenuOpen(false);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    });
  }

  // Smooth scroll (same-page anchors)
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      const navOffset = 80; // fixed nav height
      const top = target.getBoundingClientRect().top + window.scrollY - navOffset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  // Scroll animations
  const elements = Array.from(document.querySelectorAll('.animate-on-scroll'));
  if (elements.length) {
    if (!('IntersectionObserver' in window)) {
      elements.forEach((el) => el.classList.add('is-visible'));
    } else {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          });
        },
        { threshold: 0.15, rootMargin: '0px 0px -10% 0px' }
      );
      elements.forEach((el) => io.observe(el));
    }
  }

  // Keep hero floating code snippets positioned relative to the portrait (desktop)
  const positionHeroFloatingCode = () => {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    const container = hero.querySelector('.container');
    const img = hero.querySelector('.hero-image.desktop-only img');
    const heroContent = hero.querySelector('.hero-content');
    const c1 = hero.querySelector('.floating-code.code-1');
    const c2 = hero.querySelector('.floating-code.code-2');
    const c3 = hero.querySelector('.floating-code.code-3');
    if (!container || !img || !c1 || !c2 || !c3) return;

    const imgRect = img.getBoundingClientRect();
    // On mobile/tablet the desktop image is display:none
    if (imgRect.width === 0 || imgRect.height === 0) return;

    const containerRect = container.getBoundingClientRect();
    const heroContentRect = heroContent ? heroContent.getBoundingClientRect() : null;

    const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
    const margin = 12;
    const gap = 24;
    const overlap = 18; // how much the snippets overlap the portrait edge

    const place = (el, leftPx, topPx) => {
      const left = Math.round(leftPx - containerRect.left);
      const top = Math.round(topPx - containerRect.top);
      el.style.left = `${left}px`;
      el.style.top = `${top}px`;
      el.style.right = 'auto';
      el.style.bottom = 'auto';
    };

    // Measure boxes (after layout)
    const b1 = { w: c1.offsetWidth, h: c1.offsetHeight };
    const b2 = { w: c2.offsetWidth, h: c2.offsetHeight };
    const b3 = { w: c3.offsetWidth, h: c3.offsetHeight };

    // Prefer placing code blocks around the portrait in fixed relative spots (with minimal overlap).
    // Code-1: above-right of the portrait, slightly overlapping the edge
    let c1Left = imgRect.right - overlap;
    let c1Top = imgRect.top - b1.h - gap;

    // Code-2: bottom-right of the portrait, slightly overlapping the edge
    let c2Left = imgRect.right - overlap;
    let c2Top = imgRect.bottom - overlap;

    // Code-3: left-lower-middle of the portrait, overlapping a bit (avoid face/head)
    let c3Left = imgRect.left - b3.w + overlap;
    let c3Top = imgRect.top + (imgRect.height - b3.h) * 0.8;

    // Prevent code-3 from covering hero text (keep it to the right of the content block)
    if (heroContentRect) {
      const minC3Left = heroContentRect.right + gap;
      c3Left = Math.max(c3Left, minC3Left);
    }

    // Clamp to viewport so they never fly off-screen on extreme widths
    c1Left = clamp(c1Left, margin, window.innerWidth - b1.w - margin);
    c1Top = clamp(c1Top, margin, window.innerHeight - b1.h - margin);

    c2Left = clamp(c2Left, margin, window.innerWidth - b2.w - margin);
    c2Top = clamp(c2Top, margin, window.innerHeight - b2.h - margin);

    c3Left = clamp(c3Left, margin, window.innerWidth - b3.w - margin);
    c3Top = clamp(c3Top, margin, window.innerHeight - b3.h - margin);

    place(c1, c1Left, c1Top);
    place(c2, c2Left, c2Top);
    place(c3, c3Left, c3Top);
  };

  let rafId = 0;
  const schedulePositioning = () => {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      rafId = 0;
      positionHeroFloatingCode();
    });
  };

  schedulePositioning();
  window.addEventListener('resize', schedulePositioning, { passive: true });
  window.addEventListener('load', schedulePositioning, { passive: true });

  // Reposition after fonts load (snippet box sizes can change)
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(schedulePositioning).catch(() => {});
  }
});

// Register Service Worker (PWA)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}
