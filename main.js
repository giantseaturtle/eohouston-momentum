// EO Houston Momentum - light interactions
(function () {
  'use strict';

  // Current year in footer
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  function track(name, params) {
    if (typeof window.gtag === 'function') window.gtag('event', name, params || {});
  }

  // GA4: fires when any "Apply" CTA is clicked, tagged with where on the page it lives
  // (data-ga-apply="header_nav" | "mobile_nav" | "hero" | "admissions_section" |
  // "contact_section" | "contact_page" | "final_cta"). Fired on click, before navigation.
  document.querySelectorAll('[data-ga-apply]').forEach(function (el) {
    el.addEventListener('click', function () {
      track('apply_click', { link_location: el.getAttribute('data-ga-apply') });
    });
  });

  // Mobile nav toggle
  var toggle = document.querySelector('.nav-toggle');
  var mobileNav = document.querySelector('.mobile-nav');
  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      var open = mobileNav.hasAttribute('hidden');
      if (open) {
        mobileNav.removeAttribute('hidden');
      } else {
        mobileNav.setAttribute('hidden', '');
      }
      toggle.setAttribute('aria-expanded', String(open));
    });

    // Close after tapping a link
    mobileNav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        mobileNav.setAttribute('hidden', '');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Webinar banner - driven by /webinar.json (updated via /admin or by editing the file).
  // Shows nothing unless a webinar is set, and auto-hides 90 minutes after start time.
  fetch('/webinar.json', { cache: 'no-store' })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (w) {
      if (!w || !w.enabled || !w.link || !w.displayText) return;
      if (w.startISO && Date.now() > new Date(w.startISO).getTime() + 90 * 60 * 1000) return;
      var hero = document.getElementById('hero-webinar');
      var heroWhen = document.getElementById('hero-webinar-when');
      if (hero && heroWhen) {
        hero.href = w.link;
        heroWhen.textContent = w.displayText;
        hero.removeAttribute('hidden');
      }
      var admit = document.getElementById('admit-webinar');
      var admitWhen = document.getElementById('admit-webinar-when');
      var admitLink = document.getElementById('admit-webinar-link');
      if (admit && admitWhen && admitLink) {
        admitWhen.textContent = w.displayText;
        admitLink.href = w.link;
        admit.removeAttribute('hidden');
      }
    })
    .catch(function () {});

  // Contact form (appears on index.html and contact.html) -> api/contact.js -> Resend.
  var contactForm = document.getElementById('contactForm');
  if (contactForm) {
    var cfMsg = document.getElementById('cfMsg');
    var cfSubmit = document.getElementById('cfSubmit');

    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      cfMsg.className = 'cf-msg';
      cfMsg.textContent = '';

      var payload = {
        name: document.getElementById('cf-name').value.trim(),
        email: document.getElementById('cf-email').value.trim(),
        phone: document.getElementById('cf-phone').value.trim(),
        company: document.getElementById('cf-company').value.trim(),
        message: document.getElementById('cf-message').value.trim(),
        website: document.getElementById('cf-website').value
      };

      if (!payload.name || !payload.email || !payload.company || !payload.message) {
        cfMsg.className = 'cf-msg err';
        cfMsg.textContent = 'Please fill in your name, email, company name, and message.';
        return;
      }

      cfSubmit.disabled = true;
      cfSubmit.textContent = 'Sending…';

      fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
        .then(function (res) {
          if (res.ok) {
            cfMsg.className = 'cf-msg ok';
            cfMsg.textContent = "Thanks, that's sent. We'll get back to you soon.";
            contactForm.reset();
            track('contact_form_submit', { page_location: location.pathname });
          } else {
            cfMsg.className = 'cf-msg err';
            cfMsg.textContent = (res.j && res.j.error) || 'Something went wrong. Please try again.';
          }
        })
        .catch(function () {
          cfMsg.className = 'cf-msg err';
          cfMsg.textContent = 'Could not reach the server. Check your connection and try again.';
        })
        .finally(function () {
          cfSubmit.disabled = false;
          cfSubmit.textContent = 'Send message';
        });
    });
  }

  // Scroll-to-top for brand / #top links.
  // The sticky header carries id="top", so a plain #top anchor never scrolls
  // (the element is always pinned at the viewport top). Handle it explicitly.
  document.querySelectorAll('a[href="#top"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (history.replaceState) {
        history.replaceState(null, '', location.pathname + location.search);
      }
    });
  });
})();
