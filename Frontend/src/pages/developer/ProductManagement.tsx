import { useState, useEffect } from "react";
import DeveloperLayout from "@/components/layouts/DeveloperLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import { PlusCircle, Pencil, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
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

const ProductManagement = () => {
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

  return (
    <DeveloperLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Manage Products</h1>
            <p className="text-gray-500 mt-1">
              Create and manage affiliate products for the Offers & Shops page
            </p>
          </div>
          <Button 
            onClick={() => openForm()} 
            className="bg-primary hover:bg-primary-600"
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Product
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Product List</CardTitle>
            <CardDescription>
              Manage all products available in the Offers & Shops section
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-10">
                <div className="animate-spin h-10 w-10 border-t-2 border-b-2 border-primary rounded-full"></div>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500 mb-4">No products found</p>
                <Button 
                  onClick={() => openForm()} 
                  variant="outline"
                >
                  Add your first product
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Featured</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products && products.map((product, index) => {
                      // Product ID should now be available directly from the API mapping
                      return (
                        <TableRow key={`product-${product.id}-${index}`}>
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="h-10 w-10 mr-3 rounded object-cover"
                                onError={(e) => {
                                  // Set a fallback image if the product image fails to load
                                  (e.target as HTMLImageElement).src = "/placeholder.svg";
                                }}
                              />
                              <div>
                                <p className="font-medium">{product.name}</p>
                                <p className="text-xs text-gray-500 truncate max-w-xs">
                                  {product.description}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {product.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className={product.discountPrice ? "line-through text-xs text-gray-500" : ""}>
                              {product.price}
                            </span>
                            {product.discountPrice && (
                              <span className="text-primary font-medium">{product.discountPrice}</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={product.featured}
                            onCheckedChange={() => handleToggleFeatured(product.id)}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openForm(product)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setDeleteProductId(product.id);
                                setIsDeleteDialogOpen(true);
                              }}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )})}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Product Form Dialog */}
      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editProductId ? "Edit Product" : "Add New Product"}
            </DialogTitle>
            <DialogDescription>
              {editProductId 
                ? "Update the product details below" 
                : "Fill in the details for the new product"}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                rules={{ required: "Product name is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter product name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                rules={{ required: "Product description is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter product description"
                        className="min-h-[100px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  rules={{ required: "Price is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input placeholder="₹0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="discountPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount Price (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="₹0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="image"
                rules={{ required: "Image URL is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/image.jpg" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter a valid URL for the product image
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  rules={{ required: "Category is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent 
                          position="popper" 
                          side="bottom" 
                          align="start" 
                          sideOffset={4}
                          className="max-h-[200px] overflow-y-auto"
                        >
                          {categories.map((category) => (
                            <SelectItem
                              key={`category-${category.value}`}
                              value={category.value}
                              className="capitalize"
                            >
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags</FormLabel>
                      <FormControl>
                        <Input placeholder="tag1, tag2, tag3" {...field} />
                      </FormControl>
                      <FormDescription>
                        Comma-separated list of tags
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="affiliateUrl"
                rules={{ required: "Affiliate URL is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Affiliate URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/product" {...field} />
                    </FormControl>
                    <FormDescription>
                      Link where users will go when clicking on the product
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="featured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Featured Product
                      </FormLabel>
                      <FormDescription>
                        Featured products will appear in the top section of the Offers & Shops page.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsFormDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-primary hover:bg-primary-600"
                  disabled={isSubmitting}
                >
                  {isSubmitting && (
                    <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></div>
                  )}
                  {editProductId ? "Update Product" : "Create Product"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={isDeleteDialogOpen} 
        onOpenChange={(open) => {
          // If dialog is closing, also reset the delete product ID
          if (!open) {
            setDeleteProductId(null);
          }
          setIsDeleteDialogOpen(open);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this product? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setDeleteProductId(null);
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                handleDeleteProduct();
              }}
              disabled={isSubmitting}
              className="z-50 ml-2"
            >
              {isSubmitting ? (
                <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></div>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DeveloperLayout>
  );
};

export default ProductManagement;
