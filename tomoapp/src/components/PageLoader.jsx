import React from 'react';
import { useLottie } from 'lottie-react';
import animationData from '../assets/delivery-rider.json';
import './PageLoader.css';

const PageLoader = () => {
  const options = {
    animationData: animationData,
    loop: true,
  };
  
  const { View } = useLottie(options);

  return (
    <div className="tomox-loader-wrapper">
      <div className="lottie-container" style={{ width: 180, height: 180 }}>
        {View}
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
