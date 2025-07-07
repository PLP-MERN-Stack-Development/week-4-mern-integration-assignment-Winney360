// src/components/common/Card.jsx
import React from 'react';

const Card = ({ 
  children, 
  className = '',
  title,
  footer,
  hoverEffect = false 
}) => {
  return (
    <div className={`
      bg-white dark:bg-gray-800
      rounded-lg shadow-md 
      p-6 
      transition-all duration-200
      ${hoverEffect ? 'hover:shadow-lg hover:-translate-y-1' : ''}
      ${className}
    `}>
      {title && (
        <h3 className="text-xl font-semibold mb-4 dark:text-white">
          {title}
        </h3>
      )}
      <div className="text-gray-700 dark:text-gray-300">
        {children}
      </div>
      {footer && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;