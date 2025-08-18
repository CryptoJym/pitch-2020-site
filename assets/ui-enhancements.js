// UI/UX Enhancement Script
(function() {
  'use strict';

  // ===========================
  // Smooth View Transitions
  // ===========================
  
  const enhanceViewTransitions = () => {
    const viewSections = document.querySelectorAll('.view-section');
    
    // Add transition classes
    viewSections.forEach(section => {
      section.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      section.style.opacity = '0';
      section.style.transform = 'translateY(20px)';
    });
    
    // Enhance the switchView function
    const originalSwitchView = window.switchView;
    window.switchView = function(viewName) {
      // Fade out current view
      const currentActive = document.querySelector('.view-section.active');
      if (currentActive) {
        currentActive.style.opacity = '0';
        currentActive.style.transform = 'translateY(-20px)';
      }
      
      // Small delay for smooth transition
      setTimeout(() => {
        originalSwitchView.call(this, viewName);
        
        // Fade in new view
        const newActive = document.querySelector('.view-section.active');
        if (newActive) {
          requestAnimationFrame(() => {
            newActive.style.opacity = '1';
            newActive.style.transform = 'translateY(0)';
          });
        }
      }, 200);
    };
  };

  // ===========================
  // Enhanced Hover Effects
  // ===========================
  
  const addHoverEffects = () => {
    // Journey nodes magnetic effect
    const journeyNodes = document.querySelectorAll('.journey-node');
    journeyNodes.forEach(node => {
      node.addEventListener('mousemove', (e) => {
        const rect = node.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        node.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px) scale(1.05)`;
      });
      
      node.addEventListener('mouseleave', () => {
        node.style.transform = 'translate(0, 0) scale(1)';
      });
    });

    // Metric cards tilt effect
    const metricCards = document.querySelectorAll('.metric-card');
    metricCards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        
        const tiltX = (y - 0.5) * 10;
        const tiltY = (x - 0.5) * -10;
        
        card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateZ(10px)`;
      });
      
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
      });
    });
  };

  // ===========================
  // Loading States
  // ===========================
  
  const addLoadingStates = () => {
    // Add loading class initially
    document.body.classList.add('is-loading');
    
    // Remove after content loads
    window.addEventListener('load', () => {
      setTimeout(() => {
        document.body.classList.remove('is-loading');
        document.body.classList.add('is-loaded');
      }, 300);
    });
  };

  // ===========================
  // Keyboard Navigation
  // ===========================
  
  const enhanceKeyboardNav = () => {
    let currentFocusIndex = 0;
    const focusableElements = [];
    
    // Collect all focusable elements
    const updateFocusableElements = () => {
      const selector = 'button:not(:disabled), a[href], input:not(:disabled), [tabindex="0"]';
      focusableElements.length = 0;
      focusableElements.push(...document.querySelectorAll(selector));
    };
    
    updateFocusableElements();
    
    // Arrow key navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        // Update focusable elements on tab
        updateFocusableElements();
      }
      
      // Number keys for quick slide navigation
      if (e.key >= '1' && e.key <= '9' && document.getElementById('detail-section')?.classList.contains('active')) {
        const slideNum = parseInt(e.key);
        if (window.changeSlide) {
          window.changeSlide(slideNum);
        }
      }
      
      // Escape key to return to overview
      if (e.key === 'Escape') {
        if (window.switchView) {
          window.switchView('overview');
        }
      }
    });
  };

  // ===========================
  // Smooth Scroll Enhancement
  // ===========================
  
  const enhanceScroll = () => {
    let scrollTimeout;
    const header = document.querySelector('.site-header');
    
    window.addEventListener('scroll', () => {
      // Add scrolling class
      document.body.classList.add('is-scrolling');
      
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        document.body.classList.remove('is-scrolling');
      }, 150);
      
      // Parallax for hero gradient
      const heroGradient = document.querySelector('.hero-gradient');
      if (heroGradient) {
        const scrolled = window.pageYOffset;
        heroGradient.style.transform = `translateY(${scrolled * 0.5}px)`;
      }
    });
  };

  // ===========================
  // Touch Interactions
  // ===========================
  
  const enhanceTouchInteractions = () => {
    // Add touch feedback
    document.addEventListener('touchstart', (e) => {
      if (e.target.matches('button, .journey-node, .metric-card')) {
        e.target.classList.add('touch-active');
      }
    });
    
    document.addEventListener('touchend', (e) => {
      if (e.target.matches('button, .journey-node, .metric-card')) {
        setTimeout(() => {
          e.target.classList.remove('touch-active');
        }, 150);
      }
    });
    
    // Improve swipe detection for slides
    let touchStartX = 0;
    let touchStartY = 0;
    const threshold = 50;
    
    document.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });
    
    document.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      
      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;
      
      // Only trigger if horizontal swipe is dominant
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > threshold) {
        if (document.getElementById('detail-section')?.classList.contains('active')) {
          if (deltaX > 0) {
            window.changeSlide && window.changeSlide('prev');
          } else {
            window.changeSlide && window.changeSlide('next');
          }
        }
      }
    }, { passive: true });
  };

  // ===========================
  // Progress Indicators
  // ===========================
  
  const enhanceProgressIndicators = () => {
    // Add smooth progress bar updates
    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
      let targetWidth = 0;
      let currentWidth = 0;
      let animationFrame;
      
      const updateProgress = () => {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight - windowHeight;
        const scrolled = window.scrollY;
        targetWidth = (scrolled / documentHeight) * 100;
      };
      
      const animateProgress = () => {
        currentWidth += (targetWidth - currentWidth) * 0.1;
        progressBar.style.width = `${currentWidth}%`;
        
        if (Math.abs(targetWidth - currentWidth) > 0.1) {
          animationFrame = requestAnimationFrame(animateProgress);
        }
      };
      
      window.addEventListener('scroll', () => {
        updateProgress();
        if (!animationFrame) {
          animationFrame = requestAnimationFrame(animateProgress);
        }
      });
    }
  };

  // ===========================
  // Visual Feedback
  // ===========================
  
  const addVisualFeedback = () => {
    // Click ripple effect
    const addRipple = (e) => {
      const target = e.currentTarget;
      const ripple = document.createElement('span');
      const rect = target.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';
      ripple.classList.add('ripple');
      
      target.appendChild(ripple);
      
      setTimeout(() => {
        ripple.remove();
      }, 600);
    };
    
    // Add ripple to interactive elements
    document.querySelectorAll('button, .journey-node').forEach(element => {
      element.style.position = 'relative';
      element.style.overflow = 'hidden';
      element.addEventListener('click', addRipple);
    });
  };

  // ===========================
  // Performance Monitoring
  // ===========================
  
  const monitorPerformance = () => {
    // Log slow interactions
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 100) {
          console.warn('Slow interaction detected:', entry.name, entry.duration);
        }
      }
    });
    
    observer.observe({ entryTypes: ['measure'] });
  };

  // ===========================
  // Initialize All Enhancements
  // ===========================
  
  const initializeEnhancements = () => {
    // Wait for DOM ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
    
    function init() {
      enhanceViewTransitions();
      addHoverEffects();
      addLoadingStates();
      enhanceKeyboardNav();
      enhanceScroll();
      enhanceTouchInteractions();
      enhanceProgressIndicators();
      addVisualFeedback();
      
      // Only monitor performance in development
      if (window.location.hostname === 'localhost') {
        monitorPerformance();
      }
      
      console.log('UI/UX enhancements initialized');
    }
  };
  
  // Start initialization
  initializeEnhancements();
})();

// Add ripple CSS
const style = document.createElement('style');
style.textContent = `
  .ripple {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.4);
    transform: scale(0);
    animation: ripple-animation 0.6s ease-out;
    pointer-events: none;
  }
  
  @keyframes ripple-animation {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
  
  .touch-active {
    transform: scale(0.98) !important;
  }
  
  body.is-loading * {
    cursor: wait !important;
  }
  
  body.is-scrolling .site-header {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  }
`;
document.head.appendChild(style);