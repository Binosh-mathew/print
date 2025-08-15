import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, Clock, Users, MapPin, Loader2 } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { Store } from '@/types/store';
import { OrderFormData } from '@/types/order';

interface StoreSelectionProps {
  form: UseFormReturn<OrderFormData>;
  stores: Store[];
  storeSelected: Store | null;
  pendingOrdersCount: number;
  isCountLoading: boolean;
  getEstimatedDeliveryTime: () => string;
  getStoreQueueStatus: () => string;
  getQueueStatusColor: () => string;
}

export const StoreSelection: React.FC<StoreSelectionProps> = ({
  form,
  stores,
  storeSelected,
  pendingOrdersCount,
  isCountLoading,
  getEstimatedDeliveryTime,
  getStoreQueueStatus,
  getQueueStatusColor,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Select Print Shop
        </CardTitle>
        <CardDescription>
          Choose a nearby print shop to process your order
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="storeId"
          rules={{ required: "Please select a print shop" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Print Shop</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a print shop" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {stores.map((store) => (
                    <SelectItem key={store.id || store._id} value={store.id || store._id || ''}>
                      <div className="flex items-center justify-between w-full">
                        <span>{store.name}</span>
                        <span className="text-sm text-muted-foreground ml-2">
                          {store.location}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Store Information */}
        {storeSelected && (
          <div className="space-y-4 pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Store Details */}
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Shop Information
                </h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Name:</span> {storeSelected.name}
                  </div>
                  <div>
                    <span className="font-medium">Location:</span> {storeSelected.location}
                  </div>
                  {(storeSelected as any).contact && (
                    <div>
                      <span className="font-medium">Contact:</span> {(storeSelected as any).contact}
                    </div>
                  )}
                  {storeSelected.email && (
                    <div>
                      <span className="font-medium">Email:</span> {storeSelected.email}
                    </div>
                  )}
                </div>
              </div>

              {/* Queue Information */}
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Queue Status
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-3 h-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Number of pending orders affects delivery time</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </h4>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Pending Orders:</span>
                    <div className="flex items-center gap-2">
                      {isCountLoading ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Badge variant="outline" className={getQueueStatusColor()}>
                          {pendingOrdersCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Queue Status:</span>
                    <Badge 
                      variant="outline" 
                      className={getQueueStatusColor()}
                    >
                      {getStoreQueueStatus()}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Est. Delivery:
                    </span>
                    <span className="text-sm font-medium">
                      {getEstimatedDeliveryTime()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Store Hours */}
            {(storeSelected as any).hours && (
              <div className="pt-2 border-t">
                <h4 className="font-medium text-sm mb-2">Operating Hours</h4>
                <p className="text-sm text-muted-foreground">{(storeSelected as any).hours}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
