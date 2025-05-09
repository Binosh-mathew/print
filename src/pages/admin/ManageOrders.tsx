
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import AdminLayout from '@/components/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  FileText, 
  Search, 
  Download, 
  Filter,
  ArrowDown,
  ArrowUp
} from 'lucide-react';
import OrderStatusBadge from '@/components/OrderStatusBadge';
import { orders, type Order } from '@/services/mockData';
import { toast } from '@/components/ui/use-toast';
import { normalizeStatus, hasStatus } from '@/utils/orderUtils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fetchOrders, updateOrder } from '@/api';

const ManageOrders = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const orderId = queryParams.get('id');

  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Order;
    direction: 'ascending' | 'descending';
  }>({
    key: 'createdAt',
    direction: 'descending',
  });

  // Fix the dialog reopening issue by improving the dialog close logic
  const [statusChangeCompleted, setStatusChangeCompleted] = useState(false);

  const refreshOrders = async () => {
    try {
      setIsUpdating(true);
      
      const fetchedOrders = await fetchOrders();
      
      console.log('Fetching orders from mockData:', fetchedOrders.length);
      
      const sortedOrders = [...fetchedOrders].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      setAllOrders(sortedOrders);
      setIsUpdating(false);
      
      if (orderId) {
        const order = sortedOrders.find(o => o.id === orderId);
        if (order) {
          setSelectedOrder(order);
          setIsDetailsOpen(true);
        }
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error loading orders",
        description: "There was a problem fetching the orders.",
        variant: "destructive",
      });
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    refreshOrders();
    
    const intervalId = setInterval(refreshOrders, 5000);
    
    return () => clearInterval(intervalId);
  }, [orderId]);

  useEffect(() => {
    let result = [...allOrders];
    
    if (statusFilter !== 'all') {
      result = result.filter(order => order.status === statusFilter);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(order => 
        order.id.toLowerCase().includes(query) ||
        order.userName.toLowerCase().includes(query) ||
        order.documentName.toLowerCase().includes(query)
      );
    }
    
    result.sort((a, b) => {
      if (sortConfig.key === 'createdAt' || sortConfig.key === 'updatedAt') {
        return sortConfig.direction === 'ascending'
          ? new Date(a[sortConfig.key]).getTime() - new Date(b[sortConfig.key]).getTime()
          : new Date(b[sortConfig.key]).getTime() - new Date(a[sortConfig.key]).getTime();
      }
      
      if (typeof a[sortConfig.key] === 'string') {
        return sortConfig.direction === 'ascending'
          ? (a[sortConfig.key] as string).localeCompare(b[sortConfig.key] as string)
          : (b[sortConfig.key] as string).localeCompare(a[sortConfig.key] as string);
      }
      
      return sortConfig.direction === 'ascending'
        ? (a[sortConfig.key] as number) - (b[sortConfig.key] as number)
        : (b[sortConfig.key] as number) - (a[sortConfig.key] as number);
    });
    
    setFilteredOrders(result);
  }, [allOrders, statusFilter, searchQuery, sortConfig]);

  const handleSort = (key: keyof Order) => {
    setSortConfig({
      key,
      direction: 
        sortConfig.key === key && sortConfig.direction === 'ascending'
          ? 'descending'
          : 'ascending',
    });
  };

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

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    
    try {
      const normalizedStatus = normalizeStatus(newStatus);
      
      const updatedOrder = await updateOrder(orderId, { 
        status: normalizedStatus 
      });
      
      const updatedOrders = allOrders.map(order => {
        if (order.id === orderId) {
          return updatedOrder;
        }
        return order;
      });
      
      setAllOrders(updatedOrders);
      
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(updatedOrder);
      }
      
      toast({
        title: "Order updated",
        description: `Order #${orderId} status changed to ${normalizedStatus}.`,
      });
      
      // Set the status change completed flag to true
      setStatusChangeCompleted(true);
      
      // Close the dialog after a status change
      setIsDetailsOpen(false);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "Update failed",
        description: "There was a problem updating the order status.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleOrderClick = (order: Order) => {
    // Reset status change flag when opening a new order
    setStatusChangeCompleted(false);
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  const handleDownload = (orderId: string) => {
    toast({
      title: "Document downloaded",
      description: `The document for order #${orderId} has been downloaded.`,
    });
  };

  const isStatus = (orderStatus: string | undefined, checkStatus: string): boolean => {
    return hasStatus({status: orderStatus} as Order, checkStatus);
  };

  // Reset the status change flag when dialog is closed
  const handleDialogOpenChange = (open: boolean) => {
    if (!open && !isUpdating) {
      setIsDetailsOpen(false);
      // Add a small delay before allowing the dialog to be opened again
      setTimeout(() => {
        setStatusChangeCompleted(false);
      }, 300);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Manage Orders</h1>
            <p className="text-gray-600 mt-1">View and manage all print orders</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-full sm:w-44">
                <div className="flex items-center">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter status" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={refreshOrders}>
              Refresh
            </Button>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">All Orders ({filteredOrders.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort('id')}
                    >
                      <div className="flex items-center">
                        Order ID
                        {sortConfig.key === 'id' && (
                          sortConfig.direction === 'ascending' ? (
                            <ArrowUp className="ml-1 h-4 w-4" />
                          ) : (
                            <ArrowDown className="ml-1 h-4 w-4" />
                          )
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort('userName')}
                    >
                      <div className="flex items-center">
                        Customer
                        {sortConfig.key === 'userName' && (
                          sortConfig.direction === 'ascending' ? (
                            <ArrowUp className="ml-1 h-4 w-4" />
                          ) : (
                            <ArrowDown className="ml-1 h-4 w-4" />
                          )
                        )}
                      </div>
                    </TableHead>
                    <TableHead>Document</TableHead>
                    <TableHead>Paper Type</TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort('createdAt')}
                    >
                      <div className="flex items-center">
                        Date
                        {sortConfig.key === 'createdAt' && (
                          sortConfig.direction === 'ascending' ? (
                            <ArrowUp className="ml-1 h-4 w-4" />
                          ) : (
                            <ArrowDown className="ml-1 h-4 w-4" />
                          )
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort('totalPrice')}
                    >
                      <div className="flex items-center">
                        Amount
                        {sortConfig.key === 'totalPrice' && (
                          sortConfig.direction === 'ascending' ? (
                            <ArrowUp className="ml-1 h-4 w-4" />
                          ) : (
                            <ArrowDown className="ml-1 h-4 w-4" />
                          )
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center">
                        Status
                        {sortConfig.key === 'status' && (
                          sortConfig.direction === 'ascending' ? (
                            <ArrowUp className="ml-1 h-4 w-4" />
                          ) : (
                            <ArrowDown className="ml-1 h-4 w-4" />
                          )
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => {
                      const { paper } = getPaperAndBindingInfo(order);
                      return (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">#{order.id}</TableCell>
                          <TableCell>{order.userName}</TableCell>
                          <TableCell className="truncate max-w-[200px]">{order.documentName}</TableCell>
                          <TableCell>{paper}</TableCell>
                          <TableCell className="text-gray-600">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="font-medium">₹{order.totalPrice}</TableCell>
                          <TableCell>
                            <OrderStatusBadge status={order.status} />
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8"
                                onClick={() => handleOrderClick(order)}
                              >
                                View
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8"
                                onClick={() => handleDownload(order.id)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No orders found</p>
                        {searchQuery && (
                          <p className="text-sm text-gray-400 mt-1">Try a different search term</p>
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Dialog 
        open={isDetailsOpen && !statusChangeCompleted} 
        onOpenChange={handleDialogOpenChange}
      >
        <DialogContent className="sm:max-w-3xl">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>Order #{selectedOrder.id}</span>
                  <OrderStatusBadge status={selectedOrder.status} />
                </DialogTitle>
                <DialogDescription>
                  Placed on {new Date(selectedOrder.createdAt).toLocaleDateString()} by {selectedOrder.userName}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Document Details</h4>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm">
                      <FileText className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="truncate">{selectedOrder.documentName}</span>
                    </div>
                    <div className="flex items-start gap-x-6 text-sm">
                      <div>
                        <p className="text-gray-500">Copies</p>
                        <p className="font-medium">{selectedOrder.copies}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Print Type</p>
                        <p className="font-medium">
                          {selectedOrder.colorType === 'color' ? 'Color' : 'Black & White'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Double-sided</p>
                        <p className="font-medium">{selectedOrder.doubleSided ? 'Yes' : 'No'}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Payment Details</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Total Amount</span>
                      <span className="font-bold">₹{selectedOrder.totalPrice}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Payment Status</span>
                      <span className="font-medium text-green-600">Paid</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {selectedOrder.files && selectedOrder.files.length > 0 && (
                <div className="border-t border-gray-200 pt-4 pb-4">
                  <h4 className="text-sm font-medium mb-2">File Details</h4>
                  <div className="space-y-3 max-h-40 overflow-y-auto pr-2">
                    {selectedOrder.files.map((file, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-md">
                        <p className="font-medium text-sm mb-1">{file.file.name}</p>
                        <div className="grid grid-cols-2 text-xs text-gray-600">
                          <div>Copies: {file.copies}</div>
                          <div>Print: {file.printType === 'blackAndWhite' ? 'B&W' : 'Color'}</div>
                          <div>Paper: {file.specialPaper === 'none' ? 'Normal A4' : file.specialPaper}</div>
                          <div>Binding: {file.binding.needed ? file.binding.type.replace('Binding', '') : 'None'}</div>
                          {file.specificRequirements && (
                            <div className="col-span-2 mt-2">
                              <span className="font-medium">Requirements:</span> {file.specificRequirements}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedOrder.details && (
                <div className="border-t border-gray-200 pt-4 pb-4">
                  <h4 className="text-sm font-medium mb-2">Additional Details</h4>
                  <p className="text-sm text-gray-700">{selectedOrder.details}</p>
                </div>
              )}
              
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-sm font-medium mb-3">Update Order Status</h4>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={isStatus(selectedOrder.status, "Pending") ? 'default' : 'outline'}
                    size="sm"
                    disabled={isUpdating || isStatus(selectedOrder.status, "Pending")}
                    onClick={() => handleStatusChange(selectedOrder.id, 'Pending')}
                    className={isStatus(selectedOrder.status, "Pending") ? 'bg-yellow-500 hover:bg-yellow-600' : ''}
                  >
                    Pending
                  </Button>
                  <Button
                    variant={isStatus(selectedOrder.status, "Processing") ? 'default' : 'outline'}
                    size="sm"
                    disabled={isUpdating || isStatus(selectedOrder.status, "Processing")}
                    onClick={() => handleStatusChange(selectedOrder.id, 'Processing')}
                    className={isStatus(selectedOrder.status, "Processing") ? 'bg-blue-500 hover:bg-blue-600' : ''}
                  >
                    Processing
                  </Button>
                  <Button
                    variant={isStatus(selectedOrder.status, "Completed") ? 'default' : 'outline'}
                    size="sm"
                    disabled={isUpdating || isStatus(selectedOrder.status, "Completed")}
                    onClick={() => handleStatusChange(selectedOrder.id, 'Completed')}
                    className={isStatus(selectedOrder.status, "Completed") ? 'bg-green-500 hover:bg-green-600' : ''}
                  >
                    Completed
                  </Button>
                  <Button
                    variant={isStatus(selectedOrder.status, "Cancelled") ? 'default' : 'outline'}
                    size="sm"
                    disabled={isUpdating || isStatus(selectedOrder.status, "Cancelled")}
                    onClick={() => handleStatusChange(selectedOrder.id, 'Cancelled')}
                    className={isStatus(selectedOrder.status, "Cancelled") ? 'bg-red-500 hover:bg-red-600' : ''}
                  >
                    Cancelled
                  </Button>
                </div>
              </div>
              
              <DialogFooter className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleDownload(selectedOrder.id)}
                  disabled={isUpdating}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Document
                </Button>
                <Button 
                  onClick={() => {
                    setIsDetailsOpen(false);
                    setTimeout(() => setStatusChangeCompleted(false), 300);
                  }}
                  disabled={isUpdating}
                >
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default ManageOrders;
