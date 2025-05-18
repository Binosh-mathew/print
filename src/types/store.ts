export interface Store {
  _id: string;
  id?: string;
  name: string;
  address?: string;
  location?: string;
  phone?: string;
  email?: string;
  status: 'active' | 'inactive';
  admin: {
    username: string;
    email: string;
    password: string;
    status?: 'active' | 'inactive';
    createdAt?: Date;
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