import React, { useState } from 'react';

const ImageLoader = ({ src, alt, className, fallbackSrc = '/default-food.png', onSuccess, onError }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
    onSuccess?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  return (
    <div className="image-loader-wrapper">
      {isLoading && (
        <div className="image-loading">
          <div className="auth-loader">
            <div className="auth-loader-dot auth-loader-dot-1"></div>
            <div className="auth-loader-dot auth-loader-dot-2"></div>
            <div className="auth-loader-dot auth-loader-dot-3"></div>
          </div>
        </div>
      )}
      <img
        src={hasError ? fallbackSrc : src}
        alt={alt}
        className={`${className} ${isLoading ? 'loading' : 'loaded'}`}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          opacity: isLoading ? 0 : 1,
          transition: 'opacity 0.3s ease-in-out',
        }}
      />
    </div>
  );
};

export default ImageLoader;
