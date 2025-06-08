import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import UserLayout from "@/components/layouts/UserLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { createOrder, fetchStorePricing, fetchStores } from "@/api";
import type { OrderFormData, FileDetails, Order } from "@/types/order";
import type { Store } from "@/types/store";
import useAuthStore from "@/store/authStore";

const NewOrder = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState<FileDetails[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStorePricing, setSelectedStorePricing] = useState<any>(null);
  const [storeSelected, setStoreSelected] = useState(false);
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
    const existingIndex = files.findIndex(
      (f) => f.file.name === fileDetail.file.name
    );

    if (existingIndex >= 0) {
      // Update existing file details
      const newFiles = [...files];
      newFiles[existingIndex] = fileDetail;
      setFiles(newFiles);
    } else {
      // Add new file
      setFiles((prev) => [...prev, fileDetail]);
    }
  };

  const handleFileRemoved = (file: File) => {
    setFiles((prev) => prev.filter((f) => f.file !== file));
  };

  const calculateTotalPrice = (
    fileDetails: FileDetails[],
    pricing: any = null
  ) => {
    // If no pricing data is provided, use default pricing
    const defaultPricing = {
      blackAndWhite: { singleSided: 2, doubleSided: 3 },
      color: { singleSided: 5, doubleSided: 8 },
      binding: { spiralBinding: 25, staplingBinding: 10, hardcoverBinding: 50 },
      paperTypes: { normal: 0, glossy: 5, matte: 7, transparent: 10 },
    };

    // Use store pricing if available, otherwise use default pricing
    const storePricing = pricing || selectedStorePricing || defaultPricing;

    return fileDetails.reduce((total, file) => {
      // Get the appropriate price based on print type and whether it's double-sided
      let basePricePerPage;
      if (file.printType === "color") {
        basePricePerPage = file.doubleSided
          ? storePricing.color?.doubleSided || defaultPricing.color.doubleSided
          : storePricing.color?.singleSided || defaultPricing.color.singleSided;
      } else {
        // blackAndWhite
        basePricePerPage = file.doubleSided
          ? storePricing.blackAndWhite?.doubleSided ||
            defaultPricing.blackAndWhite.doubleSided
          : storePricing.blackAndWhite?.singleSided ||
            defaultPricing.blackAndWhite.singleSided;
      }

      // Use actual page count from file metadata or estimate based on file size
      // For PDF files, we can get a more accurate page count
      let pageCount = 0;

      if (file.pageCount && file.pageCount > 0) {
        // Use the page count if it's available in the file metadata
        pageCount = file.pageCount;
      } else {
        // Estimate page count based on file size (rough estimate: 100KB per page for PDFs)
        const fileSizeInKB = file.file.size / 1024;
        pageCount = Math.max(1, Math.ceil(fileSizeInKB / 100));
      }

      const copiesMultiplier = file.copies || 1;

      const basePrice = basePricePerPage * pageCount * copiesMultiplier;

      // Additional costs for special paper
      let specialPaperCost = 0;
      if (file.specialPaper !== "none") {
        specialPaperCost =
          (storePricing.paperTypes?.[file.specialPaper] ||
            defaultPricing.paperTypes[file.specialPaper]) *
          pageCount *
          copiesMultiplier;
      }

      // Binding costs
      let bindingCost = 0;
      if (file.binding.needed && file.binding.type !== "none") {
        bindingCost =
          storePricing.binding?.[file.binding.type] ||
          defaultPricing.binding[file.binding.type];
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
    const loadStores = async () => {
      try {
        setLoadingStores(true);
        const storesData = await fetchStores();
        console.log("Fetched stores:", storesData);
        setStores(storesData);
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

  // Handle store selection and fetch pricing data
  const handleStoreSelection = async (storeId: string) => {
    try {
      setIsSubmitting(true); // Show loading state
      const pricingData = await fetchStorePricing(storeId);

      if (pricingData) {
        setSelectedStorePricing(pricingData);
        setStoreSelected(true);

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
      console.log("Submitting order with files:", files);

      // Calculate if we have any color files
      const hasColorFile = files.some((file) => file.printType === "color");
      const colorType = hasColorFile ? "color" : "blackAndWhite";

      // Get store information
      const selectedStore = stores.find((store) => store.id === data.storeId);

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
        storeName: selectedStore?.name,
      };

      console.log("Sending order data:", orderData);
      const result = await createOrder(orderData);
      console.log("Order created:", result);

      toast({
        title: "Order submitted successfully",
        description: `Your print order has been sent to ${selectedStore?.name} and is being processed`,
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

  // Filter only active stores
  // const activeStores = stores.filter((store) => store.status === "active");

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
                          <FormLabel>Select Store</FormLabel>
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
                                  <SelectValue placeholder="Select a store" />
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
                                    {store.name}
                                    {store.location && (
                                      <span className="text-gray-500 text-xs ml-2">
                                        ({store.location})
                                      </span>
                                    )}
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
                              : "Color"}
                          </span>
                        </div>
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
