/* ============================================================
   FLOSSWORK™ — COMPONENTS.JS  v3.1
   Behaviour layer only — all HTML is in layout.js.

   Handles:
   1. Nav: sticky frosted-glass on scroll + desktop height compression
   2. Nav: mobile drawer (open / close / iOS scroll-lock / focus-trap)
   3. Nav: active-page link highlighting
   ============================================================ */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    initNav();
    setActiveNavLink();
  });

  /* ================================================================
     1. NAV BEHAVIOUR
  ================================================================ */
  function initNav() {
    var header     = document.getElementById('fw-header');
    var toggle     = document.getElementById('nav-toggle');
    var mobileMenu = document.getElementById('nav-mobile');
    if (!header) return;

    /* ── Scroll: sticky glass + height compression ──────────────
       Uses RAF + ticking to ensure at most one DOM write per frame.
       Passive listener keeps scroll thread never blocked.
    ──────────────────────────────────────────────────────────── */
    var ticking = false;
    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(function () {
          header.classList.toggle('scrolled', window.scrollY > 12);
          ticking = false;
        });
        ticking = true;
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); /* set correct state immediately on load */

    /* ── Mobile menu ────────────────────────────────────────────
       iOS Safari scroll-lock pattern:
         open  → save scrollY, body.position:fixed + top:-Npx
         close → restore scrollY via window.scrollTo()
       This is the only reliable way to prevent rubber-band
       scroll bleed-through on iOS without js libraries.
    ──────────────────────────────────────────────────────────── */
    if (!toggle || !mobileMenu) return;

    var savedScrollY = 0; /* remembers position across open/close */

    function openMenu() {
      savedScrollY = window.scrollY;
      document.body.classList.add('fw-nav-open');
      document.body.style.top = '-' + savedScrollY + 'px';
      mobileMenu.classList.add('open');
      toggle.setAttribute('aria-expanded', 'true');
      var first = mobileMenu.querySelector('a, button');
      if (first) first.focus();
    }

    function closeMenu() {
      mobileMenu.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('fw-nav-open');
      document.body.style.top = '';
      window.scrollTo(0, savedScrollY); /* restore position without visible jump */
      toggle.focus();
    }

    /* Hamburger toggle */
    toggle.addEventListener('click', function () {
      mobileMenu.classList.contains('open') ? closeMenu() : openMenu();
    });

    /* Escape key */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mobileMenu.classList.contains('open')) closeMenu();
    });

    /* Backdrop tap / click */
    mobileMenu.addEventListener('click', function (e) {
      if (e.target === mobileMenu) closeMenu();
    });

    /* Close button inside the sheet */
    var closeBtn = document.getElementById('nav-mobile-close');
    if (closeBtn) closeBtn.addEventListener('click', closeMenu);

    /* Auto-close when a link inside the drawer is tapped —
       prevents the drawer staying open on same-page anchor jumps */
    Array.prototype.forEach.call(
      mobileMenu.querySelectorAll('a'),
      function (a) { a.addEventListener('click', closeMenu); }
    );

    /* Focus trap — keeps keyboard users inside the open drawer */
    mobileMenu.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var focusable = Array.prototype.slice.call(
        mobileMenu.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])')
      );
      var first = focusable[0];
      var last  = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
      }
    });
  }

  /* ================================================================
     2. ACTIVE NAV LINK
     Matches current filename → adds .nav-link--active + aria-current.
     Works for both desktop and mobile links (all carry data-page="").
  ================================================================ */
  function setActiveNavLink() {
    var path = window.location.pathname;
    var page = path.split('/').pop() || 'index.html';
    if (!page || page === '/') page = 'index.html';

    document.querySelectorAll('.nav-link[data-page]').forEach(function (link) {
      if (link.getAttribute('data-page') === page) {
        link.classList.add('nav-link--active');
        link.setAttribute('aria-current', 'page');
      }
    });
  }

})();
