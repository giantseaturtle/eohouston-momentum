// EO Houston Momentum - light interactions
(function () {
  'use strict';

  // Current year in footer
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

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
