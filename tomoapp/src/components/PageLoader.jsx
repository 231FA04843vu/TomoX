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
    </div>
  );
};

export default PageLoader;
