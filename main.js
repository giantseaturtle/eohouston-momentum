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
