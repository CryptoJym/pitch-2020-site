// Reliability and Performance Optimizations
(function() {
  'use strict';

  // ===========================
  // Error Handling & Fallbacks
  // ===========================
  
  const safeExecute = (fn, fallback = () => {}) => {
    try {
      return fn();
    } catch (error) {
      console.error('Execution error:', error);
      return fallback();
    }
  };

  // ===========================
  // Debounce & Throttle Utilities
  // ===========================
  
  const debounce = (func, wait = 250) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  const throttle = (func, limit = 100) => {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  };

  // ===========================
  // State Management
  // ===========================
  
  const StateManager = {
    state: {
      currentView: 'overview',
      currentSlide: 1,
      isTransitioning: false,
      lastInteraction: Date.now()
    },
    
    get(key) {
      return this.state[key];
    },
    
    set(key, value) {
      this.state[key] = value;
      this.persist();
    },
    
    persist: debounce(function() {
      try {
        sessionStorage.setItem('pitchState', JSON.stringify(this.state));
      } catch (e) {
        console.warn('Failed to persist state:', e);
      }
    }, 500),
    
    restore() {
      try {
        const saved = sessionStorage.getItem('pitchState');
        if (saved) {
          this.state = { ...this.state, ...JSON.parse(saved) };
        }
      } catch (e) {
        console.warn('Failed to restore state:', e);
      }
    }
  };

  // ===========================
  // Reliable View Switching
  // ===========================
  
  const enhanceViewSwitching = () => {
    const originalSwitchView = window.switchView;
    
    window.switchView = function(viewName) {
      // Prevent rapid switching
      if (StateManager.get('isTransitioning')) {
        console.log('Transition in progress, ignoring request');
        return;
      }
      
      StateManager.set('isTransitioning', true);
      
      safeExecute(() => {
        // Ensure view exists
        const targetView = document.getElementById(viewName + '-section');
        if (!targetView) {
          console.error(`View ${viewName} not found`);
          StateManager.set('isTransitioning', false);
          return;
        }
        
        // Call original function
        originalSwitchView.call(this, viewName);
        StateManager.set('currentView', viewName);
        
        // Clear transition flag after animation
        setTimeout(() => {
          StateManager.set('isTransitioning', false);
        }, 500);
      });
    };
  };

  // ===========================
  // Reliable Slide Navigation
  // ===========================
  
  const enhanceSlideNavigation = () => {
    // Ensure changeSlide is globally available
    if (!window.changeSlide) {
      console.warn('changeSlide not found, creating fallback');
      window.changeSlide = function(direction) {
        console.log('Using fallback changeSlide');
      };
    }
    
    const originalChangeSlide = window.changeSlide;
    
    window.changeSlide = function(direction) {
      // Prevent rapid slide changes
      if (StateManager.get('isTransitioning')) {
        return;
      }
      
      StateManager.set('isTransitioning', true);
      
      safeExecute(() => {
        const slides = document.querySelectorAll('.slide');
        const currentSlide = StateManager.get('currentSlide') || 1;
        let newSlide = currentSlide;
        
        if (typeof direction === 'number') {
          newSlide = Math.max(1, Math.min(direction, slides.length));
        } else if (direction === 'prev') {
          newSlide = Math.max(1, currentSlide - 1);
        } else if (direction === 'next') {
          newSlide = Math.min(slides.length, currentSlide + 1);
        }
        
        // Update slide
        slides.forEach(slide => slide.classList.remove('active'));
        const targetSlide = document.querySelector(`[data-slide="${newSlide}"]`);
        if (targetSlide) {
          targetSlide.classList.add('active');
          StateManager.set('currentSlide', newSlide);
          
          // Update dots
          const dots = document.querySelectorAll('.slide-dot');
          dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === newSlide - 1);
          });
          
          // Update counter
          const counter = document.getElementById('slideCounter');
          if (counter) {
            counter.textContent = `${newSlide} / ${slides.length}`;
          }
        }
        
        // Clear transition flag
        setTimeout(() => {
          StateManager.set('isTransitioning', false);
        }, 300);
      });
    };
  };

  // ===========================
  // Touch Handling Improvements
  // ===========================
  
  const improveTouchHandling = () => {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;
    const threshold = 50;
    const timeThreshold = 300; // Max time for swipe
    
    const handleTouchStart = (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchStartTime = Date.now();
    };
    
    const handleTouchEnd = (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const touchEndTime = Date.now();
      
      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;
      const deltaTime = touchEndTime - touchStartTime;
      
      // Only process if it's a quick swipe
      if (deltaTime < timeThreshold && Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > threshold) {
        if (document.getElementById('detail-section')?.classList.contains('active')) {
          e.preventDefault();
          if (deltaX > 0) {
            window.changeSlide('prev');
          } else {
            window.changeSlide('next');
          }
        }
      }
    };
    
    // Remove existing listeners to prevent duplicates
    document.removeEventListener('touchstart', handleTouchStart);
    document.removeEventListener('touchend', handleTouchEnd);
    
    // Add new listeners
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: false });
  };

  // ===========================
  // Scroll Performance
  // ===========================
  
  const optimizeScroll = () => {
    let ticking = false;
    
    const updateScroll = () => {
      // Add scroll-based optimizations
      const scrollY = window.scrollY;
      
      // Hide elements below fold during scroll
      if (scrollY > 100) {
        document.body.classList.add('scrolled');
      } else {
        document.body.classList.remove('scrolled');
      }
      
      ticking = false;
    };
    
    const requestTick = () => {
      if (!ticking) {
        requestAnimationFrame(updateScroll);
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', requestTick, { passive: true });
  };

  // ===========================
  // Image Loading Optimization
  // ===========================
  
  const optimizeImages = () => {
    const images = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
          }
        });
      });
      
      images.forEach(img => imageObserver.observe(img));
    } else {
      // Fallback for older browsers
      images.forEach(img => {
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
      });
    }
  };

  // ===========================
  // Animation Frame Optimization
  // ===========================
  
  const optimizeAnimations = () => {
    // Pause animations when tab is not visible
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        document.body.classList.add('animations-paused');
      } else {
        document.body.classList.remove('animations-paused');
      }
    });
  };

  // ===========================
  // Event Delegation
  // ===========================
  
  const setupEventDelegation = () => {
    // Single click handler for all buttons
    document.addEventListener('click', (e) => {
      const button = e.target.closest('button');
      if (!button) return;
      
      // Prevent double clicks
      if (button.dataset.clicking === 'true') return;
      button.dataset.clicking = 'true';
      setTimeout(() => delete button.dataset.clicking, 500);
      
      // Handle different button types
      if (button.classList.contains('slide-prev')) {
        e.preventDefault();
        window.changeSlide('prev');
      } else if (button.classList.contains('slide-next')) {
        e.preventDefault();
        window.changeSlide('next');
      } else if (button.classList.contains('view-toggle')) {
        const view = button.dataset.view;
        if (view) window.switchView(view);
      }
    });
  };

  // ===========================
  // Browser Compatibility
  // ===========================
  
  const addCompatibilityFixes = () => {
    // Smooth scroll polyfill for Safari
    if (!('scrollBehavior' in document.documentElement.style)) {
      const smoothScroll = (target, duration = 500) => {
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        let startTime = null;
        
        const animation = currentTime => {
          if (startTime === null) startTime = currentTime;
          const timeElapsed = currentTime - startTime;
          const run = ease(timeElapsed, startPosition, distance, duration);
          window.scrollTo(0, run);
          if (timeElapsed < duration) requestAnimationFrame(animation);
        };
        
        const ease = (t, b, c, d) => {
          t /= d / 2;
          if (t < 1) return c / 2 * t * t + b;
          t--;
          return -c / 2 * (t * (t - 2) - 1) + b;
        };
        
        requestAnimationFrame(animation);
      };
      
      // Override scroll behavior
      window.smoothScroll = smoothScroll;
    }
  };

  // ===========================
  // Performance Monitoring
  // ===========================
  
  const monitorPerformance = () => {
    // Track long tasks
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 50) {
              console.warn('Long task detected:', {
                duration: entry.duration,
                startTime: entry.startTime,
                name: entry.name
              });
            }
          }
        });
        
        observer.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        // Silently fail if not supported
      }
    }
    
    // Monitor memory usage
    if (performance.memory) {
      setInterval(() => {
        const used = performance.memory.usedJSHeapSize / 1048576;
        const total = performance.memory.totalJSHeapSize / 1048576;
        if (used / total > 0.9) {
          console.warn('High memory usage:', `${used.toFixed(2)}MB / ${total.toFixed(2)}MB`);
        }
      }, 30000);
    }
  };

  // ===========================
  // Initialize
  // ===========================
  
  const initialize = () => {
    // Restore state
    StateManager.restore();
    
    // Apply enhancements
    enhanceViewSwitching();
    enhanceSlideNavigation();
    improveTouchHandling();
    optimizeScroll();
    optimizeImages();
    optimizeAnimations();
    setupEventDelegation();
    addCompatibilityFixes();
    
    // Monitor performance in development
    if (window.location.hostname === 'localhost') {
      monitorPerformance();
    }
    
    // Mark as initialized
    window.reliabilityOptimized = true;
    console.log('Reliability optimizations applied');
  };

  // Wait for DOM and other scripts
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(initialize, 100); // Give other scripts time to load
    });
  } else {
    setTimeout(initialize, 100);
  }
})();