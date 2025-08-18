// Enhanced Interactive Experience with Navigation
let currentView = 'overview';

// View Management
function switchView(viewName) {
  // Update view sections
  document.querySelectorAll('.view-section').forEach(section => {
    section.classList.remove('active');
  });
  document.getElementById(`${viewName}-section`).classList.add('active');
  
  // Update navigation buttons
  document.querySelectorAll('.view-toggle').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelector(`[data-view="${viewName}"]`).classList.add('active');
  
  currentView = viewName;
  
  // Show/hide navigation helper based on view
  const navHelper = document.getElementById('navHelper');
  if (viewName === 'detail' || viewName === 'rollout') {
    navHelper.classList.add('visible');
  } else {
    navHelper.classList.remove('visible');
  }
  
  // Setup calculator if on rollout view
  if (viewName === 'rollout') {
    setupFinancialCalculator();
  }
  
  // Scroll to top smoothly
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

// Setup View Navigation
function setupViewNavigation() {
  document.querySelectorAll('.view-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.getAttribute('data-view');
      switchView(view);
    });
  });
  
  // Journey node clicks - navigate to specific sections
  document.querySelectorAll('.journey-node').forEach(node => {
    node.addEventListener('click', () => {
      const stage = node.getAttribute('data-stage');
      navigateToSection(stage);
    });
  });
}

// Enhanced Content Loading
async function loadContent() {
  const contentContainer = document.getElementById('content');
  // If no content container exists on this page, safely skip dynamic loading
  if (!contentContainer) {
    console.warn('loadContent: Skipping because #content container was not found');
    return;
  }
  const brandTitle = document.getElementById('brandTitle');

  try {
    const response = await fetch('/content/content.html', { cache: 'no-store' });
    const raw = await response.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(raw, 'text/html');

    const body = doc.body || doc.querySelector('body');
    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = body ? body.innerHTML : raw;

    // Remove any scripts for security
    tempContainer.querySelectorAll('script').forEach(el => el.remove());

    contentContainer.innerHTML = tempContainer.innerHTML;

    // Update title from first heading
    const firstHeading = contentContainer.querySelector('h1, h2, h3');
    if (firstHeading) {
      const titleText = firstHeading.textContent?.trim() || '2020 Master Pitch';
      document.title = titleText + ' - AI Takeover Strategy';
      brandTitle.textContent = titleText;
    }

    // Enhance the loaded content
    enhanceContent();
    setupDetailPanels();
  } catch (error) {
    console.error('Error loading content:', error);
    if (contentContainer) {
      contentContainer.innerHTML = '<p>Error loading content. Please refresh the page.</p>';
    }
  }
}

// Setup Expandable Detail Panels
function setupDetailPanels() {
  document.querySelectorAll('.panel-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const panel = trigger.closest('.detail-panel');
      panel.classList.toggle('expanded');
    });
  });
}

// Navigation Helper Actions
function setupNavHelper() {
  document.querySelectorAll('.nav-helper-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.getAttribute('data-action');
      
      if (action === 'overview') {
        switchView('overview');
      } else if (action === 'expand') {
        document.querySelectorAll('.detail-panel').forEach(panel => {
          panel.classList.add('expanded');
        });
      }
    });
  });
}

function enhanceContent() {
  // Add smooth scrolling to anchor links
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = e.currentTarget.getAttribute('href');
      if (!href || href === '#') return;
      
      const target = document.querySelector(href);
      if (!target) return;
      
      e.preventDefault();
      const offset = 100; // Account for fixed header
      const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
      
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    });
  });

  // Add intersection observer for fade-in animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  // Observe different elements based on current view
  if (currentView === 'overview') {
    document.querySelectorAll('.metric-card, .journey-node').forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      observer.observe(el);
    });
  } else if (currentView === 'story') {
    document.querySelectorAll('.story-chapter').forEach((el, index) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = `opacity 0.6s ease ${index * 0.2}s, transform 0.6s ease ${index * 0.2}s`;
      observer.observe(el);
    });
  } else {
    document.querySelectorAll('.content-wrapper h2, .content-wrapper h3, .content-wrapper p, .content-wrapper blockquote, .content-wrapper img').forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      observer.observe(el);
    });
  }
}

// Progress Bar
function setupProgressBar() {
  const progressBar = document.getElementById('progressBar');
  
  function updateProgress() {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight - windowHeight;
    const scrolled = window.scrollY;
    const progress = (scrolled / documentHeight) * 100;
    
    progressBar.style.width = `${Math.min(progress, 100)}%`;
  }

  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);
  updateProgress();
}

