import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription
} from '@/components/ui/card';
import { FileText, Printer, Info } from 'lucide-react';

interface PriceData {
  blackAndWhite: {
    singleSided: number;
    doubleSided: number;
  };
  color: {
    singleSided: number;
    doubleSided: number;
  };
}

interface StoreFeatures {
  colorPrinting: boolean;
  blackAndWhitePrinting: boolean;
}

interface StandardPricingTabProps {
  prices: PriceData;
  storeFeatures: StoreFeatures;
  onPriceChange: (
    printType: 'blackAndWhite' | 'color',
    sideType: 'singleSided' | 'doubleSided',
    value: string
  ) => void;
}

export const StandardPricingTab = ({ 
  prices, 
  storeFeatures, 
  onPriceChange 
}: StandardPricingTabProps) => {
  return (
    <div className="space-y-6">
      {storeFeatures.blackAndWhitePrinting && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <FileText className="mr-2 h-5 w-5" />
              Black & White Printing
            </CardTitle>
            <CardDescription>
              Set pricing for black and white prints per page
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="bw-single">Single-sided (₹ per page)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                  <Input
                    id="bw-single"
                    type="number"
                    value={prices.blackAndWhite.singleSided}
                    onChange={(e) => onPriceChange('blackAndWhite', 'singleSided', e.target.value)}
                    className="pl-8"
                    min="0"
                    step="0.5"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bw-double">Double-sided (₹ per page)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                  <Input
                    id="bw-double"
                    type="number"
                    value={prices.blackAndWhite.doubleSided}
                    onChange={(e) => onPriceChange('blackAndWhite', 'doubleSided', e.target.value)}
                    className="pl-8"
                    min="0"
                    step="0.5"
                  />
                </div>
              </div>
            </div>
            
            <div className="rounded-md bg-gray-50 p-4 text-sm flex">
              <Info className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0" />
              <p className="text-gray-600">
                For double-sided prints, the price is per physical sheet (1 sheet = 2 pages when printed double-sided).
              </p>
            </div>
          </CardContent>
        </Card>
      )}
      
      {!storeFeatures.blackAndWhitePrinting && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-xl text-muted-foreground">
              <FileText className="mr-2 h-5 w-5" />
              Black & White Printing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md bg-yellow-50 p-4 text-sm flex">
              <Info className="h-5 w-5 text-yellow-500 mr-3 flex-shrink-0" />
              <p className="text-yellow-700">
                Black & White printing is currently disabled. Enable it in Store Settings to set pricing.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
      
      {storeFeatures.colorPrinting && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Printer className="mr-2 h-5 w-5" />
              Color Printing
            </CardTitle>
            <CardDescription>
              Set pricing for color prints per page
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="color-single">Single-sided (₹ per page)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                  <Input
                    id="color-single"
                    type="number"
                    value={prices.color.singleSided}
                    onChange={(e) => onPriceChange('color', 'singleSided', e.target.value)}
                    className="pl-8"
                    min="0"
                    step="0.5"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="color-double">Double-sided (₹ per page)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                  <Input
                    id="color-double"
                    type="number"
                    value={prices.color.doubleSided}
                    onChange={(e) => onPriceChange('color', 'doubleSided', e.target.value)}
                    className="pl-8"
                    min="0"
                    step="0.5"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {!storeFeatures.colorPrinting && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-xl text-muted-foreground">
              <Printer className="mr-2 h-5 w-5" />
              Color Printing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md bg-yellow-50 p-4 text-sm flex">
              <Info className="h-5 w-5 text-yellow-500 mr-3 flex-shrink-0" />
              <p className="text-yellow-700">
                Color printing is currently disabled. Enable it in Store Settings to set pricing.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
