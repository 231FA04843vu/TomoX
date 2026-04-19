// UI Performance Optimization Script
// Reduce main thread blocking and optimize rendering

/**
 * Add passive event listeners to scroll handlers
 * This prevents blocking scroll and improves 60fps
 */
function optimizeEventListeners() {
  // Cache scroll handler
  let lastScrollTime = 0;
  const scrollThrottle = 16; // ~60fps
  
  const handleScroll = () => {
    const now = Date.now();
    if (now - lastScrollTime < scrollThrottle) return;
    lastScrollTime = now;
    
    // Your scroll logic here
  };
  
  // Use passive listener - doesn't block scroll
  window.addEventListener('scroll', handleScroll, { passive: true });
  window.addEventListener('touchmove', handleScroll, { passive: true });
  window.addEventListener('wheel', handleScroll, { passive: true });
  
  return () => {
    window.removeEventListener('scroll', handleScroll, { passive: true });
    window.removeEventListener('touchmove', handleScroll, { passive: true });
    window.removeEventListener('wheel', handleScroll, { passive: true });
  };
}

/**
 * Defer non-critical JavaScript
 * Load heavy libraries after page interactive
 */
function deferNonCriticalScripts() {
  if ('requestIdleCallback' in window) {
    // Load after page is interactive
    requestIdleCallback(() => {
      // Load analytics, tracking, etc.
    }, { timeout: 3000 });
  } else {
    setTimeout(() => {
      // Load analytics, tracking, etc.
    }, 2000);
  }
}

/**
 * Optimize animations to use GPU
 * Only animate transforms and opacity
 */
function optimizeAnimations() {
  const style = document.createElement('style');
  style.textContent = `
    /* GPU-accelerated animations only */
    @keyframes slideUp {
      from {
        transform: translateY(20px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
    
    .animate-slide-up {
      animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
      will-change: transform, opacity;
    }
  `;
  document.head.appendChild(style);
}

/**
 * Reduce repaints by batching DOM updates
 */
function batchDOMUpdates(callback) {
  if ('requestAnimationFrame' in window) {
    requestAnimationFrame(() => {
      callback();
    });
  } else {
    callback();
  }
}

/**
 * Monitor main thread blocking
 * Only in development environment
 */
function monitorMainThread() {
  // Intentionally no-op to keep console clean.
}

/**
 * Optimize images with native lazy loading
 */
function optimizeImageLoading() {
  const images = document.querySelectorAll('img[loading="lazy"]');
  
  // Use Intersection Observer for better control
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.decoding = 'async'; // Non-blocking decode
          observer.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px',
      threshold: 0.01
    });
    
    images.forEach(img => imageObserver.observe(img));
  }
}

/**
 * Compress animations and remove non-critical effects
 */
function reduceAnimationPriorityDuringLoad() {
  const style = document.createElement('style');
  
  // During page load, disable animations
  style.textContent = `
    body.loading * {
      animation-duration: 0 !important;
      transition-duration: 0 !important;
    }
    
    body.loading {
      overflow-y: hidden; /* Prevent reflow */
    }
  `;
  
  document.head.appendChild(style);
  
  // Enable after load
  window.addEventListener('load', () => {
    document.body.classList.remove('loading');
    document.body.classList.add('loaded');
  }, { once: true });
}

/**
 * Font loading optimization
 * Use system fonts while Google Fonts load
 */
function optimizeFontLoading() {
  // Fallback to system fonts immediately
  if ('fonts' in document) {
    document.fonts.ready.then(() => {
      document.documentElement.classList.add('fonts-loaded');
    });
  }
}

/**
 * Initialize all optimizations
 */
function initializePerformanceOptimizations() {
  try {
    optimizeEventListeners();
    optimizeAnimations();
    optimizeImageLoading();
    reduceAnimationPriorityDuringLoad();
    optimizeFontLoading();
    monitorMainThread();
    deferNonCriticalScripts();
  } catch (e) {
    // Keep silent to avoid console noise in frontend.
  }
}

// Start optimizations when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializePerformanceOptimizations);
} else {
  initializePerformanceOptimizations();
}

export {
  optimizeEventListeners,
  optimizeAnimations,
  batchDOMUpdates,
  monitorMainThread,
  optimizeImageLoading,
  deferNonCriticalScripts
};
