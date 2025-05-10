import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import UserLayout from '@/components/layouts/UserLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from 'lucide-react';
import FileUploader from '@/components/FileUploader';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { createOrder } from '@/api';
import type { OrderFormData, FileDetails, Order } from '@/types/order';
import axios from 'axios';

const NewOrder = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState<FileDetails[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [stores, setStores] = useState([]);
  
  const form = useForm<OrderFormData>({
    defaultValues: {
      documentName: '',
      files: [],
      description: '',
      storeId: '',
    },
  });

  // Update document name based on file count
  useEffect(() => {
    const fileCount = files.length;
    const documentName = fileCount === 1 
      ? files[0].file.name 
      : `${fileCount} document${fileCount !== 1 ? 's' : ''}`;
    
    form.setValue('documentName', documentName);
    form.setValue('files', files);
  }, [files, form]);

  const handleFileSelected = (fileDetail: FileDetails) => {
    const existingIndex = files.findIndex(f => f.file.name === fileDetail.file.name);
    
    if (existingIndex >= 0) {
      // Update existing file details
      const newFiles = [...files];
      newFiles[existingIndex] = fileDetail;
      setFiles(newFiles);
    } else {
      // Add new file
      setFiles(prev => [...prev, fileDetail]);
    }
  };

  const handleFileRemoved = (file: File) => {
    setFiles(prev => prev.filter(f => f.file !== file));
  };

  const calculateTotalPrice = (fileDetails: FileDetails[]) => {
    return fileDetails.reduce((total, file) => {
      // Base price calculation (2 Rs per page for B&W, 5 Rs for color)
      const basePricePerPage = file.printType === 'color' ? 5 : 2;
      // Assuming each document is approximately 10 pages
      const estimatedPages = 10;
      const copiesMultiplier = file.copies || 1;
      const doubleSidedDiscount = file.doubleSided ? 0.8 : 1; // 20% discount for double-sided
      
      const basePrice = basePricePerPage * estimatedPages * copiesMultiplier * doubleSidedDiscount;
      
      // Additional costs for special paper
      let specialPaperCost = 0;
      switch (file.specialPaper) {
        case 'glossy':
          specialPaperCost = 5;
          break;
        case 'matte':
          specialPaperCost = 7;
          break;
        case 'transparent':
          specialPaperCost = 10;
          break;
        case 'none':
        default:
          specialPaperCost = 0;
      }
      
      // Binding costs
      let bindingCost = 0;
      if (file.binding.needed) {
        switch (file.binding.type) {
          case 'spiralBinding':
            bindingCost = 25;
            break;
          case 'staplingBinding':
            bindingCost = 10;
            break;
          case 'hardcoverBinding':
            bindingCost = 50;
            break;
          default:
            bindingCost = 0;
        }
      }
      
      return total + basePrice + specialPaperCost + bindingCost;
    }, 0);
  };

  // Calculate total price whenever files change
  useEffect(() => {
    const newTotalPrice = calculateTotalPrice(files);
    setTotalPrice(newTotalPrice);
  }, [files]);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/stores');
        setStores(response.data);
      } catch (error) {
        console.error('Error fetching stores:', error);
      }
    };

    fetchStores();
  }, []);

  const onSubmit = async (data: OrderFormData) => {
    if (files.length === 0) {
      toast({
        title: "Missing documents",
        description: "Please upload at least one document to print",
        variant: "destructive",
      });
      return;
    }

    if (!data.storeId) {
      toast({
        title: "Store not selected",
        description: "Please select a store to send your print order to",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log('Submitting order with files:', files);
      
      // Calculate if we have any color files
      const hasColorFile = files.some(file => file.printType === 'color');
      const colorType = hasColorFile ? 'color' : 'blackAndWhite';
      
      // Get store information
      const selectedStore = stores.find(store => store.id === data.storeId);
      
      // Create the order in the backend
      const orderData: Partial<Order> = {
        customerName: data.documentName,
        documentName: data.documentName,
        userId: user?.id,
        status: 'Pending',
        files: files,
        details: data.description,
        copies: files.reduce((total, file) => total + (file.copies || 1), 0),
        colorType: colorType,
        doubleSided: files.some(file => file.doubleSided),
        totalPrice: totalPrice,
        storeId: data.storeId,
        storeName: selectedStore?.name,
      };
      
      console.log('Sending order data:', orderData);
      const result = await createOrder(orderData);
      console.log('Order created:', result);
      
      toast({
        title: "Order submitted successfully",
        description: `Your print order has been sent to ${selectedStore?.name} and is being processed`,
      });
      
      navigate('/orders');
    } catch (error) {
      console.error('Error submitting order:', error);
      toast({
        title: "Error submitting order",
        description: "An error occurred while submitting your order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter only active stores
  const activeStores = stores.filter(store => store.status === 'active');

  return (
    <UserLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">New Print Order</h1>
          <p className="text-gray-600 mt-2">Upload your documents and set printing preferences for each file</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Document Details</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Store Selection */}
                    <FormField
                      control={form.control}
                      name="storeId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Select Store</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Choose a store to send your print order" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {activeStores.map((store) => (
                                <SelectItem key={store.id} value={store.id}>
                                  {store.name} - {store.location}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Select the store where you want your documents to be printed
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="files"
                      render={() => (
                        <FormItem className="space-y-2">
                          <FormLabel>Upload Documents</FormLabel>
                          <FormControl>
                            <FileUploader 
                              onFileSelected={handleFileSelected}
                              onFileRemoved={handleFileRemoved}
                              files={files}
                            />
                          </FormControl>
                          <FormDescription>
                            Upload your documents and set specific preferences for each file
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel>Additional Instructions</FormLabel>
                          <FormControl>
                            <textarea
                              {...field}
                              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              placeholder="Add any general instructions for your order..."
                            />
                          </FormControl>
                          <FormDescription>
                            Add any additional instructions that apply to the entire order
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                      <Button 
                        type="submit" 
                        className="bg-primary hover:bg-primary-500"
                        disabled={isSubmitting || files.length === 0}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting Order...
                          </>
                        ) : (
                          'Submit Order'
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate('/dashboard')}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Store Information */}
                  <div className="border-b border-gray-200 pb-4">
                    <p className="text-sm text-gray-500 mb-1">Selected Store</p>
                    <p className="font-medium">
                      {form.watch('storeId') ? (
                        activeStores.find(store => store.id === form.watch('storeId'))?.name
                      ) : (
                        <span className="text-gray-400">No store selected</span>
                      )}
                    </p>
                  </div>

                  <div className="border-b border-gray-200 pb-4">
                    <p className="text-sm text-gray-500 mb-1">Documents</p>
                    <p className="font-medium">
                      {files.length} document{files.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  
                  {files.map((file, index) => (
                    <div key={index} className="border-b border-gray-200 pb-4">
                      <p className="font-medium truncate mb-2">{file.file.name}</p>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Copies</span>
                          <span>{file.copies}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Print Type</span>
                          <span>{file.printType === 'blackAndWhite' ? 'Black & White' : 'Color'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Special Paper (Additional)</span>
                          <span>{file.specialPaper === 'none' ? 'None' : file.specialPaper}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Double-sided</span>
                          <span>{file.doubleSided ? 'Yes' : 'No'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Binding</span>
                          <span>{file.binding.needed ? file.binding.type.replace('Binding', '') : 'None'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div>
                    <div className="flex justify-between">
                      <p className="font-medium">Total Price</p>
                      <p className="font-bold text-lg">₹{totalPrice.toFixed(2)}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      * Final price includes all copies, special paper, and specifications
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default NewOrder;
