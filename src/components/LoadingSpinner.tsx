import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'accent';
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const colorClasses = {
    primary: 'border-cyber-blue',
    secondary: 'border-gray-400',
    accent: 'border-accent'
  };

  return (
    <div
      className={`spinner ${sizeClasses[size]} ${colorClasses[color]} ${className}`}
      style={{
        borderWidth: '2px',
        borderStyle: 'solid',
        borderColor: 'transparent',
        borderTopColor: 'currentColor'
      }}
    />
  );
};

export default LoadingSpinner;