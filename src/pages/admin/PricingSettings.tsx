import React, { useState } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Loader2, Save, CreditCard, FileText, Printer, Info, BookOpen, Layers } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const PricingSettings = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1200));
      
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
        <div>
          <h1 className="text-3xl font-bold">Pricing Settings</h1>
          <p className="text-gray-600 mt-1">Manage pricing for print services</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="standard" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="standard">Standard Pricing</TabsTrigger>
              <TabsTrigger value="binding">Binding</TabsTrigger>
              <TabsTrigger value="paper">Paper Types</TabsTrigger>
            </TabsList>
            
            <TabsContent value="standard" className="space-y-6 mt-6">
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
            </TabsContent>
            
            <TabsContent value="binding" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <BookOpen className="mr-2 h-5 w-5" />
                    Binding Options
                  </CardTitle>
                  <CardDescription>
                    Set pricing for different binding types
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  </div>
                </CardContent>
              </Card>
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
                  </div>
                  
                  <div className="rounded-md bg-gray-50 p-4 text-sm flex">
                    <Info className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0" />
                    <p className="text-gray-600">
                      Paper type prices are additional costs per page on top of the standard printing costs.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 flex justify-end">
            <Button
              type="submit"
              className="bg-primary hover:bg-primary-500"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating Pricing...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" /> Save Pricing Settings
                </>
              )}
            </Button>
          </div>
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
          <CardFooter className="bg-gray-50 border-t border-gray-100 text-sm text-gray-500">
            <p>Last updated: April 15, 2025</p>
          </CardFooter>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default PricingSettings;
