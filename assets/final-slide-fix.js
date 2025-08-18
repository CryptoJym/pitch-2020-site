// Final Comprehensive Slide Fix
// This ensures slides work under all conditions

(function() {
  'use strict';
  
  console.log('[SllideFix] Initializing comprehensive slide fix...');
  
  // Global state
  let currentSlide = 1;
  const totalSlides = 10;
  let isInitialized = false;
  
  // Main slide change function
  function changeSlideComprehensive(direction) {
    console.log('[SlideFix] changeSlide called with:', direction);
    
    // Ensure we're in detail view
    if (!ensureDetailView()) {
      console.log('[SlideFix] Deferring slide change until view switch completes...');
      setTimeout(() => changeSlideComprehensive(direction), 200);
      return;
    }
    
    const slides = document.querySelectorAll('.webdeck-slide');
    if (!slides || slides.length === 0) {
      console.error('[SlideFix] No slides found!');
      return;
    }
    
    // Find current slide if not tracked
    const activeSlide = document.querySelector('.webdeck-slide.active');
    if (activeSlide) {
      currentSlide = parseInt(activeSlide.getAttribute('data-slide') || '1');
    }
    
    // Hide current slide
    slides.forEach(slide => slide.classList.remove('active'));
    
    // Calculate new slide
    if (direction === 'next') {
      currentSlide = currentSlide >= totalSlides ? 1 : currentSlide + 1;
    } else if (direction === 'prev') {
      currentSlide = currentSlide <= 1 ? totalSlides : currentSlide - 1;
    } else if (typeof direction === 'number') {
      currentSlide = Math.max(1, Math.min(direction, totalSlides));
    }
    
    // Show new slide
    const targetSlide = document.querySelector(`.webdeck-slide[data-slide="${currentSlide}"]`);
    if (targetSlide) {
      targetSlide.classList.add('active');
      animateSlide(targetSlide);
      updateUI();
      console.log('[SlideFix] Successfully changed to slide:', currentSlide);
    } else {
      console.error('[SlideFix] Target slide not found:', currentSlide);
    }
  }
  
  // Ensure we're in detail view
  function ensureDetailView() {
    const detailSection = document.getElementById('detail-section');
    if (!detailSection) {
      console.error('[SlideFix] Detail section not found!');
      return false;
    }
    
    if (!detailSection.classList.contains('active')) {
      console.log('[SlideFix] Switching to Deep Dive view...');
      
      // Hide all views
      document.querySelectorAll('.view-section').forEach(section => {
        section.classList.remove('active');
      });
      
      // Show detail view
      detailSection.classList.add('active');
      
      // Update navigation
      document.querySelectorAll('.view-toggle').forEach(btn => {
        btn.classList.remove('active');
      });
      const detailBtn = document.querySelector('[data-view="detail"]');
      if (detailBtn) {
        detailBtn.classList.add('active');
      }
      
      // Initialize if needed
      if (!isInitialized) {
        setTimeout(initializeSlides, 100);
      }
      
      return false; // Not ready yet
    }
    
    return true;
  }
  
  // Animate slide entrance
  function animateSlide(slide) {
    const content = slide.querySelector('.slide-content');
    if (content) {
      content.style.opacity = '0';
      content.style.transform = 'translateY(30px)';
      
      requestAnimationFrame(() => {
        content.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        content.style.opacity = '1';
        content.style.transform = 'translateY(0)';
      });
    }
  }
  
  // Update UI elements
  function updateUI() {
    // Update dots
    document.querySelectorAll('.nav-dot').forEach((dot, index) => {
      dot.classList.toggle('active', index === currentSlide - 1);
    });
    
    // Update counters
    document.querySelectorAll('.slide-counter').forEach(counter => {
      counter.textContent = `${currentSlide.toString().padStart(2, '0')} / ${totalSlides.toString().padStart(2, '0')}`;
    });
  }
  
  // Initialize slides
  function initializeSlides() {
    if (isInitialized) return;
    
    console.log('[SlideFix] Initializing slides...');
    
    // Create dots if needed
    const dotsContainers = document.querySelectorAll('.slide-dots');
    dotsContainers.forEach(container => {
      if (container.children.length === 0) {
        for (let i = 1; i <= totalSlides; i++) {
          const dot = document.createElement('span');
          dot.className = 'nav-dot';
          if (i === 1) dot.classList.add('active');
          dot.addEventListener('click', () => changeSlideComprehensive(i));
          container.appendChild(dot);
        }
      }
    });
    
    // Fix onclick handlers
    document.querySelectorAll('[onclick*="changeSlide"]').forEach(element => {
      const onclick = element.getAttribute('onclick');
      element.removeAttribute('onclick');
      
      if (onclick.includes('next')) {
        element.addEventListener('click', (e) => {
          e.preventDefault();
          changeSlideComprehensive('next');
        });
      } else if (onclick.includes('prev')) {
        element.addEventListener('click', (e) => {
          e.preventDefault();
          changeSlideComprehensive('prev');
        });
      }
    });
    
    // Add keyboard support
    document.addEventListener('keydown', (e) => {
      if (document.getElementById('detail-section')?.classList.contains('active')) {
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          changeSlideComprehensive('next');
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          changeSlideComprehensive('prev');
        }
      }
    });
    
    // Add swipe support
    let touchStartX = 0;
    const webdeck = document.querySelector('.webdeck-container');
    if (webdeck) {
      webdeck.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });
      
      webdeck.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > 50) {
          if (diff > 0) {
            changeSlideComprehensive('next');
          } else {
            changeSlideComprehensive('prev');
          }
        }
      }, { passive: true });
    }
    
    isInitialized = true;
    console.log('[SlideFix] Initialization complete!');
  }
  
  // Override global changeSlide
  window.changeSlide = changeSlideComprehensive;
  
  // Initialize when ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSlides);
  } else {
    initializeSlides();
  }
  
  // Expose debug interface
  window.slideFix = {
    changeSlide: changeSlideComprehensive,
    getCurrentSlide: () => currentSlide,
    getTotalSlides: () => totalSlides,
    goToDetailView: ensureDetailView,
    reinitialize: () => {
      isInitialized = false;
      initializeSlides();
    }
  };
  
  console.log('[SlideFix] Ready! Use window.changeSlide() or click navigation buttons.');
})();