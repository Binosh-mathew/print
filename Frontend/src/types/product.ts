// Product type for affiliate products in the Offers & Shops section
export interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  discountPrice?: string;
  image: string;
  category: string;
  tags: string[];
  affiliateUrl: string;
  featured?: boolean;
}
