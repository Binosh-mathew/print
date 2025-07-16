import React from 'react';
import { Button } from '@/components/ui/button';

interface LoadingErrorProps {
  isLoading: boolean;
  hasError: boolean;
  onRetry: () => void;
}

const LoadingErrorState: React.FC<LoadingErrorProps> = ({ 
  isLoading, 
  hasError,
  onRetry
}) => {
  if (isLoading) {
    return (
      <div className="py-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
        <p className="text-gray-500 mt-4">Loading your orders...</p>
      </div>
    );
  }
  
  if (hasError) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p className="text-gray-700 font-medium mb-2">Failed to load orders</p>
        <p className="text-gray-500 mb-4">There was a problem connecting to the server.</p>
        <Button 
          onClick={onRetry}
          className="mt-2"
        >
          Try Again
        </Button>
      </div>
    );
  }
  
  return null;
};

export default LoadingErrorState;