// Scroll to Top Button
function setupScrollIndicator() {
  const scrollIndicator = document.getElementById('scrollIndicator');
  let isScrolling = false;

  function toggleScrollIndicator() {
    const scrolled = window.scrollY;
    const threshold = 300;

    if (scrolled > threshold) {
      scrollIndicator.classList.add('visible');
      scrollIndicator.style.transform = 'rotate(180deg)';
    } else {
      scrollIndicator.classList.remove('visible');
      scrollIndicator.style.transform = 'rotate(0deg)';
    }
  }

  scrollIndicator.addEventListener('click', () => {
    if (isScrolling) return;
    isScrolling = true;

    const scrolled = window.scrollY;
    const threshold = 300;

    if (scrolled > threshold) {
      // Scroll to top
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    } else {
      // Scroll to next section
      const currentPosition = window.scrollY;
      const sections = document.querySelectorAll('h2');
      
      for (let section of sections) {
        const sectionTop = section.getBoundingClientRect().top + currentPosition;
        if (sectionTop > currentPosition + 100) {
          window.scrollTo({
            top: sectionTop - 100,
            behavior: 'smooth'
          });
          break;
        }
      }
    }

    setTimeout(() => {
      isScrolling = false;
    }, 1000);
  });

  window.addEventListener('scroll', toggleScrollIndicator, { passive: true });
  toggleScrollIndicator();
}

// Header scroll effect
function setupHeaderScroll() {
  const header = document.querySelector('.site-header');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;

    if (currentScroll > lastScroll && currentScroll > 100) {
      header.style.transform = 'translateY(-100%)';
    } else {
      header.style.transform = 'translateY(0)';
    }

    if (currentScroll > 50) {
      header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
    } else {
      header.style.boxShadow = 'none';
    }

    lastScroll = currentScroll;
  }, { passive: true });
}

// Financial Calculator Setup
function setupFinancialCalculator() {
  const hourlyRateInput = document.getElementById('hourlyRate');
  const fieldForceInput = document.getElementById('fieldForce');
  const automationRateInput = document.getElementById('automationRate');
  
  const hourlyValue = document.getElementById('hourlyValue');
  const forceValue = document.getElementById('forceValue');
  const automationValue = document.getElementById('automationValue');
  
  const costBaseEl = document.getElementById('costBase');
  const savingsEl = document.getElementById('savings');
  const roiTimeEl = document.getElementById('roiTime');
  
  function updateCalculations() {
    const hourlyRate = parseInt(hourlyRateInput.value);
    const fieldForce = parseInt(fieldForceInput.value);
    const automationRate = parseInt(automationRateInput.value) / 100;
    
    // Update display values
    hourlyValue.textContent = hourlyRate;
    forceValue.textContent = fieldForce;
    automationValue.textContent = (automationRate * 100).toFixed(0);
    
    // Calculate based on actual data mix:
    // Field reps at $22/hr, managers at $40/hr, QA at $28/hr
    // Assuming 80% field reps, 15% managers, 5% QA for blended rate
    const blendedRate = (0.8 * 22) + (0.15 * 40) + (0.05 * 28); // $25/hr blended
    const adjustedRate = hourlyRate * (blendedRate / 25); // Scale to user input
    
    // Calculate annual cost base (40 hours/week * 52 weeks)
    const annualHours = 40 * 52;
    const annualCostPerHead = adjustedRate * annualHours;
    const totalCostBase = (fieldForce * annualCostPerHead) / 1000000; // Convert to millions
    
    // Calculate savings based on actual phase data
    const actualSavingsRate = 7.29 / (120 * 40 * annualHours / 1000000); // From real data
    const annualSavings = totalCostBase * automationRate * actualSavingsRate;
    
    // Calculate ROI timeline using actual one-time costs
    const implementationCost = 1.87; // $1.87M total one-time from phases
    const monthlyROI = (annualSavings / 12);
    const roiMonths = implementationCost / monthlyROI;
    
    // Update display
    costBaseEl.textContent = `$${totalCostBase.toFixed(1)}M`;
    savingsEl.textContent = `$${annualSavings.toFixed(1)}M`;
    roiTimeEl.textContent = `${roiMonths.toFixed(1)} months`;
  }
  
  // Add event listeners
  if (hourlyRateInput && fieldForceInput && automationRateInput) {
    hourlyRateInput.addEventListener('input', updateCalculations);
    fieldForceInput.addEventListener('input', updateCalculations);
    automationRateInput.addEventListener('input', updateCalculations);
    
    // Initial calculation
    updateCalculations();
  }
}

