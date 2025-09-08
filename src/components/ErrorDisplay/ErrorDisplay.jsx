import React from 'react';
import './ErrorDisplay.css';

const ErrorDisplay = ({ 
  message = 'Something went wrong', 
  onRetry, 
  showRetry = true,
  type = 'error' // 'error', 'warning', 'info'
}) => {
  const getIcon = () => {
    switch (type) {
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '❌';
    }
  };

  return (
    <div className={`error-display ${type}`}>
      <div className="error-content">
        <span className="error-icon">{getIcon()}</span>
        <div className="error-text">
          <h3>Oops!</h3>
          <p>{message}</p>
        </div>
      </div>
      {showRetry && onRetry && (
        <button className="retry-button" onClick={onRetry}>
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorDisplay;
