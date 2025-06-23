import  { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import UserLayout from '@/components/layouts/UserLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ArrowLeft,
  FileText,
  Clock,
  Calendar,
  CreditCard,
  Copy,
  Printer,
  RefreshCw
} from 'lucide-react';
import OrderStatusBadge from '@/components/OrderStatusBadge';
import useAuthStore from '@/store/authStore';
import { fetchOrders, fetchOrderById } from '@/api';
import { type Order } from '@/types/order';
import { toast } from '@/components/ui/use-toast';
import { hasStatus } from '@/utils/orderUtils';

const OrderDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrderDetails = async () => {
    setIsLoading(true);
    setError(null);    try {
      if (user && id) {
        // Try direct fetch by ID first
        try {
          const orderDetails = await fetchOrderById(id);
          if (orderDetails && orderDetails.userId === user.id) {
            setOrder(orderDetails);
            return;          }
        } catch (err) {
          // Fall back to alternative method if direct fetch fails
        }
        
        // Fallback to fetching all orders if direct fetch failed
        const allOrders = await fetchOrders();
        
        // Filter orders for current user and find the specific one
        const orderDetails = allOrders.find(o => (o._id === id || o.id === id) && o.userId === user.id);
        
        if (orderDetails) {
          setOrder(orderDetails);
        } else {
          // Order not found or doesn't belong to user
          setError("The requested order could not be found");
          toast({
            title: "Order not found",
            description: "The requested order could not be found",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      setError("There was a problem loading the order details");
      toast({
        title: "Error loading order",
        description: "There was a problem loading the order details",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrderDetails();
  }, [id, user, navigate]);

  const getPaperAndBindingInfo = () => {
    if (!order || !order.files || !Array.isArray(order.files) || order.files.length === 0) {
      return { papers: [], bindings: [] };
    }
    
    const papers = order.files
      .filter(file => file) // Filter out any null/undefined files
      .map((file, index) => {
        // Safely access file properties with defaults
        const fileName = file?.file?.name || `Document ${index + 1}`;
        const specialPaper = file?.specialPaper || 'none';
        
        // Handle binding with proper type checking
        let bindingDisplay = 'None';
        if (file?.binding?.needed && file.binding.type) {
          bindingDisplay = file.binding.type.replace('Binding', '') || 'Standard';
        }
        
        return {
          name: fileName,
          paper: specialPaper === 'none' ? 'Standard' : specialPaper,
          binding: bindingDisplay,
          copies: file?.copies || 1,
          printType: file?.printType || 'blackAndWhite',
          doubleSided: file?.doubleSided || false,
          specificRequirements: file?.specificRequirements || ''
        };
      });
    
    return { 
      papers,
      bindings: papers.filter(p => p.binding !== 'None').map(p => p.binding)
    };
  };

  const handleRetry = () => {
    if (id && user) {
      setIsLoading(true);
      loadOrderDetails();
    }
  };

  if (isLoading) {
    return (
      <UserLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="ml-4 text-lg text-gray-600">Loading order details...</p>
        </div>
      </UserLayout>
    );
  }

  if (error) {
    return (
      <UserLayout>
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-red-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Error Loading Order</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <div className="flex justify-center space-x-4">
            <Button onClick={handleRetry} className="bg-primary hover:bg-primary-500">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
            <Link to="/orders">
              <Button variant="outline">
                Back to Orders
              </Button>
            </Link>
          </div>
        </div>
      </UserLayout>
    );
  }

  if (!order) {
    return (
      <UserLayout>
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Order Not Found</h2>
          <p className="text-gray-500 mb-6">The order you're looking for doesn't exist or you don't have permission to view it.</p>
          <Link to="/orders">
            <Button className="bg-primary hover:bg-primary-500">
              Back to Orders
            </Button>
          </Link>
        </div>
      </UserLayout>
    );
  }

  const { papers } = getPaperAndBindingInfo();

  return (
    <UserLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center">
            <Link to="/orders" className="mr-4">
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold flex items-center">
                Order #{order.orderId}
                <OrderStatusBadge status={order.status} className="ml-3" />
              </h1>
              <p className="text-gray-600 mt-1">
                Placed on {new Date(order.createdAt || '').toLocaleDateString()} at {new Date(order.createdAt || '').toLocaleTimeString()}
              </p>
            </div>
          </div>
          {/* Download button removed as requested */}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-xl">Order Details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <dt className="text-sm text-gray-500 flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Document
                  </dt>
                  <dd className="font-medium">{order.customerName}</dd>
                </div>
                
                <div className="space-y-1">
                  <dt className="text-sm text-gray-500 flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Status
                  </dt>
                  <dd>
                    <OrderStatusBadge status={order.status} />
                  </dd>
                </div>
                
                <div className="space-y-1">
                  <dt className="text-sm text-gray-500 flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Order Date
                  </dt>
                  <dd className="font-medium">{new Date(order.createdAt || '').toLocaleDateString()}</dd>
                </div>
                
                {hasStatus(order, "Completed") && (
                  <div className="space-y-1">
                    <dt className="text-sm text-gray-500 flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      Completed Date
                    </dt>
                    <dd className="font-medium">{new Date(order.updatedAt || '').toLocaleDateString()}</dd>
                  </div>
                )}
                
                <div className="space-y-1">
                  <dt className="text-sm text-gray-500 flex items-center">
                    <Copy className="h-4 w-4 mr-2" />
                    Copies
                  </dt>
                  <dd className="font-medium">{order.copies || 1}</dd>
                </div>
                
                <div className="space-y-1">
                  <dt className="text-sm text-gray-500 flex items-center">
                    <Printer className="h-4 w-4 mr-2" />
                    Print Type
                  </dt>
                  <dd className="font-medium">
                    {order.colorType === 'color' ? 'Color' : 'Black & White'}
                    {order.doubleSided ? ', Double-sided' : ''}
                  </dd>
                </div>
                
                <div className="space-y-1">
                  <dt className="text-sm text-gray-500 flex items-center">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Total Amount
                  </dt>
                  <dd className="text-lg font-bold">₹{order.totalPrice || 0}</dd>
                </div>
              </dl>
              
              {papers.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h3 className="font-semibold mb-3">Document Details</h3>
                  <div className="space-y-4">
                    {papers.map((file, index) => (
                      <div key={index} className="rounded-md bg-gray-50 p-3">
                        <p className="font-medium text-sm mb-2">{file.name}</p>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-500">Additional Paper:</span> {file.paper}
                          </div>
                          <div>
                            <span className="text-gray-500">Binding:</span> {file.binding}
                          </div>
                          {file.specificRequirements && (
                            <div className="col-span-2 mt-2">
                              <span className="text-gray-500">Specific Requirements:</span> {file.specificRequirements}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {order.details && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h3 className="font-semibold mb-3">Additional Requirements</h3>
                  <div className="p-3 bg-gray-50 rounded-md">
                    <p className="text-sm">{order.details}</p>
                  </div>
                </div>
              )}
              
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="font-semibold mb-4">Order Timeline</h3>
                <ol className="relative border-l border-gray-200 ml-3 space-y-6">
                  <li className="ml-6">
                    <span className="absolute flex items-center justify-center w-6 h-6 bg-primary-100 rounded-full -left-3">
                      <FileText className="h-3 w-3 text-primary" />
                    </span>
                    <h4 className="font-semibold">Order Placed</h4>
                    <time className="text-sm text-gray-500">
                      {new Date(order.createdAt || '').toLocaleDateString()} at {new Date(order.createdAt || '').toLocaleTimeString()}
                    </time>
                  </li>
                  
                  {(hasStatus(order, "Processing") || hasStatus(order, "Completed")) && (
                    <li className="ml-6">
                      <span className="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -left-3">
                        <Printer className="h-3 w-3 text-blue-600" />
                      </span>
                      <h4 className="font-semibold">Processing Started</h4>
                      <time className="text-sm text-gray-500">
                        {new Date(new Date(order.createdAt || '').getTime() + 3600000).toLocaleDateString()} at {new Date(new Date(order.createdAt || '').getTime() + 3600000).toLocaleTimeString()}
                      </time>
                    </li>
                  )}
                  
                  {hasStatus(order, "Completed") && (
                    <li className="ml-6">
                      <span className="absolute flex items-center justify-center w-6 h-6 bg-green-100 rounded-full -left-3">
                        <CheckMark className="h-3 w-3 text-green-600" />
                      </span>
                      <h4 className="font-semibold">Order Completed</h4>
                      <time className="text-sm text-gray-500">
                        {new Date(order.updatedAt || '').toLocaleDateString()} at {new Date(order.updatedAt || '').toLocaleTimeString()}
                      </time>
                    </li>
                  )}
                </ol>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Payment Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between pb-2 text-sm">
                  <span className="text-gray-500">Print Type</span>
                  <span>
                    {order.colorType === 'color' ? 'Color' : 'Black & White'}
                  </span>
                </div>
                <div className="flex justify-between pb-2 text-sm">
                  <span className="text-gray-500">Print Style</span>
                  <span>
                    {order.doubleSided ? 'Double-sided' : 'Single-sided'}
                  </span>
                </div>
                <div className="flex justify-between pb-2 text-sm">
                  <span className="text-gray-500">Number of Copies</span>
                  <span>{order.copies || 1}</span>
                </div>
                
                {papers.length > 0 && (
                  <div className="flex justify-between pb-2 text-sm">
                    <span className="text-gray-500">Additional Paper</span>
                    <span>
                      {papers.some(f => f.paper !== 'None') 
                        ? papers.filter(f => f.paper !== 'None').map(f => f.paper).join(', ')
                        : 'None'}
                    </span>
                  </div>
                )}
                
                <div className="border-t border-gray-200 pt-4 pb-2">
                  <div className="flex justify-between text-base font-medium">
                    <span>Total</span>
                    <span>₹{order.totalPrice || 0}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Paid via online payment</p>
                </div>
                
                <div className="bg-green-50 border border-green-100 rounded-md p-3 mt-4">
                  <p className="text-sm text-green-800 font-medium">Payment Completed</p>
                  <p className="text-xs text-green-600 mt-1">Transaction ID: TXN{order._id}12345</p>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h4 className="font-semibold mb-2">Need Help?</h4>
                <p className="text-sm text-gray-600 mb-3">
                  If you have any issues with your order, please contact our support team.
                </p>
                <Button variant="outline" className="w-full">
                  Contact Support
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </UserLayout>
  );
};

const CheckMark = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default OrderDetails;
