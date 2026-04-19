// Route preloader utility for faster navigation
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Common navigation patterns
const ROUTE_PRELOAD_MAP = {
  '/': ['/cart', '/restaurant'],
  '/restaurant': ['/cart'],
  '/cart': ['/checkout'],
  '/checkout': ['/orders'],
  '/offers': ['/restaurant'],
};

// Preload route chunks
const preloadRoute = (path) => {
  // Use link rel="prefetch" for route preloading
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.as = 'script';
  
  // Map routes to their chunk names
  const chunkMap = {
    '/cart': 'Cart',
    '/checkout': 'Checkout',
    '/orders': 'Orders',
    '/offers': 'Offers',
    '/account': 'Account',
    '/help': 'Help',
    '/sign-in': 'Auth',
  };
  
  const chunkName = chunkMap[path];
  if (!chunkName) return;
  
  // Find the chunk file in the build
  const scripts = Array.from(document.querySelectorAll('script'));
  const chunkScript = scripts.find(s => s.src.includes(chunkName));
  
  if (chunkScript) {
    link.href = chunkScript.src;
    document.head.appendChild(link);
  }
};

// Custom hook for route preloading
export const useRoutePreload = () => {
  const location = useLocation();
  
  useEffect(() => {
    const currentPath = location.pathname;
    const preloadPaths = ROUTE_PRELOAD_MAP[currentPath] || [];
    
    // Preload related routes after a delay (idle time)
    const timeoutId = setTimeout(() => {
      preloadPaths.forEach(path => {
        if ('requestIdleCallback' in window) {
          requestIdleCallback(() => preloadRoute(path), { timeout: 2000 });
        } else {
          setTimeout(() => preloadRoute(path), 100);
        }
      });
    }, 1000);
    
    return () => clearTimeout(timeoutId);
  }, [location.pathname]);
};

export default useRoutePreload;
