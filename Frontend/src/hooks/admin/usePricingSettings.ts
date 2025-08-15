import { useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { fetchStores, updateStorePricing } from '@/api';

export const usePricingSettings = () => {
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

  return {
    // State
    isSubmitting,
    isLoading,
    storeId,
    storeFeatures,
    prices,
    
    // Actions
    handlePriceChange,
    handleBindingPriceChange,
    handlePaperTypePriceChange,
    handleSubmit
  };
};
