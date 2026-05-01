// Optimized Image component with lazy loading and blur-up effect
import React, { useState } from 'react';
import useImageLazyLoad from '../hooks/useImageLazyLoad';

const OptimizedImage = ({ 
  src, 
  alt, 
  className = '', 
  onError,
  fallbackSrc = '/default-restaurant.png',
  ...props 
}) => {
  const { imgRef, isInView, isLoaded, handleLoad } = useImageLazyLoad({
    rootMargin: '50px',
    threshold: 0.01
  });
  const [error, setError] = useState(false);

  const handleError = (e) => {
    setError(true);
    if (onError) {
      onError(e);
    } else {
      e.target.src = fallbackSrc;
    }
  };

  return (
    <img
      ref={imgRef}
      src={isInView ? src : undefined}
      alt={alt}
      className={`${className} ${!isLoaded ? 'loading' : 'loaded'} ${error ? 'error' : ''}`}
      onLoad={handleLoad}
      onError={handleError}
      loading="lazy"
      decoding="async"
      {...props}
    />
  );
};

export default OptimizedImage;
