
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import UserLayout from '@/components/layouts/UserLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import OrderStatusBadge from '@/components/OrderStatusBadge';
import { useAuth } from '@/contexts/AuthContext';
import { fetchOrders } from '@/api';
import { type Order } from '@/types/order';
import { toast } from '@/components/ui/use-toast';

const OrderHistory = () => {
  const { user } = useAuth();
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch orders from API
    const loadOrders = async () => {
      setIsLoading(true);
      try {
        console.log('Fetching orders...');
        const data = await fetchOrders();
        console.log('Orders received:', data);
        
        if (user) {
          // Filter orders for current user
          const userOrdersList = data.filter(order => order.userId === user.id);
          console.log('User orders:', userOrdersList);
          
          // Sort orders by creation date (newest first)
          const sortedOrders = userOrdersList.sort((a, b) => 
            new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
          );
          
          setUserOrders(sortedOrders);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast({
          title: "Couldn't load orders",
          description: "There was a problem connecting to the server. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();
  }, [user]);

  // Search functionality removed

  // Function to get special paper info from files
  const getPaperAndBindingInfo = (order: Order) => {
    if (!order.files || order.files.length === 0) return { paper: 'Normal A4', binding: 'None' };
    
    const specialPapers = order.files
      .filter(file => file.specialPaper !== 'none')
      .map(file => file.specialPaper);
    
    const bindingTypes = order.files
      .filter(file => file.binding.needed && file.binding.type !== 'none')
      .map(file => file.binding.type);
    
    return {
      paper: specialPapers.length > 0 
        ? specialPapers.join(', ') 
        : 'Normal A4',
      binding: bindingTypes.length > 0 
        ? bindingTypes.map(type => type.replace('Binding', '')).join(', ') 
        : 'None'
    };
  };

  return (
    <UserLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Order History</h1>
            <p className="text-gray-600 mt-1">View and track your print orders</p>
          </div>
          <Link to="/new-order">
            <Button className="bg-primary hover:bg-primary-500">New Order</Button>
          </Link>
        </div>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Your Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
                <p className="text-gray-500 mt-4">Loading your orders...</p>
              </div>
            ) : userOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Order ID</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Document</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Date</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Copies</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Paper</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Type</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Price</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userOrders.map((order) => {
                      const { paper } = getPaperAndBindingInfo(order);
                      return (
                        <tr key={order._id} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm text-gray-600">#{order.orderId}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              <FileText size={16} className="text-gray-400 mr-2" />
                              <span className="text-sm font-medium text-gray-700 truncate max-w-[150px]">
                                {order.documentName || order.customerName}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {new Date(order.orderDate || order.createdAt || '').toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {order.copies || 1}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {paper}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {order.colorType === 'color' ? 'Color' : 'B&W'}
                            {order.doubleSided ? ', Double-sided' : ''}
                          </td>
                          <td className="py-3 px-4 text-sm font-medium">
                            ₹{order.totalPrice || 0}
                          </td>
                          <td className="py-3 px-4">
                            <OrderStatusBadge status={order.status} />
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link to={`/orders/${order._id}`}>
                                <Button variant="ghost" size="sm" className="text-primary h-8">
                                  View
                                </Button>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">No orders found</p>
                  <Link to="/new-order">
                    <Button className="mt-4 bg-primary hover:bg-primary-500">
                      Create your first order
                    </Button>
                  </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </UserLayout>
  );
};

export default OrderHistory;
