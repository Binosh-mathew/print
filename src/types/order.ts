
export interface FileDetails {
  file: File;
  copies: number;
  specialPaper: 'none' | 'glossy' | 'matte' | 'transparent';
  printType: 'blackAndWhite' | 'color';
  doubleSided: boolean;
  binding: {
    needed: boolean;
    type: 'spiralBinding' | 'staplingBinding' | 'hardcoverBinding' | 'none';
  };
  specificRequirements: string;
}

export interface OrderFormData {
  documentName: string;
  files: FileDetails[];
  description: string;
}

export interface Order {
  _id: string;
  id: string; // Keep both id and _id for compatibility
  orderId: string;
  customerName: string;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Completed';
  details?: string;
  orderDate?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
  userId?: string;
  files?: FileDetails[];
  copies?: number;
  colorType?: 'color' | 'blackAndWhite';
  doubleSided?: boolean;
  totalPrice?: number;
  userName?: string;
  documentName?: string;
}
