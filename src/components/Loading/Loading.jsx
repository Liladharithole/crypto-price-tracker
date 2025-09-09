import React from 'react';
import './Loading.css';

const Loading = ({ type = 'spinner', size = 'medium', text = '' }) => {
  const renderSpinner = () => (
    <div className={`loading-spinner ${size}`}>
      <div className="spinner"></div>
      {text && <p className="loading-text">{text}</p>}
    </div>
  );

  const renderDots = () => (
    <div className={`loading-dots ${size}`}>
      <div className="dot"></div>
      <div className="dot"></div>
      <div className="dot"></div>
      {text && <p className="loading-text">{text}</p>}
    </div>
  );

  const renderSkeleton = () => (
    <div className="loading-skeleton">
      <div className="skeleton-item"></div>
      <div className="skeleton-item"></div>
      <div className="skeleton-item"></div>
    </div>
  );

  const renderTableSkeleton = () => (
    <div className="table-skeleton">
      {Array.from({ length: 10 }, (_, index) => (
        <div key={index} className="table-skeleton-row">
          <div className="skeleton-cell small"></div>
          <div className="skeleton-cell medium"></div>
          <div className="skeleton-cell medium"></div>
          <div className="skeleton-cell small"></div>
          <div className="skeleton-cell large"></div>
        </div>
      ))}
    </div>
  );

  switch (type) {
    case 'dots':
      return renderDots();
    case 'skeleton':
      return renderSkeleton();
    case 'table-skeleton':
      return renderTableSkeleton();
    default:
      return renderSpinner();
  }
};

export default Loading;
