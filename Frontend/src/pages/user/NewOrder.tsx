import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import UserLayout from "@/components/layouts/UserLayout";
import { Button } from "@/components/ui/button";
import { calculateTotalPrice } from "@/services/calculateTotalPrice";
import { parseColorPages } from "@/utils/printUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import FileUploader from "@/components/FileUploader";
import { toast } from "@/components/ui/use-toast";
import {
  fetchStoreById,
  fetchStorePricing,
  fetchStores,
} from "@/api";
import { fetchPendingOrdersCounts } from "@/api/ordersCountApi";
import type { OrderFormData, FileDetails, Order } from "@/types/order";
import type { Store } from "@/types/store";
import useAuthStore from "@/store/authStore";
import { createOrder } from "@/api/orderApi"; // Import the API function directly

const NewOrder = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState<FileDetails[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [stores, setStores] = useState<Store[]>([]);
  // We'll use this state directly in the store objects rather than separately
  const [selectedStorePricing, setSelectedStorePricing] = useState<any>(null);
  const [storeSelected, setStoreSelected] = useState<Store | null>(null);
  const [loadingStores, setLoadingStores] = useState(false);

  const form = useForm<OrderFormData>({
    defaultValues: {
      documentName: "",
      files: [],
      description: "",
      storeId: "",
    },
  });

  // Update document name based on file count
  useEffect(() => {
    const fileCount = files.length;
    const documentName =
      fileCount === 1
        ? files[0].file.name
        : `${fileCount} document${fileCount !== 1 ? "s" : ""}`;

    form.setValue("documentName", documentName);
    form.setValue("files", files);
  }, [files, form]);

  const handleFileSelected = (fileDetail: FileDetails) => {
    setFiles((prevFiles) => {
      const existingIndex = prevFiles.findIndex(
        (f) => f.file.name === fileDetail.file.name
      );

      if (existingIndex >= 0) {
        // Update existing file details
        const newFiles = [...prevFiles];
        newFiles[existingIndex] = fileDetail;
        return newFiles;
      } else {
        // Add new file
        return [...prevFiles, fileDetail];
      }
    });
  };

  const handleFileRemoved = (file: File) => {
    setFiles((prev) => prev.filter((f) => f.file !== file));
  };

  // Calculate total price whenever files change
  useEffect(() => {
    const newTotalPrice = calculateTotalPrice(files, selectedStorePricing);
    setTotalPrice(newTotalPrice);
  }, [files, selectedStorePricing]);

  useEffect(() => {
    const loadStores = async () => {
      try {
        setLoadingStores(true);
        const storesData = await fetchStores();
        console.log("Fetched stores:", storesData);
        setStores(storesData.filter((store) => store.status === "active"));
      } catch (error) {
        console.error("Error fetching stores:", error);
        toast({
          title: "Error",
          description: "Failed to load stores. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoadingStores(false);
      }
    };

    loadStores();
  }, []);

  // Update stores with actual pending orders data
  useEffect(() => {
    if (stores.length === 0) return;
    
    const updatePendingOrderCounts = async () => {
      try {
        // Show loading indicator
        setLoadingStores(true);
        
        // Fetch actual pending orders data using the API function
        const pendingOrdersData = await fetchPendingOrdersCounts();
        
        // Update store data with pending orders count
        const updatedStores = stores.map(store => {
          const storeId = store._id?.toString() || store.id?.toString() || "";
          const count = pendingOrdersData[storeId] || 0;
          
          return {
            ...store,
            pendingOrdersCount: count
          };
        });
        
        setStores(updatedStores);
      } catch (error) {
        console.error("Error updating pending order counts:", error);
        // No need to show a toast here as it would disrupt user experience
      } finally {
        setLoadingStores(false);
      }
    };
    
    updatePendingOrderCounts();
  }, [stores.length]); // Only run when stores are first loaded

  // Function to determine color based on pending orders count
  const getPendingOrdersColor = (count?: number): string => {
    if (count === undefined || count === 0 || count <= 2) return "bg-green-100 text-green-700";
    if (count <= 5) return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  // Function to get text based on pending orders count
  const getPendingOrdersText = (count?: number): string => {
    if (count === undefined || count === 0) return "No pending orders";
    if (count === 1) return "1 pending order";
    return `${count} pending orders`;
  };
  // Handle store selection and fetch pricing data
  const handleStoreSelection = async (storeId: string) => {
    try {
      setIsSubmitting(true); // Show loading state
      // Find the store in our stores array to get its pendingOrdersCount
      const selectedStore = stores.find(store => (store._id || store.id) === storeId);
      
      // If store not found in our array, fetch it
      const storeData: Store = selectedStore || await fetchStoreById(storeId);
      
      // Get pricing data
      const pricingData = await fetchStorePricing(storeId);
      
      // Make sure we preserve the pendingOrdersCount if we have it
      setStoreSelected({
        ...storeData,
        pendingOrdersCount: selectedStore?.pendingOrdersCount || storeData.pendingOrdersCount || 0
      });
      
      if (pricingData) {
        setSelectedStorePricing(pricingData);

        // Update prices for any existing files
        if (files.length > 0) {
          // Recalculate prices with the new pricing data
          const newTotalPrice = calculateTotalPrice(files, pricingData);
          setTotalPrice(newTotalPrice);
        }

        toast({
          title: "Store Selected",
          description: "You can now upload your documents for printing.",
        });
      } else {
        toast({
          title: "Pricing Not Available",
          description:
            "Could not fetch pricing information for the selected store.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching store pricing:", error);
      toast({
        title: "Error",
        description: "Failed to load store pricing information.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
      // Calculate if we have any color files
      const hasColorFile = files.some((file) => file.printType === "color");
      const colorType = hasColorFile ? "color" : "blackAndWhite";

      // Create the order in the backend
      const orderData: Partial<Order> = {
        customerName: user?.username || "Unknown User",
        documentName: data.documentName,
        userId: user?.id,
        status: "Pending",
        files: files,
        details: data.description,
        copies: files.reduce((total, file) => total + (file.copies || 1), 0),
        colorType: colorType,
        doubleSided: files.some((file) => file.doubleSided),
        totalPrice: totalPrice,
        storeId: data.storeId,
        storeName: storeSelected?.name,
      };

      const result = await createOrder(orderData);

      toast({
        title: "Order submitted successfully",
        description: `Your print order has been sent to ${storeSelected?.name} and is being processed`,
      });
      navigate("/orders");
    } catch (error) {
      console.error("Error submitting order:", error);
      toast({
        title: "Error submitting order",
        description:
          "An error occurred while submitting your order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to calculate mixed print details
  const getMixedPrintDetails = (colorPagesStr: string, pageCount: number) => {
    const colorPages = parseColorPages(colorPagesStr || "", pageCount);
    const colorPagesCount = colorPages.length;
    const bwPagesCount = pageCount - colorPagesCount;
    return {
      colorPagesCount,
      bwPagesCount,
      summary: `${colorPagesCount} color, ${bwPagesCount} B&W`,
    };
  };

  // Calculate price breakdown for mixed printing
  const getMixedPrintPriceBreakdown = (file: FileDetails) => {
    if (file.printType !== "mixed" || !file.pageCount) {
      return null;
    }

    const pricing = selectedStorePricing || {
      blackAndWhite: { singleSided: 2, doubleSided: 3 },
      color: { singleSided: 5, doubleSided: 8 },
    };

    const { colorPagesCount, bwPagesCount } = getMixedPrintDetails(
      file.colorPages || "",
      file.pageCount
    );

    const sideType = file.doubleSided ? "doubleSided" : "singleSided";
    const colorRate = pricing.color[sideType];
    const bwRate = pricing.blackAndWhite[sideType];

    const colorCost = colorPagesCount * colorRate * (file.copies || 1);
    const bwCost = bwPagesCount * bwRate * (file.copies || 1);

    return {
      colorRate,
      bwRate,
      colorCost,
      bwCost,
      totalCost: colorCost + bwCost,
    };
  };

  // Filter only active stores
  // const activeStores = stores.filter((store) => store.status === "active");

  // Function to manually refresh pending order counts
  const refreshPendingOrderCounts = async () => {
    try {
      setLoadingStores(true);
      
      // Fetch actual pending orders data using the API function
      const pendingOrdersData = await fetchPendingOrdersCounts();
      
      // Update store data with pending orders count
      const updatedStores = stores.map(store => {
        const storeId = store._id?.toString() || store.id?.toString() || "";
        const count = pendingOrdersData[storeId] || 0;
        
        return {
          ...store,
          pendingOrdersCount: count
        };
      });
      
      setStores(updatedStores);
      
      // Also update the selected store if one is selected
      if (storeSelected) {
        const storeId = storeSelected._id?.toString() || storeSelected.id?.toString() || "";
        const count = pendingOrdersData[storeId] || 0;
        
        setStoreSelected({
          ...storeSelected,
          pendingOrdersCount: count
        });
      }
      
      toast({
        title: "Refreshed",
        description: "Pending order counts have been updated",
      });
    } catch (error) {
      console.error("Error refreshing pending order counts:", error);
      toast({
        title: "Error",
        description: "Failed to refresh pending order counts",
        variant: "destructive",
      });
    } finally {
      setLoadingStores(false);
    }
  };

  return (
    <UserLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">New Print Order</h1>
          <p className="text-gray-600 mt-2">
            Upload your documents and set printing preferences for each file
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Document Details</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    {/* Store Selection */}
                    <FormField
                      control={form.control}
                      name="storeId"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex justify-between items-center">
                            <FormLabel>Select Store</FormLabel>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm" 
                              onClick={(e) => {
                                e.preventDefault();
                                refreshPendingOrderCounts();
                              }}
                              disabled={loadingStores}
                            >
                              {loadingStores ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <span className="text-xs">Refresh Counts</span>
                              )}
                            </Button>
                          </div>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              handleStoreSelection(value);
                            }}
                            value={field.value}
                            disabled={loadingStores}
                          >
                            <FormControl>
                              <SelectTrigger>
                                {loadingStores ? (
                                  <div className="flex items-center">
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    <span>Loading stores...</span>
                                  </div>
                                ) : (
                                  <SelectValue placeholder="Select a store">
                                    {storeSelected && (
                                      <div className="flex items-center justify-between">
                                        <span>{storeSelected.name}</span>
                                        <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${getPendingOrdersColor(storeSelected.pendingOrdersCount)}`}>
                                          {getPendingOrdersText(storeSelected.pendingOrdersCount)}
                                        </span>
                                      </div>
                                    )}
                                  </SelectValue>
                                )}
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {stores.length > 0 ? (
                                stores.map((store) => (
                                  <SelectItem
                                    key={store._id || store.id}
                                    value={store._id || store.id || ""}
                                  >
                                    <div className="flex flex-col">
                                      <div className="flex items-center justify-between w-full">
                                        <span>{store.name}</span>
                                        {/* Always show the status indicator, but with appropriate text based on count */}
                                        <span className={`px-2 py-0.5 rounded-full text-xs ${getPendingOrdersColor(store.pendingOrdersCount)}`}>
                                          {getPendingOrdersText(store.pendingOrdersCount)}
                                        </span>
                                      </div>
                                      {store.location && (
                                        <span className="text-gray-500 text-xs">
                                          ({store.location})
                                        </span>
                                      )}
                                    </div>
                                  </SelectItem>
                                ))
                              ) : (
                                <div className="p-2 text-center text-sm text-gray-500">
                                  {loadingStores
                                    ? "Loading stores..."
                                    : "No stores available"}
                                </div>
                              )}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Choose a store to print your documents
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
                            {!storeSelected ? (
                              <div className="p-4 border-2 border-dashed border-gray-300 rounded-md text-center">
                                <p className="text-gray-500 mb-2">
                                  Please select a store first
                                </p>
                                <p className="text-sm text-gray-400">
                                  You need to select a store before uploading
                                  documents
                                </p>
                              </div>
                            ) : (
                              <FileUploader
                                onFileSelected={handleFileSelected}
                                onFileRemoved={handleFileRemoved}
                                files={files}
                                store={storeSelected}
                              />
                            )}
                          </FormControl>
                          <FormDescription>
                            Upload your documents and set specific preferences
                            for each file
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
                            Add any additional instructions that apply to the
                            entire order
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
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                            Submitting Order...
                          </>
                        ) : (
                          "Submit Order"
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate("/dashboard")}
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
                      {form.watch("storeId") ? (
                        stores.find(
                          (store) =>
                            (store._id || store.id) === form.watch("storeId")
                        )?.name || "Selected store"
                      ) : (
                        <span className="text-gray-400">No store selected</span>
                      )}
                    </p>
                  </div>

                  <div className="border-b border-gray-200 pb-4">
                    <p className="text-sm text-gray-500 mb-1">Documents</p>
                    <p className="font-medium">
                      {files.length} document{files.length !== 1 ? "s" : ""}
                    </p>
                  </div>

                  {files.map((file, index) => (
                    <div key={index} className="border-b border-gray-200 pb-4">
                      <p className="font-medium truncate mb-2">
                        {file.file.name}
                      </p>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Copies</span>
                          <span>{file.copies}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Print Type</span>
                          <span>
                            {file.printType === "blackAndWhite"
                              ? "Black & White"
                              : file.printType === "mixed"
                              ? "Mixed (B&W + Color)"
                              : "Color"}
                          </span>
                        </div>
                        {file.printType === "mixed" &&
                          file.pageCount &&
                          file.colorPages && (
                            <div className="flex justify-between items-center">
                              <span className="text-gray-500 flex items-center">
                                Mixed Printing
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className="inline-block ml-1 cursor-help">
                                        <Info className="h-3.5 w-3.5 text-gray-400" />
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent
                                      side="right"
                                      className="max-w-xs"
                                    >
                                      <p className="font-medium text-xs mb-1">
                                        Color Pages: {file.colorPages}
                                      </p>
                                      <p className="text-xs">
                                        {(() => {
                                          const breakdown =
                                            getMixedPrintPriceBreakdown(file);
                                          if (!breakdown) return null;
                                          return `B&W: ${
                                            getMixedPrintDetails(
                                              file.colorPages,
                                              file.pageCount
                                            ).bwPagesCount
                                          } pages at ₹${breakdown.bwRate}/page
Color: ${
                                            getMixedPrintDetails(
                                              file.colorPages,
                                              file.pageCount
                                            ).colorPagesCount
                                          } pages at ₹${
                                            breakdown.colorRate
                                          }/page`;
                                        })()}
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </span>
                              <span>
                                {(() => {
                                  const details = getMixedPrintDetails(
                                    file.colorPages || "",
                                    file.pageCount
                                  );
                                  return `${details.colorPagesCount} color, ${details.bwPagesCount} B&W`;
                                })()}
                              </span>
                            </div>
                          )}
                        <div className="flex justify-between">
                          <span className="text-gray-500">
                            Special Paper (Additional)
                          </span>
                          <span>
                            {file.specialPaper === "none"
                              ? "None"
                              : file.specialPaper}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Double-sided</span>
                          <span>{file.doubleSided ? "Yes" : "No"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Binding</span>
                          <span>
                            {file.binding.needed
                              ? file.binding.type.replace("Binding", "")
                              : "None"}
                          </span>
                        </div>
                        {file.printType === "mixed" && (
                          <div className="border-t border-gray-200 pt-4">
                            <p className="text-sm text-gray-500 mb-2">
                              Price Breakdown (Mixed Printing)
                            </p>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Color Rate</span>
                              <span className="text-gray-900">
                                ₹
                                {getMixedPrintPriceBreakdown(file)?.colorRate ||
                                  0}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">B&W Rate</span>
                              <span className="text-gray-900">
                                ₹
                                {getMixedPrintPriceBreakdown(file)?.bwRate || 0}
                              </span>
                            </div>
                            <div className="flex justify-between font-medium">
                              <span>Total Cost</span>
                              <span>
                                ₹
                                {getMixedPrintPriceBreakdown(file)?.totalCost ||
                                  0}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  <div>
                    <div className="flex justify-between">
                      <p className="font-medium">Total Price</p>
                      <p className="font-bold text-lg">
                        ₹{totalPrice.toFixed(2)}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      * Final price includes all copies, special paper, and
                      specifications
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
