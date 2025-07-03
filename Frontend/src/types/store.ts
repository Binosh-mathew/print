export interface Store {
  _id: string;
  id?: string;
  name: string;
  address?: string;
  location?: string;
  phone?: string;
  email?: string;
  status: 'active' | 'inactive';
  pendingOrdersCount?: number; // Added field for pending orders count
  admin: {
    username: string;
    email: string;
    password: string;
    status?: 'active' | 'inactive';
    createdAt?: Date;
  };
  features?: {
    binding?: {
      isAvailable: boolean;
      spiralBinding: boolean;
      staplingBinding: boolean;
      hardcoverBinding: boolean;
    };
    availablePaperTypes?: {
      normal: boolean;
      glossy: boolean;
      matte: boolean;
      transparent: boolean;
    };
    colorPrinting?: boolean;
    blackAndWhitePrinting?: boolean;
  };
  pricing?: {
    blackAndWhite?: {
      singleSided: number;
      doubleSided: number;
    };
    color?: {
      singleSided: number;
      doubleSided: number;
    };
    binding?: {
      spiralBinding: number;
      staplingBinding: number;
      hardcoverBinding: number;
    };
    paperTypes?: {
      normal: number;
      glossy: number;
      matte: number;
      transparent: number;
    };
    lastUpdated?: Date;
  };
  createdAt?: Date;
  updatedAt?: Date;
}