/* ============================================
   FLOSSWORK DENTAL CLINIC — script.js
   Handles: sticky nav, mobile menu, BA slider,
   scroll reveal animations
   ============================================ */

(function () {
  'use strict';

  /* ---------- NAVBAR SCROLL ---------- */
  const navbar = document.getElementById('navbar');
  function onScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- MOBILE MENU ---------- */
  const hamburger   = document.getElementById('hamburger');
  const mobileMenu  = document.getElementById('mobileMenu');
  let menuOpen = false;

  hamburger.addEventListener('click', toggleMenu);

  function toggleMenu() {
    menuOpen = !menuOpen;
    hamburger.classList.toggle('open', menuOpen);
    mobileMenu.classList.toggle('open', menuOpen);
    mobileMenu.setAttribute('aria-hidden', String(!menuOpen));
    hamburger.setAttribute('aria-expanded', String(menuOpen));
    document.body.style.overflow = menuOpen ? 'hidden' : '';
  }

  window.closeMobileMenu = function () {
    if (menuOpen) toggleMenu();
  };

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuOpen) toggleMenu();
  });

  /* ---------- SMOOTH ANCHOR SCROLL ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = navbar.offsetHeight + 12;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ---------- BEFORE / AFTER SLIDER ---------- */
  function initSlider(sliderId) {
    const container = document.getElementById(sliderId);
    if (!container) return;

    const after  = container.querySelector('.ba-after');
    const handle = container.querySelector('.ba-handle');
    let dragging = false;

    function setPosition(clientX) {
      const rect = container.getBoundingClientRect();
      let pct = ((clientX - rect.left) / rect.width) * 100;
      pct = Math.max(5, Math.min(95, pct));
      after.style.width  = pct + '%';
      handle.style.left  = pct + '%';
    }

    // Mouse
    handle.addEventListener('mousedown', (e) => { dragging = true; e.preventDefault(); });
    window.addEventListener('mousemove', (e) => { if (dragging) setPosition(e.clientX); });
    window.addEventListener('mouseup',   ()  => { dragging = false; });

    // Touch
    handle.addEventListener('touchstart', (e) => { dragging = true; }, { passive: true });
    window.addEventListener('touchmove',  (e) => {
      if (dragging) setPosition(e.touches[0].clientX);
    }, { passive: true });
    window.addEventListener('touchend',   () => { dragging = false; });

    // Keyboard accessibility
    handle.setAttribute('tabindex', '0');
    handle.addEventListener('keydown', (e) => {
      const rect = container.getBoundingClientRect();
      const currentPct = parseFloat(after.style.width) || 50;
      if (e.key === 'ArrowLeft')  { setPosition(rect.left + (currentPct - 5) / 100 * rect.width); e.preventDefault(); }
      if (e.key === 'ArrowRight') { setPosition(rect.left + (currentPct + 5) / 100 * rect.width); e.preventDefault(); }
    });
  }

  initSlider('slider1');
  initSlider('slider2');

  /* ---------- SCROLL REVEAL ---------- */
  const revealEls = document.querySelectorAll(
    '.benefit-card, .service-card, .tech-card, .doctor-card, ' +
    '.pricing-card, .contact-card, .step, .ba-card, ' +
    '.section-headline, .section-sub, .section-label'
  );

  // Add reveal class
  revealEls.forEach((el, i) => {
    el.classList.add('reveal');
    // Stagger cards in the same grid
    const siblings = el.parentElement.querySelectorAll('.reveal');
    const idx = Array.from(siblings).indexOf(el);
    if (idx > 0 && idx <= 4) {
      el.classList.add(`reveal-delay-${idx}`);
    }
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  revealEls.forEach(el => observer.observe(el));

  /* ---------- ACTIVE NAV HIGHLIGHT ---------- */
  const sections = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav-link');

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            link.style.color = link.getAttribute('href') === `#${id}`
              ? 'var(--clr-accent)'
              : '';
          });
        }
      });
    },
    { threshold: 0.4 }
  );

  sections.forEach(s => sectionObserver.observe(s));

})();
