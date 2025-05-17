import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
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
  Users, 
  Search, 
  User,
  Mail,
  Calendar,
  FileText,
  ArrowDown,
  ArrowUp,
  Ban
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import axios from 'axios';

const ManageUsers = () => {
  const { user } = useAuth();
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: keyof any;
    direction: 'ascending' | 'descending';
  }>({
    key: 'name',
    direction: 'ascending',
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Get the user data from localStorage
        const storedUser = localStorage.getItem('printShopUser');
        if (!storedUser) {
          toast({
            title: 'Authentication error',
            description: 'You need to be logged in to view users.',
            variant: 'destructive',
          });
          return;
        }

        // Parse the stored user data
        const userData = JSON.parse(storedUser);
        
        // Make the API request with the authentication headers
        const response = await axios.get('http://localhost:5000/api/users', {
          headers: {
            'X-User-ID': userData.id,
            'X-User-Role': userData.role
          }
        });
        
        setAllUsers(response.data);
        setFilteredUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast({
          title: 'Error loading users',
          description: 'There was a problem fetching the users. Make sure you have admin privileges.',
          variant: 'destructive',
        });
      }
    };
    fetchUsers();
  }, []);

  // Apply search filter and sorting
  useEffect(() => {
    let result = [...allUsers];
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(user => 
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      if (sortConfig.key === 'createdAt') {
        return sortConfig.direction === 'ascending'
          ? new Date(a[sortConfig.key]).getTime() - new Date(b[sortConfig.key]).getTime()
          : new Date(b[sortConfig.key]).getTime() - new Date(a[sortConfig.key]).getTime();
      }
      
      return sortConfig.direction === 'ascending'
        ? (a[sortConfig.key] as string).localeCompare(b[sortConfig.key] as string)
        : (b[sortConfig.key] as string).localeCompare(a[sortConfig.key] as string);
    });
    
    setFilteredUsers(result);
  }, [allUsers, searchQuery, sortConfig]);

  const handleSort = (key: keyof any) => {
    setSortConfig({
      key,
      direction: 
        sortConfig.key === key && sortConfig.direction === 'ascending'
          ? 'descending'
          : 'ascending',
    });
  };

  // Fetch orders for selected user
  const fetchUserOrders = async (userId: string) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/orders?userId=${userId}`);
      setUserOrders(response.data);
    } catch (error) {
      toast({
        title: 'Error loading user orders',
        description: 'There was a problem fetching the user orders.',
        variant: 'destructive',
      });
    }
  };

  const handleUserClick = (user: any) => {
    setSelectedUser(user);
    fetchUserOrders(user._id || user.id);
    setIsDetailsOpen(true);
  };

  // Mock functions for user management (these would connect to real APIs in production)
  const handleResetPassword = (userId: string) => {
    toast({
      title: "Password reset email sent",
      description: "A password reset email has been sent to the user.",
    });
  };

  const handleDisableAccount = (userId: string) => {
    toast({
      title: "Account disabled",
      description: "The user account has been disabled.",
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Manage Users</h1>
            <p className="text-gray-600 mt-1">View and manage all users of the print shop</p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">All Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th 
                      className="text-left py-3 px-4 text-sm font-medium text-gray-500 cursor-pointer"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center">
                        Name
                        {sortConfig.key === 'name' && (
                          sortConfig.direction === 'ascending' ? (
                            <ArrowUp className="ml-1 h-4 w-4" />
                          ) : (
                            <ArrowDown className="ml-1 h-4 w-4" />
                          )
                        )}
                      </div>
                    </th>
                    <th 
                      className="text-left py-3 px-4 text-sm font-medium text-gray-500 cursor-pointer"
                      onClick={() => handleSort('email')}
                    >
                      <div className="flex items-center">
                        Email
                        {sortConfig.key === 'email' && (
                          sortConfig.direction === 'ascending' ? (
                            <ArrowUp className="ml-1 h-4 w-4" />
                          ) : (
                            <ArrowDown className="ml-1 h-4 w-4" />
                          )
                        )}
                      </div>
                    </th>
                    <th 
                      className="text-left py-3 px-4 text-sm font-medium text-gray-500 cursor-pointer"
                      onClick={() => handleSort('createdAt')}
                    >
                      <div className="flex items-center">
                        Joined Date
                        {sortConfig.key === 'createdAt' && (
                          sortConfig.direction === 'ascending' ? (
                            <ArrowUp className="ml-1 h-4 w-4" />
                          ) : (
                            <ArrowDown className="ml-1 h-4 w-4" />
                          )
                        )}
                      </div>
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm font-medium">{user.name}</td>
                        <td className="py-3 px-4 text-sm">{user.email}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8"
                            onClick={() => handleUserClick(user)}
                          >
                            View Details
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-8 text-center">
                        <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No users found</p>
                        {searchQuery && (
                          <p className="text-sm text-gray-400 mt-1">Try a different search term</p>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* User Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-3xl">
          {selectedUser && (
            <>
              <DialogHeader>
                <DialogTitle>User Details</DialogTitle>
                <DialogDescription>
                  View and manage user information
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Profile Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 rounded-full bg-primary-100 text-primary flex items-center justify-center">
                          <User className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="font-medium">{selectedUser.name}</p>
                          <p className="text-sm text-gray-500">User ID: {selectedUser.id}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center text-sm">
                          <Mail className="h-4 w-4 mr-2 text-gray-500" />
                          <span>{selectedUser.email}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                          <span>Joined on {new Date(selectedUser.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Account Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-primary-100 rounded-lg p-3">
                        <p className="text-sm text-gray-600">Total Orders</p>
                        <p className="text-2xl font-bold text-primary">{userOrders.length}</p>
                      </div>
                      <div className="bg-green-100 rounded-lg p-3">
                        <p className="text-sm text-gray-600">Completed</p>
                        <p className="text-2xl font-bold text-green-600">
                          {userOrders.filter(order => order.status === 'completed').length}
                        </p>
                      </div>
                      <div className="bg-yellow-100 rounded-lg p-3">
                        <p className="text-sm text-gray-600">Pending</p>
                        <p className="text-2xl font-bold text-yellow-600">
                          {userOrders.filter(order => order.status === 'pending').length}
                        </p>
                      </div>
                      <div className="bg-blue-100 rounded-lg p-3">
                        <p className="text-sm text-gray-600">Processing</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {userOrders.filter(order => order.status === 'processing').length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  {userOrders.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-sm">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-2 px-3 font-medium text-gray-500">Order ID</th>
                            <th className="text-left py-2 px-3 font-medium text-gray-500">Document</th>
                            <th className="text-left py-2 px-3 font-medium text-gray-500">Date</th>
                            <th className="text-left py-2 px-3 font-medium text-gray-500">Amount</th>
                            <th className="text-left py-2 px-3 font-medium text-gray-500">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {userOrders.slice(0, 5).map((order) => (
                            <tr key={order.id} className="border-b border-gray-200">
                              <td className="py-2 px-3 font-medium">#{order.id}</td>
                              <td className="py-2 px-3 truncate max-w-[150px]">{order.documentName}</td>
                              <td className="py-2 px-3 text-gray-600">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </td>
                              <td className="py-2 px-3 font-medium">₹{order.totalPrice}</td>
                              <td className="py-2 px-3">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                  order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                  order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <FileText className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">This user has no orders yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <DialogFooter className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleResetPassword(selectedUser.id)}
                >
                  Reset Password
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDisableAccount(selectedUser.id)}
                >
                  <Ban className="mr-2 h-4 w-4" />
                  Disable Account
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default ManageUsers;
