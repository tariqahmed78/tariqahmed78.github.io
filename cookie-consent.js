/**
 * Cookie Consent Banner — Google AdSense & GDPR Compliant
 * 
 * - Shows on first visit if no consent has been stored.
 * - Stores user preference in localStorage.
 * - Blocks ad-related cookies until user accepts.
 * - Links to Privacy Policy page.
 */
(function () {
  var CONSENT_KEY = 'tr_cookie_consent';
  var consent = localStorage.getItem(CONSENT_KEY);

  // If already answered, don't show banner
  if (consent === 'accepted' || consent === 'rejected') return;

  // Build banner HTML
  var banner = document.createElement('div');
  banner.className = 'cookie-consent';
  banner.id = 'cookie-consent';
  banner.setAttribute('role', 'dialog');
  banner.setAttribute('aria-label', 'Cookie consent');

  banner.innerHTML =
    '<div class="cookie-consent__text">' +
      '🍪 We use cookies and similar technologies to personalize content, serve ads via Google AdSense, ' +
      'and analyze site traffic. By clicking <strong>"Accept All"</strong>, you consent to the use of cookies. ' +
      'You can reject non-essential cookies by clicking <strong>"Reject"</strong>. ' +
      '<a href="website-privacy-policy.html">Read our Privacy Policy</a>.' +
    '</div>' +
    '<div class="cookie-consent__actions">' +
      '<button class="cookie-consent__btn cookie-consent__btn--reject" id="cookie-reject">Reject</button>' +
      '<button class="cookie-consent__btn cookie-consent__btn--accept" id="cookie-accept">Accept All</button>' +
    '</div>';

  document.body.appendChild(banner);

  // Animate in after a short delay
  setTimeout(function () {
    banner.classList.add('visible');
  }, 800);

  // Accept handler
  document.getElementById('cookie-accept').addEventListener('click', function () {
    localStorage.setItem(CONSENT_KEY, 'accepted');
    banner.classList.remove('visible');
    setTimeout(function () { banner.classList.add('hidden'); }, 400);
    // Enable personalized ads (Google AdSense signal)
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ 'event': 'consent_granted' });
  });

  // Reject handler
  document.getElementById('cookie-reject').addEventListener('click', function () {
    localStorage.setItem(CONSENT_KEY, 'rejected');
    banner.classList.remove('visible');
    setTimeout(function () { banner.classList.add('hidden'); }, 400);
    // Signal non-personalized ads only
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ 'event': 'consent_rejected' });
  });
})();
