import React from 'react';
import './loading-spinner.css';

const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <div className="sw-loading-container">
      <div className="sw-spinner"></div>
      <div className="sw-loading-text">{message}</div>
    </div>
  );
};

export default LoadingSpinner;