// Webdeck Slide Navigation
let currentSlide = 1;
const totalSlides = 10;

// Make changeSlide global for onclick handlers
window.changeSlide = function(direction) {
  console.log('changeSlide called:', direction);
  
  const slides = document.querySelectorAll('.webdeck-slide');
  const dots = document.querySelectorAll('.nav-dot');
  
  if (!slides || slides.length === 0) {
    console.error('No slides found! Check if Deep Dive view is active.');
    return;
  }
  
  // Hide current slide
  if (slides[currentSlide - 1]) {
    slides[currentSlide - 1].classList.remove('active');
  }
  
  // Calculate new slide
  if (direction === 'next') {
    currentSlide = currentSlide < totalSlides ? currentSlide + 1 : 1;
  } else if (direction === 'prev') {
    currentSlide = currentSlide > 1 ? currentSlide - 1 : totalSlides;
  } else if (typeof direction === 'number') {
    currentSlide = direction;
  }
  
  // Show new slide
  if (slides[currentSlide - 1]) {
    slides[currentSlide - 1].classList.add('active');
    console.log('Switched to slide:', currentSlide);
  }
  
  // Update all dot containers
  document.querySelectorAll('.slide-dots').forEach(container => {
    const containerDots = container.querySelectorAll('.nav-dot');
    containerDots.forEach((dot, index) => {
      if (index === currentSlide - 1) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  });
  
  // Update slide counter
  document.querySelectorAll('.slide-counter').forEach(counter => {
    counter.textContent = `${currentSlide} / ${totalSlides}`;
  });
  
  // Animate slide content
  const newSlide = slides[currentSlide - 1];
  const slideContent = newSlide.querySelector('.slide-content');
  slideContent.style.opacity = '0';
  slideContent.style.transform = 'translateY(20px)';
  
  setTimeout(() => {
    slideContent.style.opacity = '1';
    slideContent.style.transform = 'translateY(0)';
  }, 100);
}

// Setup Webdeck Navigation
function setupWebdeck() {
  // Setup dot navigation - populate all slide-dots containers
  const dotsContainers = document.querySelectorAll('.slide-dots');
  dotsContainers.forEach(dotsContainer => {
    for (let i = 1; i <= totalSlides; i++) {
      const dot = document.createElement('span');
      dot.className = 'nav-dot';
      if (i === 1) dot.classList.add('active');
      dot.onclick = () => window.changeSlide(i);
      dotsContainer.appendChild(dot);
    }
  });
  
  // Add keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (currentView === 'detail') {
      if (e.key === 'ArrowRight') {
        window.changeSlide('next');
      } else if (e.key === 'ArrowLeft') {
        window.changeSlide('prev');
      }
    }
  });
  
  // Add swipe support for mobile
  let touchStartX = 0;
  let touchEndX = 0;
  
  const webdeckContainer = document.querySelector('.webdeck-container');
  if (webdeckContainer) {
    webdeckContainer.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    });
    
    webdeckContainer.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    });
  }
  
  function handleSwipe() {
    if (touchEndX < touchStartX - 50) {
      window.changeSlide('next');
    } else if (touchEndX > touchStartX + 50) {
      window.changeSlide('prev');
    }
  }
}

