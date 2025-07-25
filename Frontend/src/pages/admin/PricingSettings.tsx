import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Loader2, Save, CreditCard, FileText, Printer, Info, BookOpen, Layers } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { fetchStores, updateStorePricing } from '@/api';

const PricingSettings = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [storeId, setStoreId] = useState('');
  const [storeFeatures, setStoreFeatures] = useState({
    binding: {
      isAvailable: true,
      spiralBinding: true,
      staplingBinding: true,
      hardcoverBinding: true,
    },
    availablePaperTypes: {
      normal: true,
      glossy: true,
      matte: true,
      transparent: true,
    },
    colorPrinting: true,
    blackAndWhitePrinting: true,
  });
  const [prices, setPrices] = useState({
    blackAndWhite: {
      singleSided: 0,
      doubleSided: 0,
    },
    color: {
      singleSided: 0,
      doubleSided: 0,
    },
    binding: {
      spiralBinding: 0,
      staplingBinding: 0,
      hardcoverBinding: 0,
    },
    paperTypes: {
      normal: 0,
      glossy: 0,
      matte: 0,
      transparent: 0,
    },
  });
  
  // Fetch store data and pricing when component mounts
  useEffect(() => {
    const fetchStoreData = async () => {
      setIsLoading(true);
      try {
        const stores = await fetchStores();
        
        if (stores && stores.length > 0) {
          // Get the first store (assuming admin is associated with one store)
          const store = stores[0];
          setStoreId(store._id);
          
          // If store has pricing data, use it
          if (store.pricing) {
            setPrices({
              blackAndWhite: {
                singleSided: store.pricing.blackAndWhite?.singleSided || 0,
                doubleSided: store.pricing.blackAndWhite?.doubleSided || 0,
              },
              color: {
                singleSided: store.pricing.color?.singleSided || 0,
                doubleSided: store.pricing.color?.doubleSided || 0,
              },
              binding: {
                spiralBinding: store.pricing.binding?.spiralBinding || 0,
                staplingBinding: store.pricing.binding?.staplingBinding || 0,
                hardcoverBinding: store.pricing.binding?.hardcoverBinding || 0,
              },
              paperTypes: {
                normal: store.pricing.paperTypes?.normal || 0,
                glossy: store.pricing.paperTypes?.glossy || 0,
                matte: store.pricing.paperTypes?.matte || 0,
                transparent: store.pricing.paperTypes?.transparent || 0,
              },
            });
          }
          
          // If store has features data, use it
          if (store.features) {
            setStoreFeatures({
              binding: {
                isAvailable: store.features.binding?.isAvailable ?? true,
                spiralBinding: store.features.binding?.spiralBinding ?? true,
                staplingBinding: store.features.binding?.staplingBinding ?? true,
                hardcoverBinding: store.features.binding?.hardcoverBinding ?? true,
              },
              availablePaperTypes: {
                normal: store.features.availablePaperTypes?.normal ?? true,
                glossy: store.features.availablePaperTypes?.glossy ?? true,
                matte: store.features.availablePaperTypes?.matte ?? true,
                transparent: store.features.availablePaperTypes?.transparent ?? true,
              },
              colorPrinting: store.features.colorPrinting ?? true,
              blackAndWhitePrinting: store.features.blackAndWhitePrinting ?? true,
            });
          }
        }
      } catch (error) {
        console.error('Error fetching store data:', error);
        toast({
          title: 'Error loading pricing',
          description: 'Could not load current pricing settings.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStoreData();
  }, []);

  const handlePriceChange = (
    printType: 'blackAndWhite' | 'color',
    sideType: 'singleSided' | 'doubleSided',
    value: string
  ) => {
    const numericValue = parseFloat(value) || 0;
    setPrices({
      ...prices,
      [printType]: {
        ...prices[printType],
        [sideType]: numericValue,
      },
    });
  };

  const handleBindingPriceChange = (
    bindingType: keyof typeof prices.binding,
    value: string
  ) => {
    const numericValue = parseFloat(value) || 0;
    setPrices({
      ...prices,
      binding: {
        ...prices.binding,
        [bindingType]: numericValue,
      },
    });
  };

  const handlePaperTypePriceChange = (
    paperType: keyof typeof prices.paperTypes,
    value: string
  ) => {
    const numericValue = parseFloat(value) || 0;
    setPrices({
      ...prices,
      paperTypes: {
        ...prices.paperTypes,
        [paperType]: numericValue,
      },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (!storeId) {
        throw new Error('No store found to update pricing');
      }
      
      // Update pricing in the backend
      // Send pricing data without isAvailable (managed in Store Settings)
      const pricingData = {
        ...prices,
        binding: {
          spiralBinding: prices.binding.spiralBinding,
          staplingBinding: prices.binding.staplingBinding,
          hardcoverBinding: prices.binding.hardcoverBinding,
        }
      };
      
      await updateStorePricing(storeId, pricingData);
      
      toast({
        title: "Pricing updated",
        description: "Your print pricing settings have been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating pricing:', error);
      toast({
        title: "Update failed",
        description: "There was a problem updating the pricing settings.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
                            onChange={(e) => handlePriceChange('blackAndWhite', 'singleSided', e.target.value)}
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
                            onChange={(e) => handlePriceChange('blackAndWhite', 'doubleSided', e.target.value)}
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
                            onChange={(e) => handlePriceChange('color', 'singleSided', e.target.value)}
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
                            onChange={(e) => handlePriceChange('color', 'doubleSided', e.target.value)}
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
            </TabsContent>
            
            <TabsContent value="binding" className="space-y-6 mt-6">
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
                              value={prices.binding.spiralBinding}
                              onChange={(e) => handleBindingPriceChange('spiralBinding', e.target.value)}
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
                              value={prices.binding.staplingBinding}
                              onChange={(e) => handleBindingPriceChange('staplingBinding', e.target.value)}
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
                              value={prices.binding.hardcoverBinding}
                              onChange={(e) => handleBindingPriceChange('hardcoverBinding', e.target.value)}
                              className="pl-8"
                              min="0"
                              step="1"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {!storeFeatures.binding.spiralBinding && !storeFeatures.binding.staplingBinding && !storeFeatures.binding.hardcoverBinding && (
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
            </TabsContent>
            
            <TabsContent value="paper" className="space-y-6 mt-6">
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
                            value={prices.paperTypes.normal}
                            onChange={(e) => handlePaperTypePriceChange('normal', e.target.value)}
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
                            value={prices.paperTypes.glossy}
                            onChange={(e) => handlePaperTypePriceChange('glossy', e.target.value)}
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
                            value={prices.paperTypes.matte}
                            onChange={(e) => handlePaperTypePriceChange('matte', e.target.value)}
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
                            value={prices.paperTypes.transparent}
                            onChange={(e) => handlePaperTypePriceChange('transparent', e.target.value)}
                            className="pl-8"
                            min="0"
                            step="0.5"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {!storeFeatures.availablePaperTypes.normal && 
                   !storeFeatures.availablePaperTypes.glossy && 
                   !storeFeatures.availablePaperTypes.matte && 
                   !storeFeatures.availablePaperTypes.transparent && (
                    <div className="rounded-md bg-yellow-50 p-4 text-sm flex">
                      <Info className="h-5 w-5 text-yellow-500 mr-3 flex-shrink-0" />
                      <p className="text-yellow-700">
                        No paper types are enabled. Enable paper types in Store Settings.
                      </p>
                    </div>
                  )}
                  
                  {(storeFeatures.availablePaperTypes.normal || 
                    storeFeatures.availablePaperTypes.glossy || 
                    storeFeatures.availablePaperTypes.matte || 
                    storeFeatures.availablePaperTypes.transparent) && (
                    <div className="rounded-md bg-gray-50 p-4 text-sm flex">
                      <Info className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0" />
                      <p className="text-gray-600">
                        Paper type prices are additional costs per page on top of the standard printing costs.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          {/* Bottom section removed to avoid duplicate Save Changes button */}
        </form>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <CreditCard className="mr-2 h-5 w-5" />
              Payment Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="rounded-full bg-primary-100 p-2 text-primary mr-3">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-medium">Online Payment Gateway</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    All payments are processed securely through our integrated Google Pay / UPI gateway.
                  </p>
                </div>
              </div>
              
              <Separator />
              
              <div className="rounded-md bg-yellow-50 p-4 text-sm flex">
                <Info className="h-5 w-5 text-yellow-500 mr-3 flex-shrink-0" />
                <p className="text-yellow-700">
                  Note: When you update pricing, it will affect all new orders. Existing orders will maintain their original pricing.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default PricingSettings;
