import React from 'react';
import './PageLoader.css';

import loaderImg from '../assets/tomox-loader.jpg';

const PageLoader = () => {
  return (
    <div className="tomox-loader-wrapper">
      <div className="scooter-container">
        <img src={loaderImg} alt="TomoX Loading" className="scooter-icon img-scooter" />
        <div className="wind-lines">
          <span className="wind-line"></span>
          <span className="wind-line"></span>
          <span className="wind-line"></span>
        </div>
      </div>
      <h2 className="tomox-loader-text">
        <span className="bouncing-letters">
          {"TomoX Delivery on the way...".split("").map((char, i) => (
            <span key={i} style={{ animationDelay: `${i * 0.05}s` }}>
              {char === " " ? "\u00A0" : char}
            </span>
          ))}
        </span>
      </h2>
    </div>
  );
};

export default PageLoader;