// Navigate to specific section based on journey stage
function navigateToSection(stage) {
  // Map stages to views and specific slides
  const stageMap = {
    '1': { view: 'detail', slide: 1 },      // Discovery -> Deep Dive slide 1
    '2': { view: 'detail', slide: 2 },      // MVP Design -> Deep Dive slide 2  
    '3': { view: 'rollout', section: 'pilot' }, // Pilot Launch -> Rollout pilot section
    '4': { view: 'rollout', section: 'scale' }, // Scale -> Rollout scale section
    'discovery': { view: 'detail', slide: 1 },
    'mvp': { view: 'detail', slide: 2 },
    'pilot': { view: 'rollout', section: 'pilot' },
    'scale': { view: 'rollout', section: 'scale' }
  };
  
  const target = stageMap[stage];
  if (!target) return;
  
  // Switch to the target view
  switchView(target.view);
  
  // Navigate to specific slide or section after view switch
  setTimeout(() => {
    if (target.slide && target.view === 'detail') {
      changeSlide(target.slide);
    } else if (target.section && target.view === 'rollout') {
      const sectionEl = document.getElementById(target.section + '-section');
      if (sectionEl) {
        sectionEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, 300);
}

// Story Mode Navigation
let currentChapter = 1;
const totalChapters = 8;

// Make navigateStory global for onclick handlers
window.navigateStory = function(direction) {
  const chapters = document.querySelectorAll('.story-chapter');
  const indicators = document.querySelectorAll('.indicator');
  const prevBtn = document.getElementById('prevChapter');
  const nextBtn = document.getElementById('nextChapter');
  
  // Hide all chapters to ensure visibility toggles correctly
  chapters.forEach((chapter, index) => {
    chapter.classList.remove('active');
    chapter.style.display = 'none';
    if (indicators[index]) indicators[index].classList.remove('active');
  });
  
  // Update chapter number
  if (direction === 'next' && currentChapter < totalChapters) {
    currentChapter++;
  } else if (direction === 'prev' && currentChapter > 1) {
    currentChapter--;
  }
  
  // Show new chapter
  chapters[currentChapter - 1].style.display = 'block';
  chapters[currentChapter - 1].classList.add('active');
  indicators[currentChapter - 1].classList.add('active');
  
  // Animate chapter entrance
  chapters[currentChapter - 1].style.opacity = '0';
  chapters[currentChapter - 1].style.transform = 'translateY(20px)';
  setTimeout(() => {
    chapters[currentChapter - 1].style.opacity = '1';
    chapters[currentChapter - 1].style.transform = 'translateY(0)';
  }, 50);
  
  // Update progress bar
  const progress = (currentChapter / totalChapters) * 100;
  const storyProgress = document.getElementById('storyProgress');
  if (storyProgress) {
    storyProgress.style.width = `${progress}%`;
  }
  
  // Update button states
  prevBtn.disabled = currentChapter === 1;
  nextBtn.disabled = currentChapter === totalChapters;
  
  // Scroll to top of chapter
  chapters[currentChapter - 1].scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Initialize story navigation
function initStoryMode() {
  // Set up chapter indicators
  const indicators = document.querySelectorAll('.indicator');
  indicators.forEach((indicator, index) => {
    indicator.addEventListener('click', () => {
      navigateToChapter(index + 1);
    });
  });
  
  // Set initial state
  const chapters = document.querySelectorAll('.story-chapter');
  chapters.forEach((chapter, index) => {
    if (index === 0) {
      chapter.classList.add('active');
      chapter.style.display = 'block';
    } else {
      chapter.style.display = 'none';
    }
  });
  
  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    const storySection = document.getElementById('story-section');
    if (storySection && storySection.classList.contains('active')) {
      if (e.key === 'ArrowRight') {
        navigateStory('next');
      } else if (e.key === 'ArrowLeft') {
        navigateStory('prev');
      }
    }
  });
}

// Navigate to specific chapter
function navigateToChapter(chapterNum) {
  const chapters = document.querySelectorAll('.story-chapter');
  const indicators = document.querySelectorAll('.indicator');
  
  // Hide all chapters
  chapters.forEach((chapter, index) => {
    chapter.classList.remove('active');
    chapter.style.display = 'none';
    indicators[index].classList.remove('active');
  });
  
  // Show selected chapter
  currentChapter = chapterNum;
  chapters[currentChapter - 1].classList.add('active');
  chapters[currentChapter - 1].style.display = 'block';
  indicators[currentChapter - 1].classList.add('active');
  
  // Update progress
  const progress = (currentChapter / totalChapters) * 100;
  const storyProgress = document.getElementById('storyProgress');
  if (storyProgress) {
    storyProgress.style.width = `${progress}%`;
  }
  
  // Update button states
  document.getElementById('prevChapter').disabled = currentChapter === 1;
  document.getElementById('nextChapter').disabled = currentChapter === totalChapters;
  
  // Animate entrance
  chapters[currentChapter - 1].style.opacity = '0';
  chapters[currentChapter - 1].style.transform = 'translateY(20px)';
  setTimeout(() => {
    chapters[currentChapter - 1].style.opacity = '1';
    chapters[currentChapter - 1].style.transform = 'translateY(0)';
  }, 50);
  
  // Scroll to top
  chapters[currentChapter - 1].scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Initialize everything
document.addEventListener('DOMContentLoaded', async () => {
  setupViewNavigation();
  setupNavHelper();
  setupProgressBar();
  setupScrollIndicator();
  setupHeaderScroll();
  setupWebdeck();
  initStoryMode();
  await loadContent();

  // Add loaded class for animations
  document.body.classList.add('loaded');
  
  // Enhance content for the initial view
  enhanceContent();
});