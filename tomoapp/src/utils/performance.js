// Performance utility functions for optimization

// Debounce function to limit function execution rate
export const debounce = (func, wait = 300) => {
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

// Throttle function to limit function execution frequency
export const throttle = (func, limit = 300) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Request Idle Callback polyfill
export const requestIdleCallback = window.requestIdleCallback ||
  function (cb) {
    const start = Date.now();
    return setTimeout(() => {
      cb({
        didTimeout: false,
        timeRemaining: () => Math.max(0, 50 - (Date.now() - start)),
      });
    }, 1);
  };

export const cancelIdleCallback = window.cancelIdleCallback ||
  function (id) {
    clearTimeout(id);
  };

// Lazy execute function during idle time
export const idleExecute = (callback) => {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(callback, { timeout: 2000 });
  } else {
    setTimeout(callback, 1);
  }
};

// Preload image utility
export const preloadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

// Batch DOM updates
export const batchUpdates = (callback) => {
  if ('requestAnimationFrame' in window) {
    requestAnimationFrame(callback);
  } else {
    callback();
  }
};

// Check if user prefers reduced motion
export const prefersReducedMotion = () => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Memory optimization - clear cache
export const clearCache = (keys = []) => {
  try {
    if (keys.length === 0) {
      sessionStorage.clear();
    } else {
      keys.forEach(key => sessionStorage.removeItem(key));
    }
  } catch (e) {
    // Keep silent to avoid frontend console noise.
  }
};

// Performance monitoring
export const measurePerformance = (name, callback) => {
  return callback();
};

// Check if device is low-end
export const isLowEndDevice = () => {
  const memory = navigator.deviceMemory; // GB
  const cores = navigator.hardwareConcurrency;
  
  // Consider low-end if < 4GB RAM or <= 2 cores
  return (memory && memory < 4) || (cores && cores <= 2);
};

export default {
  debounce,
  throttle,
  requestIdleCallback,
  cancelIdleCallback,
  idleExecute,
  preloadImage,
  batchUpdates,
  prefersReducedMotion,
  clearCache,
  measurePerformance,
  isLowEndDevice,
};
