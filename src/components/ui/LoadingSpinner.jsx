import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Reusable loading spinner component
 */
export const LoadingSpinner = ({ size = 'md', text = 'Yükleniyor...', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <div className={`flex flex-col items-center justify-center py-8 ${className}`}>
      <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-600 mb-2`} />
      {text && <p className="text-sm text-gray-500 mt-2">{text}</p>}
    </div>
  );
};

/**
 * Full page loading overlay
 */
export const LoadingOverlay = ({ text = 'Yükleniyor...' }) => {
  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 shadow-xl">
        <div className="flex flex-col items-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
          <p className="text-gray-300 text-lg">{text}</p>
        </div>
      </div>
    </div>
  );
};

/**
 * Inline loading state for tables/lists
 */
export const LoadingState = ({ text = 'Yükleniyor...', className = '' }) => {
  return (
    <div className={`flex items-center justify-center py-12 ${className}`}>
      <div className="flex flex-col items-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
        <p className="text-sm text-gray-500">{text}</p>
      </div>
    </div>
  );
};

