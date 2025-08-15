import AdminLayout from '@/components/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Save } from 'lucide-react';
import { usePricingSettings } from '@/hooks/admin/usePricingSettings';
import { StandardPricingTab } from '@/components/admin/StandardPricingTab';
import { BindingPricingTab } from '@/components/admin/BindingPricingTab';
import { PaperTypesTab } from '@/components/admin/PaperTypesTab';
import { PaymentInfoCard } from '@/components/admin/PaymentInfoCard';

const PricingSettings = () => {
  const {
    isSubmitting,
    isLoading,
    storeFeatures,
    prices,
    handlePriceChange,
    handleBindingPriceChange,
    handlePaperTypePriceChange,
    handleSubmit
  } = usePricingSettings();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Pricing Settings</h1>
          </div>
          <Button disabled={isSubmitting} type="submit" form="pricing-form">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} id="pricing-form">
          <Tabs defaultValue="standard" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="standard">Standard Pricing</TabsTrigger>
              <TabsTrigger value="binding">Binding</TabsTrigger>
              <TabsTrigger value="paper">Paper Types</TabsTrigger>
            </TabsList>
            
            <TabsContent value="standard" className="space-y-6 mt-6">
              <StandardPricingTab
                prices={prices}
                storeFeatures={storeFeatures}
                onPriceChange={handlePriceChange}
              />
            </TabsContent>
            
            <TabsContent value="binding" className="space-y-6 mt-6">
              <BindingPricingTab
                bindingPrices={prices.binding}
                storeFeatures={storeFeatures}
                onBindingPriceChange={handleBindingPriceChange}
              />
            </TabsContent>
            
            <TabsContent value="paper" className="space-y-6 mt-6">
              <PaperTypesTab
                paperTypePrices={prices.paperTypes}
                storeFeatures={storeFeatures}
                onPaperTypePriceChange={handlePaperTypePriceChange}
              />
            </TabsContent>
          </Tabs>
        </form>
        
        <PaymentInfoCard />
      </div>
    </AdminLayout>
  );
};

export default PricingSettings;
