// Enhanced Loading Experience
(function() {
  'use strict';

  // Create loading screen
  const createLoadingScreen = () => {
    const loader = document.createElement('div');
    loader.id = 'loading-screen';
    loader.innerHTML = `
      <div class="loading-content">
        <div class="loading-logo">
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
            <circle cx="40" cy="40" r="35" stroke="var(--accent)" stroke-width="2" opacity="0.3"/>
            <circle cx="40" cy="40" r="35" stroke="var(--accent)" stroke-width="2" 
                    stroke-dasharray="220" stroke-dashoffset="220" class="loading-progress"/>
            <path d="M40 20 L60 40 L40 60 L20 40 Z" fill="var(--accent)" opacity="0.9" class="loading-icon"/>
          </svg>
        </div>
        <h2 class="loading-title">2020 Master Pitch</h2>
        <p class="loading-subtitle">Preparing AI Transformation Strategy</p>
        <div class="loading-bar">
          <div class="loading-bar-fill"></div>
        </div>
        <div class="loading-status">Initializing experience...</div>
      </div>
    `;

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      #loading-screen {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: #0a0a0f;
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: opacity 0.5s ease;
      }

      .loading-content {
        text-align: center;
        max-width: 400px;
      }

      .loading-logo {
        margin-bottom: 2rem;
        animation: pulse 2s ease-in-out infinite;
      }

      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }

      .loading-progress {
        animation: loading-circle 1.5s ease-in-out forwards;
      }

      @keyframes loading-circle {
        to { stroke-dashoffset: 0; }
      }

      .loading-icon {
        animation: rotate 3s linear infinite;
        transform-origin: center;
      }

      @keyframes rotate {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }

      .loading-title {
        font-size: 2rem;
        font-weight: 700;
        margin-bottom: 0.5rem;
        background: linear-gradient(135deg, #fff, rgba(255,255,255,0.8));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .loading-subtitle {
        color: rgba(255, 255, 255, 0.6);
        margin-bottom: 2rem;
      }

      .loading-bar {
        width: 100%;
        height: 4px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 2px;
        overflow: hidden;
        margin-bottom: 1rem;
      }

      .loading-bar-fill {
        height: 100%;
        width: 0;
        background: linear-gradient(90deg, var(--accent), var(--accent-2));
        border-radius: 2px;
        animation: loading-progress 1.5s ease-out forwards;
      }

      @keyframes loading-progress {
        0% { width: 0; }
        20% { width: 30%; }
        50% { width: 60%; }
        80% { width: 90%; }
        100% { width: 100%; }
      }

      .loading-status {
        font-size: 0.875rem;
        color: rgba(255, 255, 255, 0.5);
        font-family: 'SF Mono', monospace;
      }

      #loading-screen.fade-out {
        opacity: 0;
        pointer-events: none;
      }
    `;

    document.head.appendChild(style);
    document.body.appendChild(loader);

    // Loading sequence
    const statuses = [
      'Initializing experience...',
      'Loading AI insights...',
      'Preparing visualizations...',
      'Optimizing performance...',
      'Ready to transform.'
    ];

    let statusIndex = 0;
    const statusElement = loader.querySelector('.loading-status');
    
    const updateStatus = () => {
      if (statusIndex < statuses.length) {
        statusElement.textContent = statuses[statusIndex];
        statusIndex++;
        setTimeout(updateStatus, 300);
      }
    };

    setTimeout(updateStatus, 200);

    // Remove loader when ready
    window.addEventListener('load', () => {
      setTimeout(() => {
        loader.classList.add('fade-out');
        setTimeout(() => {
          loader.remove();
          style.remove();
        }, 500);
      }, 1500);
    });
  };

  // Page transition effects
  const addPageTransitions = () => {
    // Add transition overlay
    const overlay = document.createElement('div');
    overlay.className = 'page-transition-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: #0a0a0f;
      z-index: 9998;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s ease;
    `;
    document.body.appendChild(overlay);

    // Override navigation functions to add transitions
    const originalNavigateToSection = window.navigateToSection;
    if (originalNavigateToSection) {
      window.navigateToSection = function(stage) {
        overlay.style.opacity = '1';
        overlay.style.pointerEvents = 'auto';
        
        setTimeout(() => {
          originalNavigateToSection.call(this, stage);
          
          setTimeout(() => {
            overlay.style.opacity = '0';
            overlay.style.pointerEvents = 'none';
          }, 100);
        }, 300);
      };
    }
  };

  // Initialize
  createLoadingScreen();
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addPageTransitions);
  } else {
    addPageTransitions();
  }
})();