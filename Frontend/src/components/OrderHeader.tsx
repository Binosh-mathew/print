import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface OrderHeaderProps {
  isLoading: boolean;
  onRefresh: () => void;
}

const OrderHeader: React.FC<OrderHeaderProps> = ({
  isLoading,
  onRefresh
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold">Order History</h1>
        <p className="text-gray-600 mt-1">
          View and track your print orders
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRefresh}
          disabled={isLoading}
          className="mr-2"
        >
          {isLoading ? 'Loading...' : 'Refresh'}
        </Button>
        <Link to="/new-order">
          <Button className="bg-primary hover:bg-primary-500">
            New Order
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default OrderHeader;
