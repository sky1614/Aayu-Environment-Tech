(function () {
  const NAV_TARGETS = [
    { labels: ['home'], target: 'index.html' },
    { labels: ['about us', 'explore about us'], target: 'about.html' },
    { labels: ['why us'], target: 'why-us.html' },
    { labels: ['process & our technology', 'process & technology', 'explore process', 'understand the complete process'], target: 'process.html' },
    { labels: ['opportunity', 'explore market opportunity'], target: 'opportunity.html' },
    { labels: ['get started', 'evaluate my project', 'start your journey'], target: 'get-started.html' },
    { labels: ['contact us', 'schedule consultation', 'talk to an expert'], target: 'contact.html' }
  ];

  const normalize = (value) => (value || '').replace(/\s+/g, ' ').trim().toLowerCase();

  function getTargetForLabel(label) {
    const normalized = normalize(label);
    if (!normalized) return null;

    const match = NAV_TARGETS.find((entry) => entry.labels.some((item) => normalize(item) === normalized));
    return match ? match.target : null;
  }

  function bindNavClicks() {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.18s ease';
    setTimeout(function () {
      document.body.style.opacity = '1';
    }, 10);
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
      // fade out then navigate
      document.body.style.transition = 'opacity 0.18s ease';
      document.body.style.opacity = '0';
      setTimeout(function () {
        window.location.assign(targetPage);
      }, 180);
    });

    const currentFile = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('span').forEach(function (span) {
      const label = (span.textContent || '').replace(/\s+/g, ' ').trim();
      const entry = NAV_TARGETS.find((e) => e.labels.some((l) => normalize(l) === normalize(label)));
      if (entry) {
        span.style.cursor = 'pointer';  // ← ADD THIS LINE
        if (entry.target === currentFile) {
          span.style.fontWeight = '600';
          span.style.borderBottom = '2px solid currentColor';
          span.style.paddingBottom = '2px';
        }
      }
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
