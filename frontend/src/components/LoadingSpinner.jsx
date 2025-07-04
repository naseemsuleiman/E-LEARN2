import React from 'react';

const LoadingSpinner = ({ size = 'md', text = 'Loading...', className = '' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
    '2xl': 'h-32 w-32'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`animate-spin rounded-full border-b-2 border-emerald-600 ${sizeClasses[size]}`}></div>
      {text && (
        <p className="mt-4 text-emerald-700 font-medium">{text}</p>
      )}
    </div>
  );
};

export default LoadingSpinner; 