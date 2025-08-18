// New minimal client runtime
(function() {
  'use strict';

  const views = ['overview', 'story', 'detail', 'rollout'];
  let currentView = 'overview';

  function qs(sel, root = document) { return root.querySelector(sel); }
  function qsa(sel, root = document) { return Array.from(root.querySelectorAll(sel)); }

  function switchView(view) {
    if (!views.includes(view)) return;
    qsa('.section, .view-section').forEach(el => el.classList.remove('active'));
    const section = qs(`#${view}-section`);
    if (section) section.classList.add('active');
    qsa('.nav button, .view-toggle').forEach(b => b.classList.toggle('active', b.dataset.view === view));
    currentView = view;
    if (view === 'detail' || view === 'rollout') ensureContentLoaded();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function setupNav() {
    qsa('.nav [data-view], .view-toggle').forEach(btn => {
      btn.addEventListener('click', () => switchView(btn.dataset.view));
    });
  }

  // Content loader
  let contentLoaded = false;
  async function ensureContentLoaded() {
    if (contentLoaded) return;
    const container = qs('#content');
    if (!container) return;
    try {
      const res = await fetch('/content/content.html', { cache: 'no-store' });
      const html = await res.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const body = doc.body || doc.querySelector('body');
      const wrapper = document.createElement('div');
      wrapper.innerHTML = (body ? body.innerHTML : html);
      // Remove scripts and any top-level headers/navs from source to avoid conflicts
      wrapper.querySelectorAll('script').forEach(s => s.remove());
      wrapper.querySelectorAll('header, .site-header, nav, .header-nav').forEach(el => el.remove());
      wrapper.querySelectorAll('#progressBar, #scrollIndicator, .nav-helper, footer.site-footer').forEach(el => el.remove());
      container.innerHTML = wrapper.innerHTML;
      contentLoaded = true;
      initSlides();
    } catch (e) {
      container.innerHTML = '<div class="panel">Failed to load content. Try reloading.</div>';
    }
  }

  // Simple progress bar
  function setupProgress() {
    const bar = qs('#progress') || qs('#progressBar');
    if (!bar) return;
    const tick = () => {
      // When slides are present and viewing detail, keep header bar in slide mode
      if (totalSlides > 0 && currentView === 'detail') return;
      const d = document.documentElement;
      const max = d.scrollHeight - innerHeight;
      const p = max > 0 ? (scrollY / max) * 100 : 0;
      bar.style.width = `${Math.min(100, Math.max(0, p))}%`;
    };
    addEventListener('scroll', tick, { passive: true });
    addEventListener('resize', tick);
    tick();

    // Click-to-advance for slides when in Deep Dive view
    bar.addEventListener('click', async () => {
      const hasSlides = qsa('.webdeck-slide').length > 0;
      if (hasSlides) {
        changeSlide('next');
        return;
      }
      // No slides: cycle views as pseudo-slides
      const idx = views.indexOf(currentView);
      const nextIdx = (idx + 1) % views.length;
      const nextView = views[nextIdx];
      switchView(nextView);
      if (nextView === 'detail' || nextView === 'rollout') await ensureContentLoaded();
    });
  }

  // --- Slide system (works with loaded content) ---
  let currentSlide = 1;
  let totalSlides = 0;

  function initSlides() {
    const slides = qsa('.webdeck-slide');
    if (!slides.length) return;
    totalSlides = slides.length;

    // Ensure one active
    const active = qs('.webdeck-slide.active') || slides[0];
    slides.forEach(s => s.classList.remove('active'));
    active.classList.add('active');
    currentSlide = parseInt(active.getAttribute('data-slide') || '1', 10);

    // Build dots in each container
    qsa('.slide-dots').forEach(container => {
      container.innerHTML = '';
      for (let i = 1; i <= totalSlides; i++) {
        const dot = document.createElement('span');
        dot.className = 'nav-dot' + (i === currentSlide ? ' active' : '');
        dot.addEventListener('click', () => changeSlide(i));
        container.appendChild(dot);
      }
    });

    // Wire nav buttons that use inline onclick
    qsa('[onclick*="changeSlide"]').forEach(el => {
      const attr = el.getAttribute('onclick') || '';
      el.removeAttribute('onclick');
      if (attr.includes('next')) el.addEventListener('click', () => changeSlide('next'));
      else if (attr.includes('prev')) el.addEventListener('click', () => changeSlide('prev'));
    });

    // Keyboard
    document.addEventListener('keydown', (e) => {
      if (currentView === 'detail' && totalSlides > 0) {
        if (e.key === 'ArrowRight') changeSlide('next');
        if (e.key === 'ArrowLeft') changeSlide('prev');
      }
    });

    // Sync header progress to slide position initially
    updateSlideUI();
  }

  function changeSlide(direction) {
    const slides = qsa('.webdeck-slide');
    if (!slides.length) return;

    if (direction === 'next') currentSlide = currentSlide >= totalSlides ? 1 : currentSlide + 1;
    else if (direction === 'prev') currentSlide = currentSlide <= 1 ? totalSlides : currentSlide - 1;
    else if (typeof direction === 'number') currentSlide = Math.min(totalSlides, Math.max(1, direction));

    slides.forEach(s => s.classList.remove('active'));
    const target = qs(`.webdeck-slide[data-slide="${currentSlide}"]`) || slides[currentSlide - 1];
    if (target) target.classList.add('active');
    updateSlideUI();
  }

  function updateSlideUI() {
    // Dots
    qsa('.slide-dots').forEach(container => {
      const dots = qsa('.nav-dot', container);
      dots.forEach((dot, idx) => dot.classList.toggle('active', idx === (currentSlide - 1)));
    });
    // Counters
    qsa('.slide-counter').forEach(el => {
      el.textContent = `${String(currentSlide).padStart(2, '0')} / ${String(totalSlides).padStart(2, '0')}`;
    });
    // Header progress reflects slide position when slides exist
    const bar = qs('#progress') || qs('#progressBar');
    if (bar && totalSlides > 0) {
      const pct = (currentSlide / totalSlides) * 100;
      bar.style.width = `${pct}%`;
    }
  }

  // Expose globally for inline handlers in loaded content
  window.changeSlide = changeSlide;

  document.addEventListener('DOMContentLoaded', () => {
    setupNav();
    setupProgress();
    switchView('overview');
    // Always load full source content below for visibility
    ensureContentLoaded();
  });
})();


