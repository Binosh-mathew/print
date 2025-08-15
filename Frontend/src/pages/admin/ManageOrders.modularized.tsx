import AdminLayout from "@/components/layouts/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useOrderManagement } from "@/hooks/orders/useOrderManagement";
import { OrderFilters } from "@/components/orders/OrderFilters";
import { OrdersTable } from "@/components/orders/OrdersTable";
import { OrderDetailsDialog } from "@/components/orders/OrderDetailsDialog";

const ManageOrders = () => {
  const {
    // State
    filteredOrders,
    selectedOrder,
    isDetailsOpen,
    isUpdating,
    isLoading,
    searchQuery,
    statusFilter,
    showAllOrders,
    sortConfig,
    selectedFileIdx,

    // Actions
    setSearchQuery,
    setStatusFilter,
    setShowAllOrders,
    setSelectedFileIdx,
    handleStatusChange,
    handleSort,
    handleOrderSelect,
    handleDialogClose,
    handlePrintOrder,
    refreshOrders,
  } = useOrderManagement();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Orders</h1>
          <p className="text-muted-foreground">
            View and manage all customer orders
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <OrderFilters
              searchQuery={searchQuery}
              statusFilter={statusFilter}
              showAllOrders={showAllOrders}
              onSearchChange={setSearchQuery}
              onStatusFilterChange={setStatusFilter}
              onToggleShowAllOrders={() => setShowAllOrders(!showAllOrders)}
              onRefresh={refreshOrders}
              isLoading={isLoading}
            />

            <OrdersTable
              orders={filteredOrders}
              sortConfig={sortConfig}
              onSort={handleSort}
              onOrderSelect={handleOrderSelect}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
      </div>

      <OrderDetailsDialog
        order={selectedOrder}
        isOpen={isDetailsOpen}
        onClose={handleDialogClose}
        selectedFileIdx={selectedFileIdx}
        onFileSelect={setSelectedFileIdx}
        onStatusChange={handleStatusChange}
        onPrint={handlePrintOrder}
        isUpdating={isUpdating}
      />
    </AdminLayout>
  );
};

export default ManageOrders;
