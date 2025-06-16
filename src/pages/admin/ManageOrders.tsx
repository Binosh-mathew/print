import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import AdminLayout from "@/components/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ArrowDown,
  ArrowUp,
  FileText,
  Filter,
  Printer,
  Search,
} from "lucide-react";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import DocumentViewer from "@/components/DocumentViewer";
import { toast } from "@/components/ui/use-toast";
import { hasStatus } from "@/utils/orderUtils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fetchOrders, updateOrder } from "@/api";
import type { Order } from "@/types/order";

const ManageOrders = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const orderId = queryParams.get("id");

  const [orders, setOrders] = useState<any[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "descending",
  });

  const [statusChangeCompleted, setStatusChangeCompleted] = useState(false);
  const [selectedFileIdx, setSelectedFileIdx] = useState(0);

  const refreshOrders = async () => {
    try {
      setIsUpdating(true);
      const response = await fetchOrders();
      // Process the orders to ensure customer names are properly set
      const processedOrders = response.map((order: any) => {
        // Ensure customerName is set, falling back to userName if needed
        if (!order.customerName && order.userName) {
          order.customerName = order.userName;
        }
        // If neither customerName nor userName is available, set a default
        if (!order.customerName && !order.userName) {
          order.customerName = "Unknown User";
        }
        return order;
      });

      setOrders(processedOrders);

      const sortedOrders = [...processedOrders].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setFilteredOrders(sortedOrders);
      setIsUpdating(false);

      if (orderId) {
        const order = sortedOrders.find(
          (o) => o.id === orderId || o._id === orderId
        );
        if (order) {
          setSelectedOrder(order);
          setIsDetailsOpen(true);
          setSelectedFileIdx(0);
        }
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast({
        title: "Error loading orders",
        description: "There was a problem fetching the orders.",
        variant: "destructive",
      });
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    // Initial fetch when component mounts
    refreshOrders();
  }, [orderId]);

  useEffect(() => {
    let result = [...orders];

    if (statusFilter !== "all") {
      const filterValue = statusFilter.toLowerCase();
      result = result.filter((order) => {
        // Handle case where order.status might be undefined
        if (!order.status) return false;

        // Normalize the status for comparison
        const orderStatus = order?.status.toLowerCase();
        return orderStatus === filterValue;
      });
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      console.log("Searching for:", query);

      result = result.filter((order) => {
        // Check if the order ID contains the query
        if (order.id && order.id.toLowerCase().includes(query)) {
          console.log("Match by ID:", order.id);
          return true;
        }

        // Check if the customer name contains the query (prioritize customerName over userName)
        if (
          order.customerName &&
          order.customerName.toLowerCase().includes(query)
        ) {
          console.log("Match by customerName:", order.customerName);
          return true;
        }

        if (order.userName && order.userName.toLowerCase().includes(query)) {
          console.log("Match by userName:", order.userName);
          return true;
        }

        // Check if the document name contains the query
        if (
          order.documentName &&
          order.documentName.toLowerCase().includes(query)
        ) {
          console.log("Match by documentName:", order.documentName);
          return true;
        }

        return false;
      });

      console.log("Search results count:", result.length);
    }

    result.sort((a, b) => {
      if (sortConfig.key === "createdAt" || sortConfig.key === "updatedAt") {
        return sortConfig.direction === "ascending"
          ? new Date(a[sortConfig.key]).getTime() -
              new Date(b[sortConfig.key]).getTime()
          : new Date(b[sortConfig.key]).getTime() -
              new Date(a[sortConfig.key]).getTime();
      }

      if (typeof a[sortConfig.key] === "string") {
        return sortConfig.direction === "ascending"
          ? (a[sortConfig.key] as string).localeCompare(
              b[sortConfig.key] as string
            )
          : (b[sortConfig.key] as string).localeCompare(
              a[sortConfig.key] as string
            );
      }

      return sortConfig.direction === "ascending"
        ? (a[sortConfig.key] as number) - (b[sortConfig.key] as number)
        : (b[sortConfig.key] as number) - (a[sortConfig.key] as number);
    });

    setFilteredOrders(result);
  }, [orders, statusFilter, searchQuery, sortConfig]);

  const handleSort = (key: keyof Order) => {
    setSortConfig({
      key,
      direction:
        sortConfig.key === key && sortConfig.direction === "ascending"
          ? "descending"
          : "ascending",
    });
  };

  const getPaperAndBindingInfo = (order: Order) => {
    if (!order.files || order.files.length === 0)
      return { paper: "Normal A4", binding: "None" };

    const specialPapers = order.files
      .filter((file) => file.specialPaper !== "none")
      .map((file) => file.specialPaper);

    const bindingTypes = order.files
      .filter((file) => file.binding.needed && file.binding.type !== "none")
      .map((file) => file.binding.type);

    return {
      paper: specialPapers.length > 0 ? specialPapers.join(", ") : "Normal A4",
      binding:
        bindingTypes.length > 0
          ? bindingTypes.map((type) => type.replace("Binding", "")).join(", ")
          : "None",
    };
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    if (isUpdating || !orderId) {
      console.error("Invalid order ID or update in progress");
      return;
    }

    setIsUpdating(true);

    try {
      // Validate the status is one of the allowed values
      const validStatuses = [
        "Pending",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled",
        "Completed",
      ];
      const normalizedStatus = validStatuses.includes(newStatus)
        ? (newStatus as
            | "Pending"
            | "Processing"
            | "Shipped"
            | "Delivered"
            | "Cancelled"
            | "Completed")
        : "Pending";

      console.log(`Updating order ${orderId} status to:`, normalizedStatus);

      const updateData = { status: normalizedStatus };
      console.log("Sending update data:", { orderId, updateData });

      const updatedOrder = await updateOrder(orderId, updateData);

      if (!updatedOrder) {
        throw new Error("No response from server after update");
      }

      console.log("Server response:", updatedOrder);

      const updatedOrders = orders.map((order) => {
        // Use _id instead of id for MongoDB
        if (order._id === orderId || order.id === orderId) {
          return { ...order, status: normalizedStatus };
        }
        return order;
      });

      setOrders(updatedOrders);

      if (
        selectedOrder &&
        (selectedOrder._id === orderId || selectedOrder.id === orderId)
      ) {
        setSelectedOrder({ ...selectedOrder, status: normalizedStatus });
      }

      toast({
        title: "Order updated",
        description: `Order #${orderId} status changed to ${normalizedStatus}.`,
      });

      setStatusChangeCompleted(true);

      // Don't close the dialog automatically
      // setIsDetailsOpen(false);
    } catch (error: any) {
      console.error("Error updating order status:", error);
      toast({
        title: "Update failed",
        description:
          error.response?.data?.message ||
          "There was a problem updating the order status.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleOrderClick = (order: Order) => {
    setStatusChangeCompleted(false);
    setSelectedOrder(order);
    setIsDetailsOpen(true);
    setSelectedFileIdx(0);
  };

  const isStatus = (
    orderStatus: string | undefined,
    checkStatus: string
  ): boolean => {
    return hasStatus({ status: orderStatus } as Order, checkStatus);
  };

  const handleDialogOpenChange = (open: boolean) => {
    if (!open && !isUpdating) {
      setIsDetailsOpen(false);
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
            <p className="text-gray-600 mt-1">
              View and manage all print orders
            </p>
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
            <Select value={statusFilter} onValueChange={setStatusFilter}>
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
            {/* Refresh and auto-refresh buttons removed */}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">
              All Orders ({filteredOrders.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSort("id")}
                    >
                      <div className="flex items-center">
                        Order ID
                        {sortConfig.key === "id" &&
                          (sortConfig.direction === "ascending" ? (
                            <ArrowUp className="ml-1 h-4 w-4" />
                          ) : (
                            <ArrowDown className="ml-1 h-4 w-4" />
                          ))}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSort("customerName")}
                    >
                      <div className="flex items-center">
                        Customer
                        {sortConfig.key === "customerName" &&
                          (sortConfig.direction === "ascending" ? (
                            <ArrowUp className="ml-1 h-4 w-4" />
                          ) : (
                            <ArrowDown className="ml-1 h-4 w-4" />
                          ))}
                      </div>
                    </TableHead>
                    <TableHead>Document</TableHead>
                    <TableHead>Paper Type</TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSort("createdAt")}
                    >
                      <div className="flex items-center">
                        Date
                        {sortConfig.key === "createdAt" &&
                          (sortConfig.direction === "ascending" ? (
                            <ArrowUp className="ml-1 h-4 w-4" />
                          ) : (
                            <ArrowDown className="ml-1 h-4 w-4" />
                          ))}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSort("totalPrice")}
                    >
                      <div className="flex items-center">
                        Amount
                        {sortConfig.key === "totalPrice" &&
                          (sortConfig.direction === "ascending" ? (
                            <ArrowUp className="ml-1 h-4 w-4" />
                          ) : (
                            <ArrowDown className="ml-1 h-4 w-4" />
                          ))}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSort("status")}
                    >
                      <div className="flex items-center">
                        Status
                        {sortConfig.key === "status" &&
                          (sortConfig.direction === "ascending" ? (
                            <ArrowUp className="ml-1 h-4 w-4" />
                          ) : (
                            <ArrowDown className="ml-1 h-4 w-4" />
                          ))}
                      </div>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((order, index) => {
                      const { paper } = getPaperAndBindingInfo(order);
                      const uniqueKey = order.id || `order-${index}`; // Fallback to index if id is missing
                      return (
                        <TableRow key={uniqueKey}>
                          <TableCell
                            className="font-medium"
                            key={`${uniqueKey}-id`}
                          >
                            #{order.id}
                          </TableCell>
                          <TableCell key={`${uniqueKey}-user`}>
                            {order.customerName ||
                              order.userName ||
                              "Unknown User"}
                          </TableCell>
                          <TableCell
                            className="truncate max-w-[200px]"
                            key={`${uniqueKey}-doc`}
                          >
                            {order.documentName}
                          </TableCell>
                          <TableCell key={`${uniqueKey}-paper`}>
                            {paper}
                          </TableCell>
                          <TableCell
                            className="text-gray-600"
                            key={`${uniqueKey}-date`}
                          >
                            {new Date(order.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell
                            className="font-medium"
                            key={`${uniqueKey}-price`}
                          >
                            ₹{order.totalPrice}
                          </TableCell>
                          <TableCell key={`${uniqueKey}-status`}>
                            <OrderStatusBadge status={order.status} />
                          </TableCell>
                          <TableCell
                            className="text-right"
                            key={`${uniqueKey}-actions`}
                          >
                            <div
                              className="flex items-center justify-end gap-2"
                              key={`${uniqueKey}-actions-container`}
                            >
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8"
                                onClick={() => handleOrderClick(order)}
                                key={`${uniqueKey}-view`}
                              >
                                View
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
                          <p className="text-sm text-gray-400 mt-1">
                            Try a different search term
                          </p>
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
       <DialogContent className="sm:max-w-3xl mt-6 sm:mt-12 max-h-screen overflow-y-auto">
          {selectedOrder && (
            <>
              <div className="print-only" style={{ display: "none" }}>
                <style type="text/css" media="print">
                  {`
                    @page { size: auto; margin: 10mm; }
                    body { margin: 0; padding: 0; }
                    .dialog-content-print, .dialog-content-print * { visibility: visible; }
                    .dialog-content-print { position: absolute; left: 0; top: 0; width: 100%; }
                    .no-print { display: none !important; }
                    .print-only { display: block !important; }
                  `}
                </style>
              </div>
              <DialogHeader className="order-header">
                <DialogTitle className="flex items-center justify-between">
                  <span>Order #{selectedOrder.id}</span>
                  <OrderStatusBadge status={selectedOrder.status} />
                </DialogTitle>
                <DialogDescription>
                  Placed on{" "}
                  {new Date(selectedOrder.createdAt).toLocaleDateString()} by{" "}
                  {selectedOrder.customerName ||
                    selectedOrder.userName ||
                    "Unknown User"}
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 order-section dialog-content-print">
                <div>
                  <h4 className="text-sm font-medium mb-2 print-heading">
                    Document Details
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm">
                      <FileText className="h-4 w-4 mr-2 text-gray-500 no-print" />
                      <span className="truncate print-text">
                        {selectedOrder.documentName}
                      </span>
                    </div>
                    <div
                      className="flex items-start gap-x-6 text-sm print-grid"
                      style={{ display: "flex" }}
                    >
                      <div className="print-item">
                        <p className="text-gray-500 print-label">Copies</p>
                        <p className="font-medium print-value">
                          {selectedOrder.copies}
                        </p>
                      </div>
                      <div className="print-item">
                        <p className="text-gray-500 print-label">Print Type</p>
                        <p className="font-medium print-value">
                          {selectedOrder.colorType === "color"
                            ? "Color"
                            : "Black & White"}
                        </p>
                      </div>
                      <div className="print-item">
                        <p className="text-gray-500 print-label">
                          Double-sided
                        </p>
                        <p className="font-medium print-value">
                          {selectedOrder.doubleSided ? "Yes" : "No"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2 print-heading">
                    Payment Details
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm print-row">
                      <span className="text-gray-500 print-label">
                        Total Amount
                      </span>
                      <span className="font-bold print-value">
                        ₹{selectedOrder.totalPrice}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm print-row">
                      <span className="text-gray-500 print-label">
                        Payment Status
                      </span>
                      <span className="font-medium text-green-600 print-value">
                        Paid
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedOrder.files && selectedOrder.files.length > 0 && (
                <div className="border-t border-gray-200 pt-4 pb-4 order-section dialog-content-print">
                  <h4 className="text-sm font-medium mb-2 print-heading">
                    File Details
                  </h4>
                  <div
                    className="space-y-3 max-h-40 overflow-y-auto pr-2 print-files"
                    style={{ maxHeight: "none" }}
                  >
                    {selectedOrder.files.map((file: any, index: number) => {
                      // Skip if file data is invalid
                      if (!file) return null;

                      const fileName = file.originalName || "Unknown file";
                      const copies = file.copies || 1;
                      const printType = file.printType || "blackAndWhite";
                      const specialPaper = file.specialPaper || "none";
                      const binding = file.binding || { needed: false };

                      return (
                        <div
                          key={index}
                          className="bg-gray-50 p-3 rounded-md print-file-item"
                          style={{
                            border: "1px solid #ddd",
                            marginBottom: "10px",
                          }}
                        >
                          <p className="font-medium text-sm mb-1 print-filename">
                            {fileName}
                          </p>
                          <div className="grid grid-cols-2 text-xs text-gray-600 print-file-details">
                            <div className="print-detail">Copies: {copies}</div>
                            <div className="print-detail">
                              Print:{" "}
                              {printType === "blackAndWhite" ? "B&W" : "Color"}
                            </div>
                            <div className="print-detail">
                              Paper:{" "}
                              {specialPaper === "none"
                                ? "Normal A4"
                                : specialPaper}
                            </div>
                            <div className="print-detail">
                              Binding:{" "}
                              {binding?.needed
                                ? (binding.type || "").replace("Binding", "")
                                : "None"}
                            </div>
                            {file.specificRequirements && (
                              <div className="col-span-2 mt-2 print-requirements">
                                <span className="font-medium">
                                  Requirements:
                                </span>{" "}
                                {file.specificRequirements}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {selectedOrder.details && (
                <div className="border-t border-gray-200 pt-4 pb-4">
                  <h4 className="text-sm font-medium mb-2">
                    Additional Details
                  </h4>
                  <p className="text-sm text-gray-700">
                    {selectedOrder.details}
                  </p>
                </div>
              )}

              <div className="border-t border-gray-200 pt-4 no-print">
                <h4 className="text-sm font-medium mb-3">
                  Update Order Status
                </h4>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={
                      isStatus(selectedOrder.status, "Pending")
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    disabled={
                      isUpdating || isStatus(selectedOrder.status, "Pending")
                    }
                    onClick={() =>
                      handleStatusChange(
                        selectedOrder._id || selectedOrder.id,
                        "Pending"
                      )
                    }
                    className={
                      isStatus(selectedOrder.status, "Pending")
                        ? "bg-yellow-500 hover:bg-yellow-600"
                        : ""
                    }
                  >
                    Pending
                  </Button>
                  <Button
                    variant={
                      isStatus(selectedOrder.status, "Processing")
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    disabled={
                      isUpdating || isStatus(selectedOrder.status, "Processing")
                    }
                    onClick={() =>
                      handleStatusChange(
                        selectedOrder._id || selectedOrder.id,
                        "Processing"
                      )
                    }
                    className={
                      isStatus(selectedOrder.status, "Processing")
                        ? "bg-blue-500 hover:bg-blue-600"
                        : ""
                    }
                  >
                    Processing
                  </Button>
                  <Button
                    variant={
                      isStatus(selectedOrder.status, "Completed")
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    disabled={
                      isUpdating || isStatus(selectedOrder.status, "Completed")
                    }
                    onClick={() =>
                      handleStatusChange(
                        selectedOrder._id || selectedOrder.id,
                        "Completed"
                      )
                    }
                    className={
                      isStatus(selectedOrder.status, "Completed")
                        ? "bg-green-500 hover:bg-green-600"
                        : ""
                    }
                  >
                    Completed
                  </Button>
                  <Button
                    variant={
                      isStatus(selectedOrder.status, "Cancelled")
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    disabled={
                      isUpdating || isStatus(selectedOrder.status, "Cancelled")
                    }
                    onClick={() =>
                      handleStatusChange(
                        selectedOrder._id || selectedOrder.id,
                        "Cancelled"
                      )
                    }
                    className={
                      isStatus(selectedOrder.status, "Cancelled")
                        ? "bg-red-500 hover:bg-red-600"
                        : ""
                    }
                  >
                    Cancelled
                  </Button>
                </div>
              </div>

              <div
                className="print-only order-status-section"
                style={{
                  display: "none",
                  marginTop: "20px",
                  borderTop: "1px solid #ddd",
                  paddingTop: "15px",
                }}
              >
                <h4 className="text-sm font-medium mb-2">
                  Current Status:{" "}
                  <span className="font-bold">{selectedOrder.status}</span>
                </h4>
              </div>

              {/* Document Viewer Section */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                <h4 className="text-sm font-medium mb-3">
                  Document Preview & Actions
                </h4>
                <div className="flex gap-4">
                  {selectedOrder.files.length > 1 && (
                    <div className="w-40 border-r pr-2 space-y-2 overflow-y-auto max-h-[520px]">
                      {selectedOrder.files.map((file: any, idx: number) => (
                        <Button
                          key={idx}
                          variant={idx === selectedFileIdx ? "default" : "outline"}
                          size="sm"
                          className="w-full text-xs truncate"
                          onClick={() => setSelectedFileIdx(idx)}
                        >
                          {file.originalName}
                        </Button>
                      ))}
                    </div>
                  )}
                  <div className="flex-1">
                    <DocumentViewer
                      documentName={selectedOrder.files[selectedFileIdx].originalName}
                      orderId={selectedOrder._id}
                      fileIndex={selectedFileIdx}
                      fallbackMessage="The document file is not available for preview or printing. Please contact the customer for the original file."
                      onDocumentLoaded={(url) => {
                        console.log("Document loaded:", url);
                      }}
                    />
                  </div>
                </div>
              </div>

              <DialogFooter className="flex flex-wrap gap-2 justify-end mt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    // Create a dedicated print stylesheet for this specific order
                    const style = document.createElement("style");
                    style.type = "text/css";
                    style.id = "temp-print-style";
                    style.media = "print";
                    style.innerHTML = `
                      @page { size: auto; margin: 15mm; }
                      body * { visibility: hidden; }
                      .dialog-content-print, .dialog-content-print * { visibility: visible; }
                      .dialog-content-print { position: absolute; left: 0; top: 0; width: 100%; }
                      .no-print { display: none !important; }
                      .print-only { display: block !important; }
                    `;
                    document.head.appendChild(style);

                    // Trigger print dialog
                    window.print();

                    // Remove the temporary style after printing
                    setTimeout(() => {
                      const tempStyle =
                        document.getElementById("temp-print-style");
                      if (tempStyle) tempStyle.remove();
                    }, 2000);

                    toast({
                      title: "Print dialog opened",
                      description: `Printing order #${selectedOrder.id} details.`,
                    });
                  }}
                  disabled={isUpdating}
                  className="bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-300"
                >
                  <Printer className="mr-2 h-4 w-4" />
                  Print Order
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
