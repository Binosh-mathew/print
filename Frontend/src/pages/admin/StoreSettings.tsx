import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Loader2, Save, Store as StoreIcon, Palette, FileText, BookOpen } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { fetchStores, updateStoreFeatures } from '@/api';
import { Checkbox } from '@/components/ui/checkbox';

const StoreSettings = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [storeId, setStoreId] = useState('');
  const [storeStatus, setStoreStatus] = useState<'active' | 'inactive'>('active');
  
  const [features, setFeatures] = useState({
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

  // Fetch store data when component mounts
  useEffect(() => {
    const fetchStoreData = async () => {
      setIsLoading(true);
      try {
        const stores = await fetchStores();
        
        if (stores && stores.length > 0) {
          const store = stores[0];
          setStoreId(store._id);
          setStoreStatus(store.status);
          
          // If store has features data, use it
          if (store.features) {
            setFeatures({
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
          title: 'Error loading settings',
          description: 'Could not load current store settings.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStoreData();
  }, []);

  const handleStoreStatusChange = (checked: boolean) => {
    setStoreStatus(checked ? 'active' : 'inactive');
  };

  const handleBindingAvailabilityChange = (checked: boolean) => {
    setFeatures(prev => ({
      ...prev,
      binding: {
        ...prev.binding,
        isAvailable: checked,
      }
    }));
  };

  const handleBindingTypeChange = (bindingType: keyof typeof features.binding, checked: boolean) => {
    if (bindingType === 'isAvailable') return;
    
    setFeatures(prev => ({
      ...prev,
      binding: {
        ...prev.binding,
        [bindingType]: checked,
      }
    }));
  };

  const handlePaperTypeChange = (paperType: keyof typeof features.availablePaperTypes, checked: boolean) => {
    setFeatures(prev => ({
      ...prev,
      availablePaperTypes: {
        ...prev.availablePaperTypes,
        [paperType]: checked,
      }
    }));
  };

  const handlePrintingTypeChange = (printingType: 'colorPrinting' | 'blackAndWhitePrinting', checked: boolean) => {
    setFeatures(prev => ({
      ...prev,
      [printingType]: checked,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!storeId) {
      toast({
        title: 'Error',
        description: 'Store not found. Please try refreshing the page.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      await updateStoreFeatures(storeId, features, storeStatus);
      
      toast({
        title: 'Settings updated successfully!',
        description: 'Your store settings have been saved.',
      });
    } catch (error: any) {
      console.error('Error updating settings:', error);
      toast({
        title: 'Error updating settings',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading store settings...</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Store Settings</h1>
          <p className="text-muted-foreground">
            Manage your store's features and operational settings
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Store Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <StoreIcon className="h-5 w-5" />
                Store Status
              </CardTitle>
              <CardDescription>
                Control whether your store is accepting new orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Switch
                  id="store-status"
                  checked={storeStatus === 'active'}
                  onCheckedChange={handleStoreStatusChange}
                />
                <Label htmlFor="store-status">
                  Store is {storeStatus === 'active' ? 'Active' : 'Inactive'}
                </Label>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {storeStatus === 'active' 
                  ? 'Your store is currently accepting new orders' 
                  : 'Your store is not accepting new orders'
                }
              </p>
            </CardContent>
          </Card>

          {/* Printing Services */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Printing Services
              </CardTitle>
              <CardDescription>
                Configure the types of printing services you offer
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="color-printing"
                  checked={features.colorPrinting}
                  onCheckedChange={(checked) => handlePrintingTypeChange('colorPrinting', checked)}
                />
                <Label htmlFor="color-printing">Color Printing</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="bw-printing"
                  checked={features.blackAndWhitePrinting}
                  onCheckedChange={(checked) => handlePrintingTypeChange('blackAndWhitePrinting', checked)}
                />
                <Label htmlFor="bw-printing">Black & White Printing</Label>
              </div>
            </CardContent>
          </Card>

          {/* Binding Services */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Binding Services
              </CardTitle>
              <CardDescription>
                Configure the binding services available at your store
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="binding-available"
                  checked={features.binding.isAvailable}
                  onCheckedChange={handleBindingAvailabilityChange}
                />
                <Label htmlFor="binding-available">Binding Services Available</Label>
              </div>
              
              {features.binding.isAvailable && (
                <>
                  <Separator />
                  <div className="space-y-3 ml-6">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="spiral-binding"
                        checked={features.binding.spiralBinding}
                        onCheckedChange={(checked) => 
                          handleBindingTypeChange('spiralBinding', checked as boolean)
                        }
                      />
                      <Label htmlFor="spiral-binding">Spiral Binding</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="stapling-binding"
                        checked={features.binding.staplingBinding}
                        onCheckedChange={(checked) => 
                          handleBindingTypeChange('staplingBinding', checked as boolean)
                        }
                      />
                      <Label htmlFor="stapling-binding">Stapling Binding</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hardcover-binding"
                        checked={features.binding.hardcoverBinding}
                        onCheckedChange={(checked) => 
                          handleBindingTypeChange('hardcoverBinding', checked as boolean)
                        }
                      />
                      <Label htmlFor="hardcover-binding">Hardcover Binding</Label>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Paper Types */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Available Paper Types
              </CardTitle>
              <CardDescription>
                Select the types of paper available at your store
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="normal-paper"
                  checked={features.availablePaperTypes.normal}
                  onCheckedChange={(checked) => 
                    handlePaperTypeChange('normal', checked as boolean)
                  }
                />
                <Label htmlFor="normal-paper">Normal Paper</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="glossy-paper"
                  checked={features.availablePaperTypes.glossy}
                  onCheckedChange={(checked) => 
                    handlePaperTypeChange('glossy', checked as boolean)
                  }
                />
                <Label htmlFor="glossy-paper">Glossy Paper</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="matte-paper"
                  checked={features.availablePaperTypes.matte}
                  onCheckedChange={(checked) => 
                    handlePaperTypeChange('matte', checked as boolean)
                  }
                />
                <Label htmlFor="matte-paper">Matte Paper</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="transparent-paper"
                  checked={features.availablePaperTypes.transparent}
                  onCheckedChange={(checked) => 
                    handlePaperTypeChange('transparent', checked as boolean)
                  }
                />
                <Label htmlFor="transparent-paper">Transparent Paper</Label>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default StoreSettings;
