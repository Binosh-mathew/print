import { useState, useEffect, useRef } from "react";
import UserLayout from "@/components/layouts/UserLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExternalLink, ShoppingBag, Tag, Loader2 } from "lucide-react";
import type { Product } from "@/types/product";
import { fetchProducts } from "@/api";
import { Alert, AlertDescription } from "@/components/ui/alert";

const OffersShops = () => {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const productsListRef = useRef<HTMLElement>(null);
  
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedProducts = await fetchProducts();
        setProducts(fetchedProducts);
      } catch (err) {
        setError("Failed to load products. Please try again later.");
        console.error("Error loading products:", err);
      } finally {
        setLoading(false);
      }
    };
    
    loadProducts();
  }, []);
  
  // Helper function to normalize and format category names
  const normalizeCategory = (category: string | undefined | null): string => {
    if (!category) return '';
    return category.toLowerCase().trim();
  };
  
  const formatCategoryLabel = (category: string): string => {
    if (!category) return '';
    return category.charAt(0).toUpperCase() + category.slice(1).toLowerCase().trim();
  };
  
  // Extract unique categories from products and filter out null/undefined
  const productCategories = [...new Set(products
    .map(product => product.category)
    .filter(category => category) // Remove null/undefined categories
    .map(category => normalizeCategory(category)) // Normalize categories
  )];
  
  const categories = [
    { id: "all", label: "All Products" },
    ...productCategories.map(category => ({ 
      id: category, 
      label: formatCategoryLabel(category)
    }))
  ];


  
  const filteredProducts = activeCategory === "all" 
    ? products
    : products.filter(product => {
        // Handle special case for "beauty" which might have inconsistencies
        if (activeCategory.toLowerCase() === 'beauty') {
          return product.category && 
            (normalizeCategory(product.category) === 'beauty' || 
             normalizeCategory(product.category).includes('beauty'));
        }
        
        return product.category && 
          normalizeCategory(product.category) === normalizeCategory(activeCategory);
      });

  const featuredProducts = products.filter(product => product.featured);
  
  // Function to handle "View All Deals" button click
  const handleViewAllDeals = () => {
    // Set category to "all" to show all products
    setActiveCategory("all");
    
    // Scroll to products section smoothly
    if (productsListRef.current) {
      productsListRef.current.scrollIntoView({ behavior: 'smooth' });
    } else {
      // Fallback if ref isn't available
      const productsSection = document.getElementById('all-products-section');
      if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Loading state UI
  if (loading) {
    return (
      <UserLayout>
        <div className="flex flex-col items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-gray-500">Loading products...</p>
        </div>
      </UserLayout>
    );
  }

  // Error state UI
  if (error) {
    return (
      <UserLayout>
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="text-center py-20">
          <p className="text-gray-500">Please try refreshing the page or check back later.</p>
        </div>
      </UserLayout>
    );
  }

  // Empty state UI
  if (products.length === 0) {
    return (
      <UserLayout>
        <div className="space-y-6">
          <section>
            <h1 className="text-3xl font-bold mb-2">Offers & Shops</h1>
            <p className="text-gray-600">
              Exclusive deals and products for our valued customers
            </p>
          </section>
          
          <div className="text-center py-20">
            <p className="text-gray-500">No products are currently available.</p>
            <p className="text-gray-500 mt-2">Check back later for exciting offers!</p>
          </div>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="space-y-6">
        {/* Header section */}
        <section>
          <h1 className="text-3xl font-bold mb-2">Offers & Shops</h1>
          <p className="text-gray-600">
            Exclusive deals and products for our valued customers
          </p>
        </section>

        {/* Featured Products Banner - Only show if there are featured products */}
        {featuredProducts.length > 0 && (
          <section className="bg-gradient-to-r from-primary-100 to-primary-50 rounded-lg p-6">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div>
                <h2 className="text-2xl font-bold text-primary-900">Featured Deals</h2>
                <p className="text-primary-700">Special offers exclusively selected for you</p>
              </div>
              <Button 
                className="bg-primary hover:bg-primary-600"
                onClick={handleViewAllDeals}
                aria-label="View all products"
              >
                View All Deals
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {featuredProducts.map(product => (
                <Card key={product.id} className="flex flex-col md:flex-row overflow-hidden border-0 shadow-md">
                  <div className="md:w-1/3 h-48 md:h-auto">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col justify-between p-4 md:w-2/3">
                    <div>
                      <h3 className="font-bold text-lg">{product.name}</h3>
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        {product.discountPrice && (
                          <span className="text-lg font-bold text-primary">{product.discountPrice}</span>
                        )}
                        <span className={`text-${product.discountPrice ? "gray-500 text-sm line-through" : "lg font-bold"}`}>{product.price}</span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <a href={product.affiliateUrl} target="_blank" rel="noopener noreferrer">
                        <Button className="w-full bg-primary hover:bg-primary-600">
                          Get Deal <ExternalLink size={16} className="ml-2" />
                        </Button>
                      </a>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* All Products */}
        <section id="all-products-section" ref={productsListRef}>
          <Tabs value={activeCategory} defaultValue="all" className="w-full" onValueChange={setActiveCategory}>
            <TabsList className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-2">
              {categories.map((category) => (
                <TabsTrigger 
                  key={category.id}
                  value={category.id}
                  className="w-full"
                >
                  {category.label}
                </TabsTrigger>
              ))}
            </TabsList>
            
            <TabsContent value={activeCategory} className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <Card key={product.id} className="overflow-hidden">
                    <div className="h-48 overflow-hidden relative">
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-full h-full object-cover transition-transform hover:scale-105"
                      />
                      {product.discountPrice && (
                        <Badge className="absolute top-2 right-2 bg-red-500 hover:bg-red-600">
                          Sale
                        </Badge>
                      )}
                    </div>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <p className="text-gray-600 text-sm line-clamp-2 mb-3">{product.description}</p>
                      <div className="flex items-center space-x-2 mb-2">
                        {product.discountPrice && (
                          <span className="text-lg font-bold text-primary">{product.discountPrice}</span>
                        )}
                        <span className={`${product.discountPrice ? "text-gray-500 text-sm line-through" : "text-lg font-bold"}`}>{product.price}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {product.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            <Tag size={10} className="mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <a href={product.affiliateUrl} target="_blank" rel="noopener noreferrer" className="w-full">
                        <Button className="w-full bg-primary hover:bg-primary-600 flex items-center justify-center">
                          <ShoppingBag size={16} className="mr-2" /> Shop Now
                        </Button>
                      </a>
                    </CardFooter>
                  </Card>
                ))}
              </div>
              
              {filteredProducts.length === 0 && (
                <div className="text-center py-20">
                  <p className="text-gray-500">No products found in the "{activeCategory === 'all' ? 'All Products' : activeCategory}" category.</p>
                  <p className="text-gray-400 mt-2">Try selecting a different category or check back later.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </section>
      </div>
    </UserLayout>
  );
};

export default OffersShops;
