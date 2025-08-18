// Connection and Offline Support
(function() {
  'use strict';

  // ===========================
  // Offline Detection
  // ===========================
  
  const ConnectionMonitor = {
    isOnline: navigator.onLine,
    slowConnection: false,
    
    init() {
      this.checkConnection();
      this.setupListeners();
      this.setupServiceWorker();
    },
    
    checkConnection() {
      // Check connection type
      if ('connection' in navigator) {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        if (connection) {
          // Check if connection is slow
          this.slowConnection = connection.effectiveType === 'slow-2g' || 
                               connection.effectiveType === '2g' ||
                               connection.saveData === true;
          
          // Add appropriate body class
          document.body.classList.toggle('slow-connection', this.slowConnection);
          
          // Listen for connection changes
          connection.addEventListener('change', () => this.checkConnection());
        }
      }
    },
    
    setupListeners() {
      // Online/Offline events
      window.addEventListener('online', () => this.handleOnline());
      window.addEventListener('offline', () => this.handleOffline());
      
      // Periodic connection check
      setInterval(() => {
        this.checkOnlineStatus();
      }, 30000); // Check every 30 seconds
    },
    
    handleOnline() {
      this.isOnline = true;
      document.body.classList.remove('offline');
      console.log('Connection restored');
      
      // Sync any pending data
      this.syncPendingData();
    },
    
    handleOffline() {
      this.isOnline = false;
      document.body.classList.add('offline');
      console.log('Connection lost');
      
      // Save current state
      this.saveOfflineState();
    },
    
    checkOnlineStatus() {
      // Double-check with a ping
      fetch('/favicon.ico', {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-store'
      })
      .then(() => {
        if (!this.isOnline) {
          this.handleOnline();
        }
      })
      .catch(() => {
        if (this.isOnline) {
          this.handleOffline();
        }
      });
    },
    
    saveOfflineState() {
      // Save current view and slide position
      const state = {
        view: document.querySelector('.view-section.active')?.id?.replace('-section', '') || 'overview',
        slide: document.querySelector('.slide.active')?.dataset?.slide || '1',
        timestamp: Date.now()
      };
      
      try {
        localStorage.setItem('offlineState', JSON.stringify(state));
      } catch (e) {
        console.error('Failed to save offline state:', e);
      }
    },
    
    syncPendingData() {
      // Restore any saved state
      try {
        const savedState = localStorage.getItem('offlineState');
        if (savedState) {
          const state = JSON.parse(savedState);
          
          // Only restore if recent (within 1 hour)
          if (Date.now() - state.timestamp < 3600000) {
            if (window.switchView) {
              window.switchView(state.view);
            }
            if (window.changeSlide && state.view === 'detail') {
              setTimeout(() => window.changeSlide(parseInt(state.slide)), 500);
            }
          }
          
          localStorage.removeItem('offlineState');
        }
      } catch (e) {
        console.error('Failed to sync offline state:', e);
      }
    },
    
    setupServiceWorker() {
      // Register service worker for offline support
      if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
        navigator.serviceWorker.register('/sw.js')
          .then(registration => {
            console.log('Service Worker registered:', registration.scope);
          })
          .catch(error => {
            console.log('Service Worker registration failed:', error);
          });
      }
    }
  };

  // ===========================
  // Resource Preloading
  // ===========================
  
  const ResourceLoader = {
    criticalResources: [
      'assets/styles.css',
      'assets/main.js',
      'assets/ui-ux-optimizations.css',
      'assets/visual-impact.css'
    ],
    
    init() {
      this.preloadCriticalResources();
      this.lazyLoadImages();
    },
    
    preloadCriticalResources() {
      this.criticalResources.forEach(resource => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = resource;
        
        if (resource.endsWith('.css')) {
          link.as = 'style';
        } else if (resource.endsWith('.js')) {
          link.as = 'script';
        }
        
        document.head.appendChild(link);
      });
    },
    
    lazyLoadImages() {
      const images = document.querySelectorAll('img[data-src]');
      
      if ('loading' in HTMLImageElement.prototype) {
        // Native lazy loading
        images.forEach(img => {
          img.loading = 'lazy';
          if (img.dataset.src) {
            img.src = img.dataset.src;
            delete img.dataset.src;
          }
        });
      } else {
        // Fallback to Intersection Observer
        const imageObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const img = entry.target;
              img.src = img.dataset.src;
              delete img.dataset.src;
              imageObserver.unobserve(img);
            }
          });
        });
        
        images.forEach(img => imageObserver.observe(img));
      }
    }
  };

  // ===========================
  // Error Recovery
  // ===========================
  
  const ErrorRecovery = {
    errorCount: 0,
    maxErrors: 3,
    
    init() {
      this.setupErrorHandlers();
    },
    
    setupErrorHandlers() {
      // Global error handler
      window.addEventListener('error', (e) => {
        console.error('Global error:', e.error);
        this.handleError(e.error, e.filename, e.lineno);
      });
      
      // Unhandled promise rejections
      window.addEventListener('unhandledrejection', (e) => {
        console.error('Unhandled promise rejection:', e.reason);
        this.handleError(e.reason);
      });
    },
    
    handleError(error, file, line) {
      this.errorCount++;
      
      // Log error details
      const errorInfo = {
        message: error?.message || error,
        file,
        line,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      };
      
      console.error('Error details:', errorInfo);
      
      // Attempt recovery
      if (this.errorCount > this.maxErrors) {
        this.showErrorMessage('Multiple errors detected. Please refresh the page.');
      } else {
        this.attemptRecovery();
      }
    },
    
    attemptRecovery() {
      // Reset transition states
      if (window.StateManager) {
        window.StateManager.set('isTransitioning', false);
      }
      
      // Remove loading states
      document.body.classList.remove('is-transitioning', 'is-loading');
      
      // Re-enable interactions
      document.body.style.pointerEvents = '';
    },
    
    showErrorMessage(message) {
      const errorDiv = document.createElement('div');
      errorDiv.className = 'error-message';
      errorDiv.textContent = message;
      errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 9999;
        max-width: 90%;
      `;
      
      document.body.appendChild(errorDiv);
      
      setTimeout(() => {
        errorDiv.remove();
      }, 5000);
    }
  };

  // ===========================
  // Performance Monitoring
  // ===========================
  
  const PerformanceMonitor = {
    metrics: {
      fps: 60,
      loadTime: 0,
      interactionTime: 0
    },
    
    init() {
      this.measureLoadTime();
      this.monitorFPS();
      this.trackInteractions();
    },
    
    measureLoadTime() {
      window.addEventListener('load', () => {
        if (performance.timing) {
          const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
          this.metrics.loadTime = loadTime;
          console.log(`Page load time: ${loadTime}ms`);
          
          // Warn if slow
          if (loadTime > 3000) {
            console.warn('Slow page load detected');
          }
        }
      });
    },
    
    monitorFPS() {
      let lastTime = performance.now();
      let frames = 0;
      
      const checkFPS = () => {
        frames++;
        const currentTime = performance.now();
        
        if (currentTime >= lastTime + 1000) {
          this.metrics.fps = Math.round((frames * 1000) / (currentTime - lastTime));
          
          // Reduce quality if FPS is low
          if (this.metrics.fps < 30) {
            document.body.classList.add('reduce-quality');
          } else {
            document.body.classList.remove('reduce-quality');
          }
          
          frames = 0;
          lastTime = currentTime;
        }
        
        requestAnimationFrame(checkFPS);
      };
      
      requestAnimationFrame(checkFPS);
    },
    
    trackInteractions() {
      ['click', 'touchstart'].forEach(eventType => {
        document.addEventListener(eventType, (e) => {
          const startTime = performance.now();
          
          requestAnimationFrame(() => {
            const endTime = performance.now();
            this.metrics.interactionTime = endTime - startTime;
            
            if (this.metrics.interactionTime > 100) {
              console.warn(`Slow ${eventType} interaction: ${this.metrics.interactionTime}ms`);
            }
          });
        }, { passive: true });
      });
    }
  };

  // ===========================
  // Initialize Everything
  // ===========================
  
  const init = () => {
    ConnectionMonitor.init();
    ResourceLoader.init();
    ErrorRecovery.init();
    
    // Only monitor performance in development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      PerformanceMonitor.init();
    }
    
    console.log('Connection monitor and reliability features initialized');
  };

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();