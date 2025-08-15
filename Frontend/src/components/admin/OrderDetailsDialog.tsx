import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, Copy, Edit, FileText, Package, Save, X } from "lucide-react";
import DocumentViewer from "@/components/DocumentViewer";
import { Order } from "@/types/order";

interface OrderDetailsDialogProps {
  selectedOrder: Order | null;
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  isEditing: boolean;
  adminRemarks: string;
  setAdminRemarks: (remarks: string) => void;
  editedStatus: string;
  setEditedStatus: (status: string) => void;
  getStatusColor: (status: string) => string;
  handleEditOrder: () => void;
  handleCancelEdit: () => void;
  handleSaveEdit: () => void;
  handleCopyOrderId: (orderId: string) => void;
}

export const OrderDetailsDialog: React.FC<OrderDetailsDialogProps> = ({
  selectedOrder,
  isDialogOpen,
  setIsDialogOpen,
  isEditing,
  adminRemarks,
  setAdminRemarks,
  editedStatus,
  setEditedStatus,
  getStatusColor,
  handleEditOrder,
  handleCancelEdit,
  handleSaveEdit,
  handleCopyOrderId,
}) => {
  const [viewerOpen, setViewerOpen] = useState(false);

  useEffect(() => {
    if (selectedOrder && isDialogOpen) {
      setAdminRemarks((selectedOrder as any).adminRemarks || '');
      setEditedStatus(selectedOrder.status);
    }
  }, [selectedOrder, isDialogOpen, setAdminRemarks, setEditedStatus]);

  if (!selectedOrder) return null;

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Order Details
            </DialogTitle>
            <DialogDescription>
              Order ID: {selectedOrder._id || selectedOrder.id}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopyOrderId(selectedOrder._id || selectedOrder.id)}
                className="ml-2"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <Label className="text-sm font-medium">Name</Label>
                  <p className="text-sm">{selectedOrder.customerName || selectedOrder.userName || 'Unknown User'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Order Date</Label>
                  <p className="text-sm">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Store</Label>
                  <p className="text-sm">{selectedOrder.storeName || selectedOrder.storeId}</p>
                </div>
              </CardContent>
            </Card>

            {/* Order Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Order Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-medium">Current Status:</Label>
                  <Badge className={getStatusColor(selectedOrder.status)}>
                    {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                  </Badge>
                </div>
                {isEditing && (
                  <div>
                    <Label htmlFor="status" className="text-sm font-medium">Update Status</Label>
                    <Select value={editedStatus} onValueChange={setEditedStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="ready">Ready</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Document Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Document Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium">Document Name</Label>
                  <p className="text-sm">{selectedOrder.documentName || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Copies</Label>
                  <p className="text-sm">{selectedOrder.copies || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Color Type</Label>
                  <p className="text-sm">{selectedOrder.colorType === "color" ? "Color" : "Black & White"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Double Sided</Label>
                  <p className="text-sm">{selectedOrder.doubleSided ? "Yes" : "No"}</p>
                </div>
              </div>

              {/* File Details */}
              {selectedOrder.files && selectedOrder.files.length > 0 && (
                <div className="mt-4">
                  <Label className="text-sm font-medium">Files</Label>
                  <div className="mt-2 space-y-2">
                    {selectedOrder.files.map((file: any, index: number) => (
                      <div key={index} className="border rounded-lg p-3 bg-gray-50">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-sm">{file.originalName || `File ${index + 1}`}</h4>
                            <div className="text-xs text-gray-500 mt-1">
                              <span>Copies: {file.copies || 1}</span>
                              <span className="ml-3">Print Type: {file.printType || 'blackAndWhite'}</span>
                              <span className="ml-3">Paper: {file.specialPaper || 'normal'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pricing Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Pricing Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Total Amount</Label>
                <p className="text-xl font-bold text-green-600">
                  ₹{selectedOrder.totalPrice || 0}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Admin Remarks */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Admin Remarks</CardTitle>
              <CardDescription>Internal notes and comments</CardDescription>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Textarea
                  value={adminRemarks}
                  onChange={(e) => setAdminRemarks(e.target.value)}
                  placeholder="Add admin remarks..."
                  className="min-h-[100px]"
                />
              ) : (
                <p className="text-sm whitespace-pre-wrap">
                  {(selectedOrder as any).adminRemarks || 'No remarks added yet.'}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Order Details */}
          {selectedOrder.details && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Additional Details</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{selectedOrder.details}</p>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={handleCancelEdit}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </>
            ) : (
              <Button onClick={handleEditOrder}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Order
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <DocumentViewer
        orderId={selectedOrder._id || selectedOrder.id}
        documentName={selectedOrder.documentName}
      />
    </>
  );
};
