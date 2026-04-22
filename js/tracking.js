/* ============================================================
   FLOSSWORK™ — TRACKING.JS
   GA4 + GTM initialisation + event tracking.
   IDs are pulled from FW.analytics in content.js.

   Events tracked:
   - wa_click          any WhatsApp link
   - call_click        any tel: link
   - book_click        Book Consultation CTA
   - callback_request  callback form submit
   - pricing_view      pricing section enters viewport
   - doctor_view       doctors section enters viewport
   - gallery_interact  before/after slider dragged
   - quiz_complete     aligner quiz completed
   - faq_open          FAQ item opened
   ============================================================ */

(function () {
  'use strict';

  /* ── GA4 + GTM IDs from content.js ─────────────────────────── */
  function getIds() {
    var fw = window.FW || {};
    var a  = fw.analytics || {};
    return {
      ga4: a.ga4Id || 'G-XXXXXXXXXX',
      gtm: a.gtmId || 'GTM-XXXXXXX',
    };
  }

  /* ── INIT GA4 ───────────────────────────────────────────────── */
  function initGA4(id) {
    if (!id || id === 'G-XXXXXXXXXX') return; /* Skip if placeholder */

    /* Async GA4 script */
    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + id;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', id, {
      page_title:    document.title,
      page_location: window.location.href,
      /* Anonymise IP — GDPR best practice */
      anonymize_ip: true,
    });
  }

  /* ── INIT GTM ───────────────────────────────────────────────── */
  function initGTM(id) {
    if (!id || id === 'GTM-XXXXXXX') return;

    /* GTM head snippet */
    (function(w,d,s,l,i){
      w[l]=w[l]||[];
      w[l].push({'gtm.start': new Date().getTime(), event:'gtm.js'});
      var f=d.getElementsByTagName(s)[0];
      var j=d.createElement(s);
      var dl=l!='dataLayer'?'&l='+l:'';
      j.async=true;
      j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
      f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer', id);

    /* GTM noscript — inject after <body> opens */
    var ns = document.createElement('noscript');
    var iframe = document.createElement('iframe');
    iframe.src = 'https://www.googletagmanager.com/ns.html?id=' + id;
    iframe.height = '0';
    iframe.width  = '0';
    iframe.style.display = 'none';
    iframe.style.visibility = 'hidden';
    ns.appendChild(iframe);
    document.body.insertBefore(ns, document.body.firstChild);
  }

  /* ── TRACK EVENT ────────────────────────────────────────────── */
  function track(eventName, params) {
    /* GA4 */
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, params || {});
    }
    /* GTM dataLayer */
    if (window.dataLayer) {
      window.dataLayer.push(Object.assign({ event: eventName }, params || {}));
    }
  }

  /* ── EVENT DELEGATION ───────────────────────────────────────── */
  /* All click tracking via data-track="event_name" attribute */
  function initClickTracking() {
    document.addEventListener('click', function (e) {
      var el = e.target.closest('[data-track]');
      if (!el) return;

      var eventName = el.getAttribute('data-track');
      var params = {};

      /* Enrich with context */
      if (eventName === 'wa_click') {
        params.link_url = el.href || '';
        params.link_text = el.textContent.trim().slice(0, 80);
      }
      if (eventName === 'call_click') {
        params.phone_number = el.href ? el.href.replace('tel:', '') : '';
      }
      if (eventName === 'book_click') {
        params.destination = el.href || '';
        params.button_text = el.textContent.trim().slice(0, 80);
      }

      track(eventName, params);
    });
  }

  /* ── SCROLL / SECTION VIEWS ─────────────────────────────────── */
  function initSectionTracking() {
    if (!('IntersectionObserver' in window)) return;

    var sections = [
      { selector: '#pricing',   event: 'pricing_view'  },
      { selector: '#doctors',   event: 'doctor_view'   },
      { selector: '#reviews',   event: 'reviews_view'  },
      { selector: '#quiz',      event: 'quiz_view'     },
      { selector: '#faq',       event: 'faq_view'      },
    ];

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var event = entry.target.getAttribute('data-track-section');
          if (event) {
            track(event, { section_id: entry.target.id });
            observer.unobserve(entry.target); /* Track once only */
          }
        }
      });
    }, { threshold: 0.3 });

    sections.forEach(function (s) {
      var el = document.querySelector(s.selector);
      if (el) {
        el.setAttribute('data-track-section', s.event);
        observer.observe(el);
      }
    });
  }

  /* ── SLIDER INTERACTION ─────────────────────────────────────── */
  /* Called from slider.js when user drags */
  window.trackGalleryInteract = function (caseId) {
    track('gallery_interact', { case_id: caseId });
  };

  /* ── QUIZ COMPLETION ────────────────────────────────────────── */
  window.trackQuizComplete = function (answers) {
    track('quiz_complete', { answers: JSON.stringify(answers) });
  };

  /* ── FAQ OPEN ───────────────────────────────────────────────── */
  window.trackFaqOpen = function (question) {
    track('faq_open', { question: question.slice(0, 100) });
  };

  /* ── INIT ───────────────────────────────────────────────────── */
  var ids = getIds();
  initGA4(ids.ga4);
  initGTM(ids.gtm);

  document.addEventListener('DOMContentLoaded', function () {
    initClickTracking();
    initSectionTracking();
  });

})();
