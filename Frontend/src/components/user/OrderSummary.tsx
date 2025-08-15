import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calculator, FileText, Loader2, ShoppingCart } from 'lucide-react';
import { FileDetails } from '@/types/order';

interface OrderSummaryProps {
  files: FileDetails[];
  totalPrice: number;
  isSubmitting: boolean;
  selectedStorePricing: any;
  onSubmit: () => void;
  canSubmit: boolean;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({
  files,
  totalPrice,
  isSubmitting,
  selectedStorePricing,
  onSubmit,
  canSubmit,
}) => {
  const getTotalPages = () => {
    return files.reduce((total, file) => {
      const pageCount = file.pageCount || 1;
      return total + (pageCount * file.copies);
    }, 0);
  };

  const getTotalCopies = () => {
    return files.reduce((total, file) => total + file.copies, 0);
  };

  const getColorPages = () => {
    return files.filter(file => 
      file.printType === 'color' || file.printType === 'mixed'
    ).reduce((total, file) => {
      if (file.printType === 'color') {
        const pageCount = file.pageCount || 1;
        return total + (pageCount * file.copies);
      }
      // For mixed, count only specified color pages
      // This is a simplified calculation
      return total;
    }, 0);
  };

  const getBindingCount = () => {
    return files.filter(file => file.binding.needed).length;
  };

  const getSpecialPaperCount = () => {
    return files.filter(file => file.specialPaper !== 'none').length;
  };

  if (files.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Order Summary
          </CardTitle>
          <CardDescription>
            Upload files to see pricing breakdown
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No files uploaded yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          Order Summary
        </CardTitle>
        <CardDescription>
          Review your order details and pricing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File Count */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Files:</span>
          <Badge variant="outline">{files.length}</Badge>
        </div>

        {/* Total Pages */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Total Pages:</span>
          <span className="text-sm">{getTotalPages()}</span>
        </div>

        {/* Total Copies */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Total Copies:</span>
          <span className="text-sm">{getTotalCopies()}</span>
        </div>

        {/* Color Pages */}
        {getColorPages() > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Color Pages:</span>
            <span className="text-sm">{getColorPages()}</span>
          </div>
        )}

        {/* Binding */}
        {getBindingCount() > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Binding:</span>
            <span className="text-sm">{getBindingCount()} files</span>
          </div>
        )}

        {/* Special Paper */}
        {getSpecialPaperCount() > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Special Paper:</span>
            <span className="text-sm">{getSpecialPaperCount()} files</span>
          </div>
        )}

        <hr className="my-4" />

        {/* Pricing Breakdown */}
        {selectedStorePricing && totalPrice > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Pricing Breakdown</h4>
            <div className="space-y-1 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Base Rate:</span>
                <span>₹{selectedStorePricing.baseRate || 0}/page</span>
              </div>
              {selectedStorePricing.colorRate && (
                <div className="flex justify-between">
                  <span>Color Rate:</span>
                  <span>₹{selectedStorePricing.colorRate}/page</span>
                </div>
              )}
              {selectedStorePricing.bindingRate && (
                <div className="flex justify-between">
                  <span>Binding Rate:</span>
                  <span>₹{selectedStorePricing.bindingRate}/file</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Total Price */}
        <div className="flex items-center justify-between pt-2 border-t">
          <span className="font-semibold">Total Amount:</span>
          <span className="text-lg font-bold text-primary">
            ₹{totalPrice.toFixed(2)}
          </span>
        </div>

        {/* Submit Button */}
        <Button
          onClick={onSubmit}
          disabled={!canSubmit || isSubmitting}
          className="w-full"
          size="lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Placing Order...
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4 mr-2" />
              Place Order - ₹{totalPrice.toFixed(2)}
            </>
          )}
        </Button>

        {!canSubmit && (
          <p className="text-xs text-muted-foreground text-center">
            Please select a store and upload files to place order
          </p>
        )}
      </CardContent>
    </Card>
  );
};
