import { useState, useEffect, useRef } from "react";
import UserLayout from "@/components/layouts/UserLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ExternalLink, 
  ShoppingBag, 
  Tag, 
  Loader2,
  AlertCircle 
} from "lucide-react";
import type { Product } from "@/types/product";
import { fetchProducts } from "@/api";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Shop = () => {
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
  
  // Function to handle scroll to all products section
  const handleScrollToProducts = () => {
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
        <div className="flex flex-col items-center justify-center py-20">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
            <div className="absolute inset-0 border-t-4 border-primary rounded-full opacity-20"></div>
          </div>
          <p className="text-gray-500 mt-4 font-medium">Loading amazing deals for you...</p>
        </div>
      </UserLayout>
    );
  }

  // Error state UI
  if (error) {
    return (
      <UserLayout>
        <div className="max-w-3xl mx-auto mt-10 mb-10">
          <Alert variant="destructive" className="mb-8 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
          
          <div className="text-center py-16 bg-gray-50 rounded-xl flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <AlertCircle size={32} className="text-red-400" />
            </div>
            <h2 className="text-xl font-medium text-gray-700 mb-2">Something went wrong</h2>
            <p className="text-gray-500 max-w-md">
              We're having trouble loading the products. Please try refreshing the page or check back later.
            </p>
            <Button 
              className="mt-6 bg-primary hover:bg-primary-600"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
        </div>
      </UserLayout>
    );
  }

  // Empty state UI
  if (products.length === 0) {
    return (
      <UserLayout>
        <div className="max-w-3xl mx-auto mt-10 mb-10">
          <div className="text-center py-20 bg-gray-50 rounded-xl flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <ShoppingBag size={32} className="text-gray-400" />
            </div>
            <h2 className="text-xl font-medium text-gray-700 mb-2">No Products Available</h2>
            <p className="text-gray-500 max-w-md">
              We don't have any products available at the moment. Please check back later for exciting offers!
            </p>
          </div>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="space-y-6">
        <div className="flex items-center">
          <ShoppingBag className="h-7 w-7 text-primary mr-3" />
          <h1 className="text-2xl font-bold">Shop</h1>
        </div>

        {/* Featured Products Carousel - Only show if there are featured products */}
        {featuredProducts.length > 0 && (
          <section className="py-4">
            <div className="flex justify-between items-center mb-5">
              <div className="flex items-center">
                <div className="h-8 w-1 bg-primary mr-3 rounded-full"></div>
                <div>
                  <h2 className="text-xl font-bold">Featured Products</h2>
                  <p className="text-sm text-gray-500">Our top picks for you</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {featuredProducts.map(product => (
                <Card key={product.id} className="group overflow-hidden border border-gray-100 hover:border-primary hover:shadow-lg transition-all duration-300 flex flex-col h-full">
                  <div className="relative overflow-hidden h-40">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10"></div>
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    {product.discountPrice && (
                      <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold py-1 px-2 z-10 rounded-bl-lg">
                        SALE
                      </div>
                    )}
                  </div>
                  <CardHeader className="pb-0 pt-3 px-4">
                    <CardTitle className="text-base font-medium line-clamp-1">{product.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 py-2 flex-grow">
                    <p className="text-gray-600 text-xs line-clamp-2 mb-2">{product.description}</p>
                    <div className="flex items-center mt-auto">
                      {product.discountPrice && (
                        <>
                          <span className="text-sm font-bold text-primary mr-2">{product.discountPrice}</span>
                          <span className="text-gray-400 text-xs line-through">{product.price}</span>
                        </>
                      )}
                      {!product.discountPrice && (
                        <span className="text-sm font-bold">{product.price}</span>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-1 pb-4 px-4">
                    <a href={product.affiliateUrl} target="_blank" rel="noopener noreferrer" className="w-full">
                      <Button className="w-full bg-white hover:bg-primary border border-primary text-primary hover:text-white transition-colors flex items-center justify-center py-1 h-9">
                        <ExternalLink size={14} className="mr-2" /> View Product
                      </Button>
                    </a>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* All Products */}
        <section id="all-products-section" ref={productsListRef} className="pt-2">
          <Tabs value={activeCategory} defaultValue="all" className="w-full" onValueChange={setActiveCategory}>
            <div className="border-b border-gray-200 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Browse Products</h2>
                <div className="text-sm text-gray-500">
                  {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
                </div>
              </div>
              <TabsList className="bg-transparent flex overflow-x-auto py-1">
                {categories.map((category) => (
                  <TabsTrigger 
                    key={category.id}
                    value={category.id}
                    className="rounded-full px-4 py-1 text-sm data-[state=active]:bg-primary data-[state=active]:text-white"
                  >
                    {category.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            
            <TabsContent value={activeCategory} className="mt-0">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {filteredProducts.map((product) => (
                  <Card key={product.id} className="group overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full border border-gray-100 hover:border-primary">
                    <div className="h-40 overflow-hidden relative">
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      {product.discountPrice && (
                        <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold py-1 px-2 rounded-bl-lg">
                          SALE
                        </div>
                      )}
                    </div>
                    <CardHeader className="pb-1 pt-3 px-4">
                      <CardTitle className="text-base font-medium line-clamp-1">{product.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="pb-1 px-4 flex-grow">
                      <p className="text-gray-600 text-xs line-clamp-2 mb-3">{product.description}</p>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {product.tags.slice(0, 2).map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-200">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center mt-auto">
                        {product.discountPrice && (
                          <>
                            <span className="text-sm font-bold text-primary mr-2">{product.discountPrice}</span>
                            <span className="text-gray-400 text-xs line-through">{product.price}</span>
                          </>
                        )}
                        {!product.discountPrice && (
                          <span className="text-sm font-bold">{product.price}</span>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="pt-1 pb-4 px-4">
                      <a href={product.affiliateUrl} target="_blank" rel="noopener noreferrer" className="w-full">
                        <Button className="w-full bg-primary hover:bg-primary-600 transition-colors flex items-center justify-center h-9">
                          <ShoppingBag size={14} className="mr-2" /> Shop Now
                        </Button>
                      </a>
                    </CardFooter>
                  </Card>
                ))}
              </div>
              
              {filteredProducts.length === 0 && (
                <div className="text-center py-16 bg-gray-50 rounded-xl">
                  <div className="flex flex-col items-center">
                    <ShoppingBag size={48} className="text-gray-300 mb-3" />
                    <p className="text-gray-600 font-medium">No products found</p>
                    <p className="text-gray-400 mt-1 max-w-md">
                      We couldn't find any products in the "{activeCategory === 'all' ? 'All Products' : formatCategoryLabel(activeCategory)}" category.
                    </p>
                    <Button 
                      variant="outline" 
                      className="mt-4" 
                      onClick={() => setActiveCategory('all')}
                    >
                      View All Products
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </section>
      </div>
    </UserLayout>
  );
};

export default Shop;
