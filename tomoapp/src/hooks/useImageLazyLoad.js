// Custom hook for efficient image lazy loading with Intersection Observer
import { useEffect, useRef, useState } from 'react';

export const useImageLazyLoad = (options = {}) => {
  const imgRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const imgElement = imgRef.current;
    if (!imgElement) return;

    // Options for Intersection Observer
    const observerOptions = {
      root: options.root || null,
      rootMargin: options.rootMargin || '50px',
      threshold: options.threshold || 0.01,
    };

    // Callback when image enters viewport
    const handleIntersection = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          if (observer) {
            observer.disconnect();
          }
        }
      });
    };

    // Create Intersection Observer
    const observer = new IntersectionObserver(handleIntersection, observerOptions);
    observer.observe(imgElement);

    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [options.root, options.rootMargin, options.threshold]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  return { imgRef, isInView, isLoaded, handleLoad };
};

export default useImageLazyLoad;
