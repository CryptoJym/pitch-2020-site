// Immediate Slide Fix - Ensures slides work right away
(function() {
  'use strict';
  
  console.log('Immediate slide fix loading...');
  
  // Override changeSlide immediately
  window.changeSlide = function(direction) {
    console.log('Immediate changeSlide called:', direction);
    
    // First ensure we're in detail view
    const detailSection = document.getElementById('detail-section');
    const currentView = document.querySelector('.view-section.active');
    
    if (!detailSection) {
      console.error('Detail section not found!');
      return;
    }
    
    // If not in detail view, switch to it
    if (!detailSection.classList.contains('active')) {
      console.log('Switching to Deep Dive view first...');
      
      // Hide all sections
      document.querySelectorAll('.view-section').forEach(section => {
        section.classList.remove('active');
      });
      
      // Show detail section
      detailSection.classList.add('active');
      
      // Update nav buttons
      document.querySelectorAll('.view-toggle').forEach(btn => {
        btn.classList.remove('active');
      });
      const detailBtn = document.querySelector('[data-view="detail"]');
      if (detailBtn) {
        detailBtn.classList.add('active');
      }
      
      // Wait a moment for the view to render
      setTimeout(() => {
        window.changeSlide(direction);
      }, 100);
      return;
    }
    
    // Now handle slide change
    const slides = document.querySelectorAll('.webdeck-slide');
    if (!slides || slides.length === 0) {
      console.error('No slides found!');
      return;
    }
    
    // Find current active slide
    let currentIndex = 0;
    const activeSlide = document.querySelector('.webdeck-slide.active');
    if (activeSlide) {
      currentIndex = Array.from(slides).indexOf(activeSlide);
    }
    
    // Remove active from current
    if (slides[currentIndex]) {
      slides[currentIndex].classList.remove('active');
    }
    
    // Calculate new index
    let newIndex = currentIndex;
    if (direction === 'next') {
      newIndex = (currentIndex + 1) % slides.length;
    } else if (direction === 'prev') {
      newIndex = (currentIndex - 1 + slides.length) % slides.length;
    } else if (typeof direction === 'number') {
      newIndex = Math.max(0, Math.min(direction - 1, slides.length - 1));
    }
    
    // Activate new slide
    if (slides[newIndex]) {
      slides[newIndex].classList.add('active');
      
      // Animate entrance
      const content = slides[newIndex].querySelector('.slide-content');
      if (content) {
        content.style.opacity = '0';
        content.style.transform = 'translateY(20px)';
        
        requestAnimationFrame(() => {
          content.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
          content.style.opacity = '1';
          content.style.transform = 'translateY(0)';
        });
      }
    }
    
    // Update dots
    const dots = document.querySelectorAll('.nav-dot');
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === newIndex);
    });
    
    // Update counter
    document.querySelectorAll('.slide-counter').forEach(counter => {
      counter.textContent = `${(newIndex + 1).toString().padStart(2, '0')} / ${slides.length.toString().padStart(2, '0')}`;
    });
    
    console.log(`Changed from slide ${currentIndex + 1} to ${newIndex + 1}`);
  };
  
  // Also create dots immediately if they don't exist
  function ensureDots() {
    const dotsContainers = document.querySelectorAll('.slide-dots');
    if (dotsContainers.length === 0) return;
    
    dotsContainers.forEach(container => {
      if (container.children.length === 0) {
        console.log('Creating dots...');
        for (let i = 0; i < 10; i++) {
          const dot = document.createElement('span');
          dot.className = 'nav-dot';
          if (i === 0) dot.classList.add('active');
          dot.addEventListener('click', () => window.changeSlide(i + 1));
          container.appendChild(dot);
        }
      }
    });
  }
  
  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ensureDots);
  } else {
    ensureDots();
  }
  
  console.log('Immediate slide fix ready!');
})();