
import React from 'react';
import { cn } from '@/lib/utils';

type StatusType = 
  | 'pending' 
  | 'processing' 
  | 'completed' 
  | 'delivered' 
  | 'cancelled' 
  | 'shipped'
  | string;

interface OrderStatusBadgeProps {
  status: StatusType;
  className?: string;
}

const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status, className }) => {
  const getStatusStyles = (): string => {
    if (!status) return 'bg-gray-100 text-gray-800 border-gray-200';
    
    // Handle both string and object cases
    const statusValue = typeof status === 'string' ? status : (status as any)?.status || '';
    const lowercaseStatus = statusValue.toLowerCase();
    
    switch (lowercaseStatus) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing':
      case 'in progress':
      case 'inprogress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
      case 'complete':
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
      case 'canceled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'shipped':
      case 'ready for pickup':
      case 'readyforpickup':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'on hold':
      case 'onhold':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        console.log(`Unhandled status: ${lowercaseStatus}`);
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (): string => {
    if (!status) return 'Unknown';
    
    // Handle case where status might be an object with a status property
    const statusValue = typeof status === 'string' 
      ? status 
      : (status as any)?.status || 'Unknown';
    
    return statusValue
      .split(' ')
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Ensure we have a valid status for the key
  const statusKey = status || 'unknown';
  const statusId = typeof statusKey === 'string' 
    ? statusKey 
    : (statusKey as any)?.id || 'unknown';

  return (
    <span
      key={`status-${statusId}`}
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        getStatusStyles(),
        className
      )}
      title={getStatusLabel()}
    >
      {getStatusLabel()}
    </span>
  );
};

export default OrderStatusBadge;
