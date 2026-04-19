import React from 'react';

function StatCard({ icon, label, value, delta, tone = 'default' }) {
  const isPositive = Number(delta) >= 0;
  return (
    <article className={`vx-stat vx-stat--${tone}`}>
      <div className="vx-stat-head">
        <span>{label}</span>
        <i className={`fas ${icon}`}></i>
      </div>
      <h3>{value}</h3>
      {delta !== undefined && (
        <p className={`vx-delta ${isPositive ? 'up' : 'down'}`}>
          <i className={`fas fa-arrow-${isPositive ? 'up' : 'down'}`}></i>
          {Math.abs(Number(delta))}% vs previous period
        </p>
      )}
    </article>
  );
}

export default StatCard;
