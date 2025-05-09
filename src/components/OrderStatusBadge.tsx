
import React from 'react';
import { cn } from '@/lib/utils';

interface OrderStatusBadgeProps {
  status: string;
  className?: string;
}

const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status, className }) => {
  const getStatusStyles = () => {
    const lowercaseStatus = status?.toLowerCase() || '';
    switch (lowercaseStatus) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = () => {
    // If status is undefined or null, return a default value
    if (!status) return 'Unknown';
    
    // Return the status with first letter capitalized
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        getStatusStyles(),
        className
      )}
    >
      {getStatusLabel()}
    </span>
  );
};

export default OrderStatusBadge;
