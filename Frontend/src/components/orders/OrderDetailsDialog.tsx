import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Printer } from "lucide-react";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import DocumentViewer from "@/components/DocumentViewer";
import { parseColorPages } from "@/utils/printUtils";

interface OrderDetailsDialogProps {
  order: any | null;
  isOpen: boolean;
  onClose: () => void;
  selectedFileIdx: number;
  onFileSelect: (index: number) => void;
  onStatusChange: (orderId: string, status: string) => void;
  onPrint: () => void;
  isUpdating: boolean;
}

export const OrderDetailsDialog = ({
  order,
  isOpen,
  onClose,
  selectedFileIdx,
  onFileSelect,
  onStatusChange,
  onPrint,
  isUpdating,
}: OrderDetailsDialogProps) => {
  if (!order) return null;

  const isStatus = (orderStatus: string, targetStatus: string) => {
    if (!orderStatus) return false;
    return orderStatus.toLowerCase().replace(/\s+/g, "") === 
           targetStatus.toLowerCase().replace(/\s+/g, "");
  };

  const calculateTotalPages = () => {
    if (!order.files || order.files.length === 0) return 0;

    return order.files.reduce((total: number, file: any) => {
      const blackPages = parseInt(file.blackPages) || 0;
      const colorInfo = parseColorPages(file.colorPages);
      const colorPages = Array.isArray(colorInfo) 
        ? colorInfo.reduce((sum, page) => sum + page, 0)
        : colorInfo || 0;
      return total + blackPages + colorPages;
    }, 0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl w-[95vw] h-[90vh] flex flex-col dialog-content-print">
        {isUpdating && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Updating order...</p>
            </div>
          </div>
        )}

        <DialogHeader className="flex-shrink-0 pb-4 border-b border-gray-200">
          <DialogTitle className="text-xl font-bold">
            Order Details - #{order.id}
          </DialogTitle>
          <DialogDescription>
            Manage and view order information
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-6">
          {/* Order Information */}
          <Card className="border shadow-sm">
            <CardHeader className="py-4 px-5">
              <CardTitle className="text-sm font-semibold">
                Order Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-5 pb-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500">
                    Customer Name
                  </label>
                  <p className="text-sm font-medium mt-1">
                    {order.customerName}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">
                    Phone Number
                  </label>
                  <p className="text-sm mt-1">{order.phoneNumber}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">
                    Total Price
                  </label>
                  <p className="text-sm font-medium mt-1">₹{order.totalPrice}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">
                    Total Pages
                  </label>
                  <p className="text-sm mt-1">{calculateTotalPages()}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">
                    Order Date
                  </label>
                  <p className="text-sm mt-1">
                    {new Date(order.createdAt).toLocaleString("en-IN")}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">
                    Current Status
                  </label>
                  <div className="mt-1">
                    <OrderStatusBadge status={order.status} />
                  </div>
                </div>
              </div>
              {order.orderDetails && (
                <div>
                  <label className="text-xs font-medium text-gray-500">
                    Special Instructions
                  </label>
                  <p className="text-sm mt-1 bg-gray-50 p-3 rounded border">
                    {order.orderDetails}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Files Summary */}
          <Card className="border shadow-sm">
            <CardHeader className="py-4 px-5">
              <CardTitle className="text-sm font-semibold">
                Files Summary ({order.files?.length || 0} files)
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="grid gap-3">
                {order.files?.map((file: any, index: number) => {
                  const blackPages = parseInt(file.blackPages) || 0;
                  const colorInfo = parseColorPages(file.colorPages);
                  const colorPages = Array.isArray(colorInfo) 
                    ? colorInfo.reduce((sum, page) => sum + page, 0)
                    : colorInfo || 0;

                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded border hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium truncate">
                          {file.originalName}
                        </p>
                        <p className="text-xs text-gray-500">
                          B&W: {blackPages} pages, Color: {colorPages} pages
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          Total: {blackPages + colorPages} pages
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Status Management */}
          <Card className="border shadow-sm no-print">
            <CardHeader className="py-4 px-5">
              <CardTitle className="text-sm font-semibold">
                Status Management
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={
                    isStatus(order.status, "Pending") ? "default" : "outline"
                  }
                  size="sm"
                  disabled={isUpdating || isStatus(order.status, "Pending")}
                  onClick={() =>
                    onStatusChange(order._id || order.id, "Pending")
                  }
                  className={
                    isStatus(order.status, "Pending")
                      ? "bg-yellow-500 hover:bg-yellow-600"
                      : ""
                  }
                >
                  Pending
                </Button>
                <Button
                  variant={
                    isStatus(order.status, "Processing") ? "default" : "outline"
                  }
                  size="sm"
                  disabled={isUpdating || isStatus(order.status, "Processing")}
                  onClick={() =>
                    onStatusChange(order._id || order.id, "Processing")
                  }
                  className={
                    isStatus(order.status, "Processing")
                      ? "bg-blue-500 hover:bg-blue-600"
                      : ""
                  }
                >
                  Processing
                </Button>
                <Button
                  variant={
                    isStatus(order.status, "Completed") ? "default" : "outline"
                  }
                  size="sm"
                  disabled={isUpdating || isStatus(order.status, "Completed")}
                  onClick={() =>
                    onStatusChange(order._id || order.id, "Completed")
                  }
                  className={
                    isStatus(order.status, "Completed")
                      ? "bg-green-500 hover:bg-green-600"
                      : ""
                  }
                >
                  Completed
                </Button>
                <Button
                  variant={
                    isStatus(order.status, "Cancelled") ? "default" : "outline"
                  }
                  size="sm"
                  disabled={isUpdating || isStatus(order.status, "Cancelled")}
                  onClick={() =>
                    onStatusChange(order._id || order.id, "Cancelled")
                  }
                  className={
                    isStatus(order.status, "Cancelled")
                      ? "bg-red-500 hover:bg-red-600"
                      : ""
                  }
                >
                  Cancelled
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Print-only Status Section */}
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
              Current Status: <span className="font-bold">{order.status}</span>
            </h4>
          </div>

          {/* Document Viewer Section */}
          <Card className="border shadow-sm mb-6">
            <CardHeader className="py-4 px-5">
              <CardTitle className="text-sm font-semibold">
                Document Preview & Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-hidden">
              <div className="flex flex-col md:flex-row">
                {order.files.length > 1 && (
                  <div className="w-full md:w-48 border-b md:border-b-0 md:border-r border-gray-200 p-3 md:p-4 space-y-2 overflow-y-auto max-h-[200px] md:max-h-[420px]">
                    {order.files.map((file: any, idx: number) => (
                      <Button
                        key={idx}
                        variant={idx === selectedFileIdx ? "default" : "outline"}
                        size="sm"
                        className="w-full text-xs truncate"
                        onClick={() => onFileSelect(idx)}
                      >
                        {file.originalName}
                      </Button>
                    ))}
                  </div>
                )}
                <div className="flex-1 h-[420px]">
                  <DocumentViewer
                    documentName={order.files[selectedFileIdx].originalName}
                    orderId={order._id}
                    fileIndex={selectedFileIdx}
                    fallbackMessage="The document file is not available for preview or printing. Please contact the customer for the original file."
                    onDocumentLoaded={() => {}}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer Actions - Fixed */}
        <DialogFooter className="flex justify-between mt-auto pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={onPrint}
            disabled={isUpdating}
            className="bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-300"
          >
            <Printer className="mr-2 h-4 w-4" />
            Print Order
          </Button>
          <Button onClick={onClose} disabled={isUpdating}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
