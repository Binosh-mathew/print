import DeveloperLayout from "@/components/layouts/DeveloperLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import { useProductManagement } from "@/hooks/developer/useProductManagement";
import { ProductsTable } from "@/components/developer/ProductsTable";
import { ProductFormDialog } from "@/components/developer/ProductFormDialog";
import { DeleteConfirmDialog } from "@/components/developer/DeleteConfirmDialog";

const ProductManagement = () => {
  const {
    products,
    categories,
    isLoading,
    isSubmitting,
    editProductId,
    isDeleteDialogOpen,
    isFormDialogOpen,
    form,
    openForm,
    onSubmit,
    handleDeleteProduct,
    handleToggleFeatured,
    openDeleteDialog,
    closeDeleteDialog,
    setIsFormDialogOpen
  } = useProductManagement();

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
              <ProductsTable
                products={products}
                onEdit={openForm}
                onDelete={openDeleteDialog}
                onToggleFeatured={handleToggleFeatured}
              />
            )}
          </CardContent>
        </Card>
      </div>

      <ProductFormDialog
        isOpen={isFormDialogOpen}
        onOpenChange={setIsFormDialogOpen}
        isEditing={!!editProductId}
        isSubmitting={isSubmitting}
        form={form}
        categories={categories}
        onSubmit={onSubmit}
      />

      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={closeDeleteDialog}
        onConfirm={handleDeleteProduct}
        isDeleting={isSubmitting}
      />
    </DeveloperLayout>
  );
};

export default ProductManagement;
