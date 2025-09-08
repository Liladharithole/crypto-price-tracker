import React from 'react';
import './ChartSkeleton.css';

const ChartSkeleton = () => {
  return (
    <div className="chart-skeleton">
      <div className="chart-area">
        {/* Y-axis labels */}
        <div className="y-axis">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="y-label skeleton-item"></div>
          ))}
        </div>
        
        {/* Chart content */}
        <div className="chart-content">
          {/* Grid lines */}
          <div className="grid-lines">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="grid-line"></div>
            ))}
          </div>
          
          {/* Animated chart line */}
          <div className="chart-line">
            <svg width="100%" height="100%" viewBox="0 0 400 200">
              <path
                d="M 0,150 Q 50,100 100,120 T 200,80 T 300,100 T 400,60"
                fill="none"
                stroke="rgba(0, 123, 255, 0.4)"
                strokeWidth="3"
                className="animated-path"
              />
              <path
                d="M 0,150 Q 50,100 100,120 T 200,80 T 300,100 T 400,60 L 400,200 L 0,200 Z"
                fill="rgba(0, 123, 255, 0.1)"
                className="animated-fill"
              />
            </svg>
          </div>
        </div>
      </div>
      
      {/* X-axis labels */}
      <div className="x-axis">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="x-label skeleton-item"></div>
        ))}
      </div>
    </div>
  );
};

export default ChartSkeleton;
