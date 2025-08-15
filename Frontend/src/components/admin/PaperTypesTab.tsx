import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription
} from '@/components/ui/card';
import { Layers, Info } from 'lucide-react';

interface PaperTypePrices {
  normal: number;
  glossy: number;
  matte: number;
  transparent: number;
}

interface PaperTypeFeatures {
  normal: boolean;
  glossy: boolean;
  matte: boolean;
  transparent: boolean;
}

interface PaperTypesTabProps {
  paperTypePrices: PaperTypePrices;
  storeFeatures: { availablePaperTypes: PaperTypeFeatures };
  onPaperTypePriceChange: (
    paperType: keyof PaperTypePrices,
    value: string
  ) => void;
}

export const PaperTypesTab = ({ 
  paperTypePrices, 
  storeFeatures, 
  onPaperTypePriceChange 
}: PaperTypesTabProps) => {
  const hasAnyPaperType = storeFeatures.availablePaperTypes.normal || 
                         storeFeatures.availablePaperTypes.glossy || 
                         storeFeatures.availablePaperTypes.matte || 
                         storeFeatures.availablePaperTypes.transparent;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Layers className="mr-2 h-5 w-5" />
            Paper Types
          </CardTitle>
          <CardDescription>
            Set additional cost per page for different paper types
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {storeFeatures.availablePaperTypes.normal && (
              <div className="space-y-2">
                <Label htmlFor="normal-paper">Normal Paper (₹ per page)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                  <Input
                    id="normal-paper"
                    type="number"
                    value={paperTypePrices.normal}
                    onChange={(e) => onPaperTypePriceChange('normal', e.target.value)}
                    className="pl-8"
                    min="0"
                    step="0.5"
                  />
                </div>
              </div>
            )}
            
            {storeFeatures.availablePaperTypes.glossy && (
              <div className="space-y-2">
                <Label htmlFor="glossy-paper">Glossy Paper (₹ per page)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                  <Input
                    id="glossy-paper"
                    type="number"
                    value={paperTypePrices.glossy}
                    onChange={(e) => onPaperTypePriceChange('glossy', e.target.value)}
                    className="pl-8"
                    min="0"
                    step="0.5"
                  />
                </div>
              </div>
            )}
            
            {storeFeatures.availablePaperTypes.matte && (
              <div className="space-y-2">
                <Label htmlFor="matte-paper">Matte Paper (₹ per page)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                  <Input
                    id="matte-paper"
                    type="number"
                    value={paperTypePrices.matte}
                    onChange={(e) => onPaperTypePriceChange('matte', e.target.value)}
                    className="pl-8"
                    min="0"
                    step="0.5"
                  />
                </div>
              </div>
            )}
            
            {storeFeatures.availablePaperTypes.transparent && (
              <div className="space-y-2">
                <Label htmlFor="transparent-paper">Transparent Sheet (₹ per page)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                  <Input
                    id="transparent-paper"
                    type="number"
                    value={paperTypePrices.transparent}
                    onChange={(e) => onPaperTypePriceChange('transparent', e.target.value)}
                    className="pl-8"
                    min="0"
                    step="0.5"
                  />
                </div>
              </div>
            )}
          </div>
          
          {!hasAnyPaperType && (
            <div className="rounded-md bg-yellow-50 p-4 text-sm flex">
              <Info className="h-5 w-5 text-yellow-500 mr-3 flex-shrink-0" />
              <p className="text-yellow-700">
                No paper types are enabled. Enable paper types in Store Settings.
              </p>
            </div>
          )}
          
          {hasAnyPaperType && (
            <div className="rounded-md bg-gray-50 p-4 text-sm flex">
              <Info className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0" />
              <p className="text-gray-600">
                Paper type prices are additional costs per page on top of the standard printing costs.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
