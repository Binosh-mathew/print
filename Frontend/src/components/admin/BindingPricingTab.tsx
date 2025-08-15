import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription
} from '@/components/ui/card';
import { BookOpen, Info } from 'lucide-react';

interface BindingPrices {
  spiralBinding: number;
  staplingBinding: number;
  hardcoverBinding: number;
}

interface BindingFeatures {
  isAvailable: boolean;
  spiralBinding: boolean;
  staplingBinding: boolean;
  hardcoverBinding: boolean;
}

interface BindingPricingTabProps {
  bindingPrices: BindingPrices;
  storeFeatures: { binding: BindingFeatures };
  onBindingPriceChange: (
    bindingType: keyof BindingPrices,
    value: string
  ) => void;
}

export const BindingPricingTab = ({ 
  bindingPrices, 
  storeFeatures, 
  onBindingPriceChange 
}: BindingPricingTabProps) => {
  return (
    <div className="space-y-6">
      {storeFeatures.binding.isAvailable ? (
        <Card>
          <CardHeader>
            <div>
              <CardTitle className="flex items-center text-xl">
                <BookOpen className="mr-2 h-5 w-5" />
                Binding Options
              </CardTitle>
              <CardDescription>
                Set pricing for different binding types. Manage availability in Store Settings.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {storeFeatures.binding.spiralBinding && (
                <div className="space-y-2">
                  <Label htmlFor="spiral-binding">Spiral Binding (₹)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                    <Input
                      id="spiral-binding"
                      type="number"
                      value={bindingPrices.spiralBinding}
                      onChange={(e) => onBindingPriceChange('spiralBinding', e.target.value)}
                      className="pl-8"
                      min="0"
                      step="1"
                    />
                  </div>
                </div>
              )}
              
              {storeFeatures.binding.staplingBinding && (
                <div className="space-y-2">
                  <Label htmlFor="stapling-binding">Stapling (₹)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                    <Input
                      id="stapling-binding"
                      type="number"
                      value={bindingPrices.staplingBinding}
                      onChange={(e) => onBindingPriceChange('staplingBinding', e.target.value)}
                      className="pl-8"
                      min="0"
                      step="1"
                    />
                  </div>
                </div>
              )}
              
              {storeFeatures.binding.hardcoverBinding && (
                <div className="space-y-2">
                  <Label htmlFor="hardcover-binding">Hardcover (₹)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                    <Input
                      id="hardcover-binding"
                      type="number"
                      value={bindingPrices.hardcoverBinding}
                      onChange={(e) => onBindingPriceChange('hardcoverBinding', e.target.value)}
                      className="pl-8"
                      min="0"
                      step="1"
                    />
                  </div>
                </div>
              )}
            </div>
            
            {!storeFeatures.binding.spiralBinding && 
             !storeFeatures.binding.staplingBinding && 
             !storeFeatures.binding.hardcoverBinding && (
              <div className="rounded-md bg-yellow-50 p-4 text-sm flex">
                <Info className="h-5 w-5 text-yellow-500 mr-3 flex-shrink-0" />
                <p className="text-yellow-700">
                  No specific binding types are enabled. Enable specific binding types in Store Settings.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-xl text-muted-foreground">
              <BookOpen className="mr-2 h-5 w-5" />
              Binding Options
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md bg-yellow-50 p-4 text-sm flex">
              <Info className="h-5 w-5 text-yellow-500 mr-3 flex-shrink-0" />
              <p className="text-yellow-700">
                Binding services are currently disabled. Enable binding in Store Settings to set pricing.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
