import React from 'react';
import { Player } from '@lottiefiles/react-lottie-player';
import animationData from '../assets/delivery-rider.json';
import './PageLoader.css';

const PageLoader = () => {
  return (
    <div className="tomox-loader-wrapper">
      <div className="lottie-container">
        <Player
          autoplay
          loop
          src={animationData}
          style={{ height: '180px', width: '180px' }}
        />
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
