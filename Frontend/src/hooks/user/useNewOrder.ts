import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "@/components/ui/use-toast";
import { calculateTotalPrice } from "@/services/calculateTotalPrice";
import { parseColorPages } from "@/utils/printUtils";
import { fetchStoreById, fetchStorePricing, fetchStores } from "@/api";
import { fetchPendingOrdersCounts } from "@/api/ordersCountApi";
import { createOrder } from "@/api/orderApi";
import type { OrderFormData, FileDetails } from "@/types/order";
import type { Store } from "@/types/store";
import useAuthStore from "@/store/authStore";

export const useNewOrder = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState<FileDetails[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStorePricing, setSelectedStorePricing] = useState<any>(null);
  const [storeSelected, setStoreSelected] = useState<Store | null>(null);
  const [pendingOrdersCount, setPendingOrdersCount] = useState<number>(0);
  const [isCountLoading, setIsCountLoading] = useState(false);

  const form = useForm<OrderFormData>({
    defaultValues: {
      documentName: "",
      files: [],
      description: "",
      storeId: "",
    },
  });

  const watchedStoreId = form.watch("storeId");

  // Load stores on component mount
  useEffect(() => {
    const loadStores = async () => {
      try {
        const storesData = await fetchStores();
        setStores(storesData);
      } catch (error) {
        console.error("Error loading stores:", error);
        toast({
          title: "Error",
          description: "Failed to load stores. Please try again.",
          variant: "destructive",
        });
      }
    };

    loadStores();
  }, []);

  // Load store-specific data when store is selected
  useEffect(() => {
    const loadStoreData = async () => {
      if (!watchedStoreId) {
        setSelectedStorePricing(null);
        setStoreSelected(null);
        setPendingOrdersCount(0);
        return;
      }

      try {
        // Load store details and pricing in parallel
        const [storeData, pricingData] = await Promise.all([
          fetchStoreById(watchedStoreId),
          fetchStorePricing(watchedStoreId),
        ]);

        setStoreSelected(storeData);
        setSelectedStorePricing(pricingData);

        // Load pending orders count
        setIsCountLoading(true);
        const countData = await fetchPendingOrdersCounts();
        setPendingOrdersCount(countData.pendingOrders || 0);
      } catch (error) {
        console.error("Error loading store data:", error);
        toast({
          title: "Error",
          description: "Failed to load store information. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsCountLoading(false);
      }
    };

    loadStoreData();
  }, [watchedStoreId]);

  // Calculate total price when files change
  useEffect(() => {
    if (files.length > 0 && selectedStorePricing) {
      const price = calculateTotalPrice(files, selectedStorePricing);
      setTotalPrice(price);
    } else {
      setTotalPrice(0);
    }
  }, [files, selectedStorePricing]);

  // Handle file selection
  const handleFileSelect = (newFiles: FileDetails[]) => {
    setFiles(newFiles);
    form.setValue("files", newFiles);
  };

  // Handle file removal
  const handleFileRemove = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    form.setValue("files", updatedFiles);
  };

  // Handle form submission
  const handleSubmit = async (data: OrderFormData) => {
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "Please log in to place an order.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    if (files.length === 0) {
      toast({
        title: "No Files Selected",
        description: "Please upload at least one file to proceed.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const orderData: OrderFormData = {
        ...data,
        files: files,
      };

      // Validate color pages for mixed print type files
      for (const file of files) {
        if (file.printType === "mixed") {
          const parsedPages = parseColorPages(file.colorPages || "");
          if (parsedPages.length === 0) {
            toast({
              title: "Invalid Color Pages",
              description: `Please specify which pages to print in color for file: ${file.file.name}`,
              variant: "destructive",
            });
            return;
          }
        }
      }

      const response = await createOrder(orderData);

      toast({
        title: "Order Placed Successfully!",
        description: `Your order has been submitted with ID: ${response.id || response._id}`,
      });

      // Navigate to order confirmation or orders list
      navigate("/user/orders");
    } catch (error: any) {
      console.error("Error creating order:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to place order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get estimated delivery time
  const getEstimatedDeliveryTime = () => {
    if (!storeSelected) return "N/A";
    
    const baseHours = 24; // Base delivery time
    const additionalHours = Math.floor(pendingOrdersCount / 5) * 2; // 2 hours per 5 orders
    const totalHours = baseHours + additionalHours;
    
    if (totalHours <= 24) {
      return "24 hours";
    } else if (totalHours <= 48) {
      return "2 days";
    } else {
      return `${Math.ceil(totalHours / 24)} days`;
    }
  };

  // Get store queue status
  const getStoreQueueStatus = () => {
    if (pendingOrdersCount === 0) return "No queue";
    if (pendingOrdersCount <= 5) return "Short queue";
    if (pendingOrdersCount <= 15) return "Medium queue";
    return "Long queue";
  };

  // Get queue status color
  const getQueueStatusColor = () => {
    if (pendingOrdersCount === 0) return "text-green-600";
    if (pendingOrdersCount <= 5) return "text-yellow-600";
    if (pendingOrdersCount <= 15) return "text-orange-600";
    return "text-red-600";
  };

  return {
    // State
    isSubmitting,
    files,
    totalPrice,
    stores,
    selectedStorePricing,
    storeSelected,
    pendingOrdersCount,
    isCountLoading,
    form,
    user,
    
    // Actions
    handleFileSelect,
    handleFileRemove,
    handleSubmit,
    
    // Utilities
    getEstimatedDeliveryTime,
    getStoreQueueStatus,
    getQueueStatusColor,
  };
};
