(function () {
  const NAV_TARGETS = [
    { labels: ['home'], target: '1. Homepage Wireframe.html' },
    { labels: ['about us'], target: '2. About Us .html' },
    { labels: ['why us'], target: '3. Why Us .html' },
    { labels: ['process & our technology', 'process & technology'], target: '4. Process & Technology (standalone).html' },
    { labels: ['opportunity'], target: '5. Opportunity Page.html' },
    { labels: ['get started'], target: '6. Get Started .html' },
    { labels: ['contact us'], target: '8. Contact Us .html' }
  ];

  const normalize = (value) => (value || '').replace(/\s+/g, ' ').trim().toLowerCase();

  function getTargetForLabel(label) {
    const normalized = normalize(label);
    if (!normalized) return null;

    const match = NAV_TARGETS.find((entry) => entry.labels.some((item) => normalize(item) === normalized));
    return match ? match.target : null;
  }

  function bindNavClicks() {
    if (window.__aayuNavBound) return;
    window.__aayuNavBound = true;

    document.addEventListener('click', function (event) {
      const target = event.target && event.target.nodeType === Node.TEXT_NODE
        ? event.target.parentElement
        : event.target;
      const clickable = target && typeof target.closest === 'function'
        ? target.closest('span, a, button, div')
        : target;

      if (!clickable) return;

      const label = clickable.textContent || '';
      const targetPage = getTargetForLabel(label);
      if (!targetPage) return;

      event.preventDefault();
      event.stopPropagation();
      window.location.assign(targetPage);
    });
  }

  function patchDCLogicLifecycle() {
    const DCLogicCtor = window.DCLogic || globalThis.DCLogic;
    if (!DCLogicCtor) return false;

    if (DCLogicCtor.__aayuNavPatched) {
      bindNavClicks();
      return true;
    }

    const originalDidMount = DCLogicCtor.prototype && DCLogicCtor.prototype.componentDidMount;
    DCLogicCtor.prototype.componentDidMount = function (...args) {
      const result = originalDidMount ? originalDidMount.apply(this, args) : undefined;
      try {
        bindNavClicks();
      } catch (error) {
        console.warn('Aayu nav hook failed:', error);
      }
      return result;
    };

    DCLogicCtor.__aayuNavPatched = true;
    bindNavClicks();
    return true;
  }

  function tryPatch() {
    if (patchDCLogicLifecycle()) return;

    const started = Date.now();
    const timer = window.setInterval(function () {
      if (patchDCLogicLifecycle() || Date.now() - started > 4000) {
        window.clearInterval(timer);
      }
    }, 100);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryPatch, { once: true });
  } else {
    tryPatch();
  }

  window.addEventListener('load', bindNavClicks, { once: true });
})();
