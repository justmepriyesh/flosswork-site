/* ============================================================
   FLOSSWORK™ — HOME.JS  v1.0
   Scroll-triggered reveal animations for homepage.
   No dependencies. Uses IntersectionObserver.
   ============================================================ */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    initScrollReveal();
  });

  /* ================================================================
     SCROLL REVEAL
     Watches .reveal elements and adds .visible when they enter
     the viewport. Staggered via CSS delay classes.
  ================================================================ */
  function initScrollReveal() {

    /* Respect prefers-reduced-motion */
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      showAll();
      return;
    }

    /* Fallback for Safari < 12.1 and older Android */
    if (!('IntersectionObserver' in window)) {
      showAll();
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.08,
      rootMargin: '0px 0px -48px 0px'
    });

    document.querySelectorAll('.reveal').forEach(function (el) {
      observer.observe(el);
    });
  }

  function showAll() {
    document.querySelectorAll('.reveal').forEach(function (el) {
      el.classList.add('visible');
    });
  }

})();
