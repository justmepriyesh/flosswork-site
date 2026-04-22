/* ============================================================
   FLOSSWORK™ — FLOATS.JS
   Handles:
   1. WhatsApp FAB (all pages, all devices)
   2. Sticky mobile CTA bar (mobile only, appears after scroll)
   3. Callback form modal (name + phone → WA or tel fallback)
   4. scroll-triggered CTA visibility
   ============================================================ */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    injectFloats();
    initCallbackForm();
    initStickyCTA();
    initCallbackTriggers();
  });

  /* ── WA LINK BUILDER ───────────────────────────────────────── */
  function waLink(msgKey, replacements) {
    var fw  = window.FW || {};
    var num = (fw.clinic && fw.clinic.whatsapp) ? fw.clinic.whatsapp : '918354088822';
    var msgs = fw.waMessages || {};
    var msg = msgs[msgKey] || msgs['default'] || 'Hi, I\'d like to book a consultation at Flosswork.';
    if (replacements) {
      Object.keys(replacements).forEach(function (k) {
        msg = msg.replace('{' + k + '}', replacements[k]);
      });
    }
    return 'https://wa.me/' + num + '?text=' + encodeURIComponent(msg);
  }

  function getPhone() {
    var fw = window.FW || {};
    return (fw.clinic && fw.clinic.phone1raw) ? fw.clinic.phone1raw : '+918354088822';
  }

  function getPhoneDisplay() {
    var fw = window.FW || {};
    return (fw.clinic && fw.clinic.phone1) ? fw.clinic.phone1 : '+91 83540 88822';
  }

  /* ================================================================
     1. INJECT FLOATS
     Injects: WA FAB + sticky CTA bar + callback modal into <body>
  ================================================================ */
  function injectFloats() {
    var html = [

      /* WhatsApp FAB */
      '<a id="wa-fab"',
      '   href="' + waLink('booking') + '"',
      '   target="_blank"',
      '   rel="noopener noreferrer"',
      '   aria-label="Chat with Flosswork on WhatsApp"',
      '   data-track="wa_click">',
      '  <svg viewBox="0 0 24 24" fill="white" aria-hidden="true">',
      '    <path d="M20 12a8 8 0 01-12.2 6.8L3 20l1.3-4.7A8 8 0 1120 12z"/>',
      '    <path d="M9 9.5c0-.3.2-.5.5-.5h.8c.3 0 .5.2.6.4l.6 1.5a.6.6 0 01-.1.6l-.5.5a6 6 0 002.6 2.6l.5-.5c.2-.1.4-.2.6-.1l1.5.6c.3.1.4.3.4.6v.8c0 .3-.2.5-.5.5A6.5 6.5 0 019 9.5z" fill="white"/>',
      '  </svg>',
      '</a>',

      /* Sticky mobile CTA bar */
      '<div id="sticky-cta" role="region" aria-label="Quick contact">',
      '  <a href="tel:' + getPhone() + '"',
      '     class="cta-call"',
      '     data-track="call_click"',
      '     aria-label="Call Flosswork Dental Clinic">',
      '    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 4h3l2 5-2 1a11 11 0 006 6l1-2 5 2v3a2 2 0 01-2 2A17 17 0 013 6a2 2 0 012-2z"/></svg>',
      '    Call',
      '  </a>',
      '  <a href="' + waLink('booking') + '"',
      '     class="cta-wa"',
      '     target="_blank"',
      '     rel="noopener noreferrer"',
      '     data-track="wa_click"',
      '     aria-label="WhatsApp Flosswork Dental Clinic">',
      '    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 12a8 8 0 01-12.2 6.8L3 20l1.3-4.7A8 8 0 1120 12z"/></svg>',
      '    WhatsApp',
      '  </a>',
      '  <a href="contact.html"',
      '     class="cta-book"',
      '     data-track="book_click"',
      '     aria-label="Book a consultation at Flosswork">',
      '    Book',
      '  </a>',
      '</div>',

      /* Callback modal */
      '<div id="callback-modal" role="dialog" aria-modal="true" aria-labelledby="callback-title" aria-hidden="true">',
      '  <div class="callback-sheet">',
      '    <button class="callback-close" id="callback-close" aria-label="Close">',
      '      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 6l12 12M6 18L18 6"/></svg>',
      '    </button>',
      '    <p class="callback-eyebrow">Request a callback</p>',
      '    <h2 id="callback-title" class="callback-title">We\'ll call<br><em>you back.</em></h2>',
      '    <p class="callback-sub">Leave your name and number. Our team calls back within 30 minutes during clinic hours.</p>',
      '    <div id="callback-form">',
      '      <div class="field">',
      '        <label for="cb-name">Your name</label>',
      '        <input type="text" id="cb-name" name="name" placeholder="e.g. Rahul Sharma" autocomplete="name" required>',
      '      </div>',
      '      <div class="field">',
      '        <label for="cb-phone">Mobile number</label>',
      '        <input type="tel" id="cb-phone" name="phone" placeholder="+91 98765 43210" autocomplete="tel" required>',
      '      </div>',
      '      <button type="button" id="callback-submit" class="btn btn--primary callback-btn" data-track="callback_request">',
      '        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 12a8 8 0 01-12.2 6.8L3 20l1.3-4.7A8 8 0 1120 12z"/></svg>',
      '        Send via WhatsApp',
      '      </button>',
      '      <p class="callback-note">Prefers a call? <a href="tel:' + getPhone() + '" data-track="call_click">' + getPhoneDisplay() + '</a></p>',
      '    </div>',
      '    <div id="callback-success" class="callback-success" hidden>',
      '      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12l5 5L20 6"/></svg>',
      '      <h3>Request sent</h3>',
      '      <p>WhatsApp has opened with your details. We\'ll respond within 30 minutes during clinic hours.</p>',
      '      <p class="callback-fallback">Or call directly: <a href="tel:' + getPhone() + '">' + getPhoneDisplay() + '</a></p>',
      '    </div>',
      '  </div>',
      '</div>',

    ].join('\n');

    var container = document.createElement('div');
    container.innerHTML = html;
    while (container.firstChild) {
      document.body.appendChild(container.firstChild);
    }
  }

  /* ================================================================
     2. CALLBACK FORM
  ================================================================ */
  function initCallbackForm() {
    /* Wait for injected DOM */
    setTimeout(function () {
      var modal   = document.getElementById('callback-modal');
      var closeBtn= document.getElementById('callback-close');
      var submitBtn=document.getElementById('callback-submit');
      var form    = document.getElementById('callback-form');
      var success = document.getElementById('callback-success');
      if (!modal) return;

      /* Open */
      window.openCallbackModal = function () {
        modal.removeAttribute('aria-hidden');
        modal.setAttribute('aria-modal', 'true');
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
        var firstInput = modal.querySelector('input');
        if (firstInput) setTimeout(function () { firstInput.focus(); }, 50);
      };

      /* Close */
      function closeModal() {
        modal.setAttribute('aria-hidden', 'true');
        modal.classList.remove('open');
        document.body.style.overflow = '';
        /* Reset form */
        var nameInput = document.getElementById('cb-name');
        var phoneInput= document.getElementById('cb-phone');
        if (nameInput)  nameInput.value = '';
        if (phoneInput) phoneInput.value = '';
        if (form)    form.hidden = false;
        if (success) success.hidden = true;
      }

      /* Close button */
      if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
      }

      /* Backdrop click */
      modal.addEventListener('click', function (e) {
        if (e.target === modal) closeModal();
      });

      /* Escape key */
      modal.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeModal();
      });

      /* Submit */
      if (submitBtn) {
        submitBtn.addEventListener('click', function () {
          var nameInput  = document.getElementById('cb-name');
          var phoneInput = document.getElementById('cb-phone');
          var name  = nameInput  ? nameInput.value.trim()  : '';
          var phone = phoneInput ? phoneInput.value.trim() : '';

          if (!name || !phone) {
            if (!name  && nameInput)  { nameInput.focus();  nameInput.style.borderColor = 'oklch(0.65 0.18 25)'; }
            if (!phone && phoneInput) { phoneInput.focus(); phoneInput.style.borderColor = 'oklch(0.65 0.18 25)'; }
            return;
          }

          /* Prevent duplicate submissions */
          var lastSubmit = localStorage.getItem('fw_callback_ts');
          var now = Date.now();
          if (lastSubmit && (now - parseInt(lastSubmit)) < 60000) {
            /* Less than 1 minute ago — show success anyway */
          } else {
            localStorage.setItem('fw_callback_ts', now.toString());
            /* Open WhatsApp with name + phone */
            var waUrl = waLink('callback', { name: name, phone: phone });
            var win = window.open(waUrl, '_blank', 'noopener,noreferrer');
            /* If popup blocked or WA not installed, win is null — fallback shown */
            if (!win) {
              /* Show phone number fallback */
            }
          }

          /* Show success state */
          if (form)    form.hidden = true;
          if (success) success.hidden = false;

          /* Track */
          if (window.gtag) {
            window.gtag('event', 'callback_request', { name: name });
          }
        });
      }

      /* Reset border on input */
      ['cb-name', 'cb-phone'].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) {
          el.addEventListener('input', function () {
            el.style.borderColor = '';
          });
        }
      });

    }, 100);
  }

  /* ================================================================
     3. STICKY CTA BAR — show after 300px scroll on mobile only
  ================================================================ */
  function initStickyCTA() {
    setTimeout(function () {
      var bar = document.getElementById('sticky-cta');
      if (!bar) return;

      var shown = false;
      var ticking = false;

      function update() {
        var isMobile = window.innerWidth <= 768;
        if (!isMobile) {
          bar.style.display = 'none';
          shown = false;
          return;
        }
        if (window.scrollY > 300) {
          if (!shown) {
            bar.style.display = 'flex';
            shown = true;
          }
        } else {
          bar.style.display = 'none';
          shown = false;
        }
        ticking = false;
      }

      window.addEventListener('scroll', function () {
        if (!ticking) {
          requestAnimationFrame(update);
          ticking = true;
        }
      }, { passive: true });

      window.addEventListener('resize', update, { passive: true });
      update();
    }, 150);
  }

  /* ================================================================
     4. CALLBACK TRIGGERS
     Any element with data-callback="open" opens the modal.
  ================================================================ */
  function initCallbackTriggers() {
    document.addEventListener('click', function (e) {
      var el = e.target.closest('[data-callback="open"]');
      if (el && typeof window.openCallbackModal === 'function') {
        e.preventDefault();
        window.openCallbackModal();
      }
    });
  }

})();
