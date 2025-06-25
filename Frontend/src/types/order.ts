export interface FileMetadata {
  name: string;
  type: string;
  size: number;
  lastModified: number;
}

export interface FileDetails {
  file: File | FileMetadata;
  copies: number;
  specialPaper: "none" | "glossy" | "matte" | "transparent";
  printType: "blackAndWhite" | "color"| "mixed";
  colorPages: string; // Pages to be printed in color when printType is "mixed"
  doubleSided: boolean;
  binding: {
    needed: boolean;
    type: "spiralBinding" | "staplingBinding" | "hardcoverBinding" | "none";
  };
  specificRequirements: string;
  pageCount?: number; // Optional page count for more accurate pricing
}

export interface OrderFormData {
  documentName: string;
  files: FileDetails[];
  description: string;
  storeId: string;
}

export interface Order {
  _id: string;
  id: string; // Keep both id and _id for compatibility
  orderId: string;
  customerName: string;
  status:
    | "Pending"
    | "Processing"
    | "Shipped"
    | "Delivered"
    | "Cancelled"
    | "Completed";
  details?: string;
  orderDate?: string;
  createdAt: string;
  updatedAt?: string;
  __v?: number;
  userId?: string;
  files?: FileDetails[];
  copies?: number;
  colorType?: "color" | "blackAndWhite";
  doubleSided?: boolean;
  totalPrice?: number;
  userName?: string;
  documentName?: string;
  storeId?: string;
  storeName?: string;
}
