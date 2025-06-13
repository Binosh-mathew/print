
import { useEffect, useState } from 'react';
import { deleteOrder, fetchOrders } from '../api';
import useAuthStore from '@/store/authStore';
import { type Order } from '@/types/order';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Trash2, RefreshCw } from 'lucide-react';
import OrderStatusBadge from '@/components/OrderStatusBadge';

interface OrderListProps {
  searchQuery: string;
  onDelete: (id: string) => void;
  setLoading: (loading: boolean) => void;
}

function OrderList({ searchQuery, onDelete, setLoading }: OrderListProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();

  const loadOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching orders in OrderList component');
      const data = await fetchOrders();
      console.log('Orders received in OrderList:', data);
      
      // Filter orders by user if userId is available
      const userOrders = user ? data.filter(order => order.userId === user.id) : data;
      console.log('Filtered orders for user:', userOrders);
      
      setOrders(userOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load orders. Please try again later.');
      toast({
        title: "Error loading orders",
        description: "Failed to load orders. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [user, setLoading]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setOrders(prevOrders => (user ? prevOrders.filter(order => order.userId === user.id) : prevOrders));
    } else {
      const query = searchQuery.toLowerCase();
      setOrders(prevOrders => prevOrders.filter(order =>
        order.orderId?.toLowerCase().includes(query) ||
        order.status?.toLowerCase().includes(query)
      ));
    }
  }, [searchQuery, user]);

  const handleDelete = async (id: string) => {
    try {
      console.log(`Attempting to delete order with ID: ${id}`);
      await deleteOrder(id);
      onDelete(id); // Notify parent to update state if needed
      setOrders(orders.filter(order => order._id !== id && order.id !== id));
      toast({
        title: "Order deleted",
        description: "The order has been successfully deleted.",
      });
    } catch (error) {
      console.error('Failed to delete order:', error);
      toast({
        title: "Delete failed",
        description: "Failed to delete the order. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleRetry = () => {
    loadOrders();
  };

  if (error) {
    return (
      <Card>
        <CardContent className="text-center py-6">
          <FileText className="h-12 w-12 text-red-300 mx-auto mb-4" />
          <p className="text-gray-700 mb-2">{error}</p>
          <Button onClick={handleRetry} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-6">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">No orders found</p>
          <p className="text-sm text-gray-400">
            {searchQuery ? "Try a different search term" : "You haven't placed any orders yet"}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map(order => (
        <Card key={order._id || order.id} className="overflow-hidden hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <h3 className="font-semibold text-lg mr-2">#{order.orderId}</h3>
                  <OrderStatusBadge status={order.status} />
                </div>
                <div className="text-sm text-gray-600">
                  <p>{order.documentName || order.customerName}</p>
                  <p>Ordered on: {new Date(order.createdAt || '').toLocaleDateString()}</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-red-500 hover:text-red-700 hover:bg-red-50 mt-2 sm:mt-0"
                onClick={() => handleDelete(order._id || order.id)}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default OrderList;
