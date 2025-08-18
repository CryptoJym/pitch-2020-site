// Slide Navigation Fix
// This ensures slides work even if main.js has issues

(function() {
  'use strict';
  
  // Track slide state
  let currentSlideIndex = 0;
  const totalSlides = 10;
  
  // Main slide change function
  function changeSlideFixed(direction) {
    console.log('changeSlideFixed called:', direction);
    
    // Ensure we're in detail view
    const detailSection = document.getElementById('detail-section');
    if (!detailSection || !detailSection.classList.contains('active')) {
      // Switch to detail view first
      document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active'));
      if (detailSection) detailSection.classList.add('active');
      
      // Update nav buttons
      document.querySelectorAll('.view-toggle').forEach(b => b.classList.remove('active'));
      const detailBtn = document.querySelector('[data-view="detail"]');
      if (detailBtn) detailBtn.classList.add('active');
      
      // Wait for view transition
      setTimeout(() => changeSlideFixed(direction), 100);
      return;
    }
    
    const slides = document.querySelectorAll('.webdeck-slide');
    if (!slides || slides.length === 0) {
      console.error('No slides found!');
      return;
    }
    
    // Find current active slide
    const activeSlide = document.querySelector('.webdeck-slide.active');
    if (activeSlide) {
      currentSlideIndex = Array.from(slides).indexOf(activeSlide);
    }
    
    // Remove active from current slide
    slides[currentSlideIndex].classList.remove('active');
    
    // Calculate new index
    if (direction === 'next') {
      currentSlideIndex = (currentSlideIndex + 1) % slides.length;
    } else if (direction === 'prev') {
      currentSlideIndex = (currentSlideIndex - 1 + slides.length) % slides.length;
    } else if (typeof direction === 'number') {
      currentSlideIndex = Math.max(0, Math.min(direction - 1, slides.length - 1));
    }
    
    // Activate new slide
    slides[currentSlideIndex].classList.add('active');
    
    // Update dots
    updateDots(currentSlideIndex);
    
    // Update counter
    updateCounter(currentSlideIndex + 1);
    
    // Animate slide entrance
    animateSlideEntrance(slides[currentSlideIndex]);
    
    console.log('Changed to slide:', currentSlideIndex + 1);
  }
  
  // Update dot indicators
  function updateDots(activeIndex) {
    document.querySelectorAll('.slide-dots').forEach(container => {
      const dots = container.querySelectorAll('.nav-dot');
      dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === activeIndex);
      });
    });
  }
  
  // Update slide counter
  function updateCounter(slideNum) {
    document.querySelectorAll('.slide-counter').forEach(counter => {
      counter.textContent = `${slideNum.toString().padStart(2, '0')} / ${totalSlides}`;
    });
  }
  
  // Animate slide entrance
  function animateSlideEntrance(slide) {
    const content = slide.querySelector('.slide-content');
    if (content) {
      content.style.opacity = '0';
      content.style.transform = 'translateY(20px)';
      
      requestAnimationFrame(() => {
        content.style.transition = 'opacity 0.3s, transform 0.3s';
        content.style.opacity = '1';
        content.style.transform = 'translateY(0)';
      });
    }
  }
  
  // Setup dot navigation
  function setupDots() {
    const dotsContainers = document.querySelectorAll('.slide-dots');
    
    dotsContainers.forEach(container => {
      // Clear existing dots
      container.innerHTML = '';
      
      // Create dots
      for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement('span');
        dot.className = 'nav-dot';
        if (i === 0) dot.classList.add('active');
        
        // Add click handler
        dot.addEventListener('click', () => {
          changeSlideFixed(i + 1);
        });
        
        container.appendChild(dot);
      }
    });
  }
  
  // Setup keyboard navigation
  function setupKeyboardNav() {
    document.addEventListener('keydown', (e) => {
      const detailSection = document.getElementById('detail-section');
      if (detailSection && detailSection.classList.contains('active')) {
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          changeSlideFixed('next');
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          changeSlideFixed('prev');
        }
      }
    });
  }
  
  // Setup touch/swipe navigation
  function setupTouchNav() {
    let touchStartX = 0;
    let touchEndX = 0;
    
    const container = document.querySelector('.webdeck-container');
    if (!container) return;
    
    container.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    container.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });
    
    function handleSwipe() {
      const swipeThreshold = 50;
      const diff = touchStartX - touchEndX;
      
      if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
          // Swiped left - next slide
          changeSlideFixed('next');
        } else {
          // Swiped right - previous slide
          changeSlideFixed('prev');
        }
      }
    }
  }
  
  // Initialize everything
  function init() {
    console.log('Initializing slide fix...');
    
    // Make changeSlide globally available
    window.changeSlide = changeSlideFixed;
    
    // Setup dots
    setupDots();
    
    // Setup navigation
    setupKeyboardNav();
    setupTouchNav();
    
    // Fix any onclick handlers
    document.querySelectorAll('[onclick*="changeSlide"]').forEach(element => {
      const onclickAttr = element.getAttribute('onclick');
      if (onclickAttr) {
        element.removeAttribute('onclick');
        
        if (onclickAttr.includes('next')) {
          element.addEventListener('click', () => changeSlideFixed('next'));
        } else if (onclickAttr.includes('prev')) {
          element.addEventListener('click', () => changeSlideFixed('prev'));
        }
      }
    });
    
    console.log('Slide fix initialized successfully');
  }
  
  // Run initialization when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  // Also expose functions globally for debugging
  window.slideDebug = {
    changeSlide: changeSlideFixed,
    getCurrentSlide: () => currentSlideIndex + 1,
    getTotalSlides: () => totalSlides,
    reinit: init
  };
})();