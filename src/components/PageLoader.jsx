import React from 'react';

const PageLoader = () => {
  return (
    <div className="page-loader-container">
      <div className="page-loader-content">
        <div className="page-loader-dots">
          <div className="auth-loader">
            <div className="auth-loader-dot auth-loader-dot-1"></div>
            <div className="auth-loader-dot auth-loader-dot-2"></div>
            <div className="auth-loader-dot auth-loader-dot-3"></div>
          </div>
        </div>
        <h2 className="page-loader-text">Loading...</h2>
      </div>

      {/* Skeleton Cards for visual feedback */}
      <div className="page-loader-skeleton">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton-card">
            <div className="skeleton-image"></div>
            <div className="skeleton-text">
              <div className="skeleton-line skeleton-line-1"></div>
              <div className="skeleton-line skeleton-line-2"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PageLoader;
