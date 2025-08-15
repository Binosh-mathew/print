import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "@/components/ui/use-toast";
import { 
  fetchProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct, 
  fetchProductCategories,
  toggleProductFeature
} from "@/api";
import { Product } from "@/types/product";

// Default categories as fallback
const defaultCategories = [
  { value: "electronics", label: "Electronics" },
  { value: "software", label: "Software" },
  { value: "printing", label: "Printing Supplies" },
  { value: "beauty", label: "Beauty" },
  { value: "other", label: "Other" },
];

const initialFormState = {
  name: "",
  description: "",
  price: "",
  discountPrice: "",
  image: "",
  category: "other",
  tags: "",
  affiliateUrl: "",
  featured: false,
};

export const useProductManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState(defaultCategories);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editProductId, setEditProductId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);

  const form = useForm({
    defaultValues: initialFormState
  });

  // Load products
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true);
        const data = await fetchProducts();
        
        // Check if products have correct structure
        if (data && data.length > 0) {
          // Our fetchProducts function in API now maps _id to id
          // So we don't need to create temporary IDs anymore
          setProducts(data);
        } else {
          setProducts([]);
        }
      } catch (error) {
        toast({
          title: "Error loading products",
          description: "Failed to load products. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoading(true);
        const data = await fetchProductCategories();
        
        if (data && data.length > 0) {
          // Add beauty category manually if it's missing
          if (!data.some((cat: {value: string, label: string}) => cat && cat.value === 'beauty')) {
            data.push({ value: 'beauty', label: 'Beauty' });
          }
          
          // Sort categories alphabetically by label for better UX
          const sortedCategories = [...data].sort((a, b) => 
            a.label.localeCompare(b.label)
          );
          
          // Move "other" to the end if it exists
          const otherIndex = sortedCategories.findIndex(cat => cat.value === "other");
          if (otherIndex !== -1) {
            const other = sortedCategories.splice(otherIndex, 1)[0];
            sortedCategories.push(other);
          }
          
          setCategories(sortedCategories);
        } else {
          // Add beauty to default categories
          const updatedDefaults = [
            ...defaultCategories,
            { value: "beauty", label: "Beauty" }
          ];
          setCategories(updatedDefaults);
        }
      } catch (error) {
        // Add beauty to default categories when falling back
        const updatedDefaults = [
          ...defaultCategories,
          { value: "beauty", label: "Beauty" }
        ];
        setCategories(updatedDefaults);
        toast({
          title: "Error loading categories",
          description: "Failed to load product categories. Using defaults.",
          variant: "destructive",
        });
      }
    };
    
    loadCategories();
  }, []);

  // Open form for creating/editing
  const openForm = (product: Product | null = null) => {
    if (product) {
      // For edit mode
      const productId = product.id;
      
      if (!productId || productId.startsWith('temp-id-')) {
        toast({
          title: "Warning",
          description: "This product may not have a valid ID. Save might fail.",
          variant: "destructive",
        });
      }
      
      setEditProductId(productId);
      
      // Convert array of tags to comma-separated string
      const tagsString = Array.isArray(product.tags) ? product.tags.join(", ") : "";
      
      form.reset({
        ...product,
        tags: tagsString,
      });
    } else {
      // For create mode
      setEditProductId(null);
      form.reset(initialFormState);
    }
    setIsFormDialogOpen(true);
  };

  // Handle form submission
  const onSubmit = async (values: any) => {
    try {
      setIsSubmitting(true);
      // Convert comma-separated tags to array
      const formData = {
        ...values,
        tags: values.tags ? values.tags.split(",").map((tag: string) => tag.trim()) : []
      };

      let result: Product;
      if (editProductId) {
        // Update existing product
        result = await updateProduct(editProductId, formData);
        toast({
          title: "Product updated",
          description: "Product has been updated successfully.",
        });
        // Update local state
        setProducts(prev => prev.map(p => p.id === editProductId ? result : p));
      } else {
        // Create new product
        result = await createProduct(formData);
        toast({
          title: "Product created",
          description: "New product has been created successfully.",
        });
        // Update local state
        setProducts(prev => [...prev, result]);
      }

      setIsFormDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle product deletion
  const handleDeleteProduct = async () => {
    // Capture the ID in a local variable to ensure it doesn't change during async operations
    const productIdToDelete = deleteProductId;
    
    if (!productIdToDelete) {
      toast({
        title: "Error",
        description: "No product selected for deletion",
        variant: "destructive",
      });
      // Close the dialog since we can't proceed
      setIsDeleteDialogOpen(false);
      return;
    }

    try {
      setIsSubmitting(true);
      const success = await deleteProduct(productIdToDelete);
      
      if (success) {
        // Update local state first to give immediate UI feedback
        setProducts(prev => prev.filter(p => p.id !== productIdToDelete));
        
        toast({
          title: "Product deleted",
          description: "Product has been deleted successfully.",
        });
        
        // Close dialog and clear ID after UI is updated
        setIsDeleteDialogOpen(false);
        setDeleteProductId(null);
      } else {
        throw new Error("Delete operation did not return success");
      }
    } catch (error: any) {
      
      // Despite the error, update UI if it's just an API error but we want to remove from UI
      if (error.message?.includes("ObjectId failed") || error.message?.includes("not found")) {
        // Remove from UI anyway
        setProducts(prev => prev.filter(p => p.id !== productIdToDelete));
        setIsDeleteDialogOpen(false);
        setDeleteProductId(null);
        
        toast({
          title: "Product removed from list",
          description: "The product was removed from the list, but there may have been an error with the server.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error deleting product",
          description: error?.message || "Failed to delete product. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle featured status
  const handleToggleFeatured = async (productId: string) => {
    try {
      const isFeatured = await toggleProductFeature(productId);
      
      // Update local state
      setProducts(prev => 
        prev.map(p => p.id === productId ? { ...p, featured: isFeatured } : p)
      );
      
      toast({
        title: `Product ${isFeatured ? "featured" : "unfeatured"}`,
        description: `Product has been ${isFeatured ? "added to" : "removed from"} featured products.`,
      });
    } catch (error) {
      toast({
        title: "Error updating featured status",
        description: "Failed to update product featured status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const openDeleteDialog = (productId: string) => {
    setDeleteProductId(productId);
    setIsDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setDeleteProductId(null);
  };

  return {
    // State
    products,
    categories,
    isLoading,
    isSubmitting,
    editProductId,
    isDeleteDialogOpen,
    deleteProductId,
    isFormDialogOpen,
    
    // Form
    form,
    
    // Actions
    openForm,
    onSubmit,
    handleDeleteProduct,
    handleToggleFeatured,
    openDeleteDialog,
    closeDeleteDialog,
    setIsFormDialogOpen,
    setIsDeleteDialogOpen,
    setDeleteProductId
  };
};
