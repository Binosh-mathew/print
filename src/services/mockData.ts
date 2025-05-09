
// Types
import type { Order as OrderType, FileDetails } from '@/types/order';

export type Order = OrderType;

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  orders?: Order[];
  createdAt: string;
}

export interface PricingSettings {
  blackAndWhite: {
    singleSided: number;
    doubleSided: number;
  };
  color: {
    singleSided: number;
    doubleSided: number;
  };
  binding: {
    spiralBinding: number;
    staplingBinding: number;
    hardcoverBinding: number;
  };
  paperTypes: {
    normal: number;
    glossy: number;
    matte: number;
    transparent: number;
  };
}

// Mock pricing data
export const pricingSettings: PricingSettings = {
  blackAndWhite: {
    singleSided: 2,
    doubleSided: 3,
  },
  color: {
    singleSided: 5,
    doubleSided: 8,
  },
  binding: {
    spiralBinding: 30,
    staplingBinding: 15,
    hardcoverBinding: 100,
  },
  paperTypes: {
    normal: 0,
    glossy: 5,
    matte: 7,
    transparent: 10,
  }
};

// Mock users data
export const users: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    createdAt: '2025-01-15T08:00:00Z',
  },
  {
    id: '2',
    name: 'John Doe',
    email: 'user@example.com',
    role: 'user',
    createdAt: '2025-01-15T10:30:00Z',
  },
  {
    id: '3',
    name: 'Sarah Smith',
    email: 'sarah@example.com',
    role: 'user',
    createdAt: '2025-02-05T09:15:00Z',
  },
];

// Mock orders data
export const orders: Order[] = [
  {
    _id: '1',
    id: '1',
    orderId: 'ORD1001',
    userId: '2',
    userName: 'John Doe',
    customerName: 'John Doe',
    documentName: 'Project Report.pdf',
    copies: 2,
    colorType: 'color',
    doubleSided: true,
    status: 'Completed',
    totalPrice: 16,
    createdAt: '2025-03-10T14:30:00Z',
    updatedAt: '2025-03-11T10:15:00Z',
    files: [
      {
        file: new File([], 'Project Report.pdf'),
        copies: 2,
        specialPaper: 'glossy',
        printType: 'color',
        doubleSided: true,
        binding: {
          needed: true,
          type: 'spiralBinding'
        },
        specificRequirements: ''
      }
    ]
  },
  {
    _id: '2',
    id: '2',
    orderId: 'ORD1002',
    userId: '2',
    userName: 'John Doe',
    customerName: 'John Doe',
    documentName: 'Assignment.docx',
    copies: 1,
    colorType: 'blackAndWhite',
    doubleSided: false,
    status: 'Pending',
    totalPrice: 2,
    createdAt: '2025-04-05T09:45:00Z',
    updatedAt: '2025-04-05T09:45:00Z',
    files: [
      {
        file: new File([], 'Assignment.docx'),
        copies: 1,
        specialPaper: 'none',
        printType: 'blackAndWhite',
        doubleSided: false,
        binding: {
          needed: false,
          type: 'none'
        },
        specificRequirements: ''
      }
    ]
  },
  {
    _id: '3',
    id: '3',
    orderId: 'ORD1003',
    userId: '3',
    userName: 'Sarah Smith',
    customerName: 'Sarah Smith',
    documentName: 'Research Paper.pdf',
    copies: 3,
    colorType: 'color',
    doubleSided: true,
    status: 'Processing',
    totalPrice: 24,
    createdAt: '2025-04-08T11:20:00Z',
    updatedAt: '2025-04-09T08:30:00Z',
    files: [
      {
        file: new File([], 'Research Paper.pdf'),
        copies: 3,
        specialPaper: 'matte',
        printType: 'color',
        doubleSided: true,
        binding: {
          needed: true,
          type: 'hardcoverBinding'
        },
        specificRequirements: 'Please include a plastic cover'
      }
    ]
  },
  {
    _id: '4',
    id: '4',
    orderId: 'ORD1004',
    userId: '3',
    userName: 'Sarah Smith',
    customerName: 'Sarah Smith',
    documentName: 'Presentation.pptx',
    copies: 5,
    colorType: 'color',
    doubleSided: false,
    status: 'Completed',
    totalPrice: 25,
    createdAt: '2025-03-20T15:10:00Z',
    updatedAt: '2025-03-21T09:45:00Z',
    files: [
      {
        file: new File([], 'Presentation.pptx'),
        copies: 5,
        specialPaper: 'transparent',
        printType: 'color',
        doubleSided: false,
        binding: {
          needed: false,
          type: 'none'
        },
        specificRequirements: 'High quality color printing'
      }
    ]
  },
];

// Mock stats data
export const stats = {
  totalOrders: orders.length,
  pendingOrders: orders.filter(order => order.status === 'Pending').length,
  completedOrders: orders.filter(order => order.status === 'Completed').length,
  totalUsers: users.filter(user => user.role === 'user').length,
  totalRevenue: orders.reduce((total, order) => total + order.totalPrice, 0),
};

// Calculate price for an order
export const calculateOrderPrice = (
  copies: number,
  colorType: 'color' | 'blackAndWhite',
  doubleSided: boolean
): number => {
  const pricePerCopy = colorType === 'color'
    ? (doubleSided ? pricingSettings.color.doubleSided : pricingSettings.color.singleSided)
    : (doubleSided ? pricingSettings.blackAndWhite.doubleSided : pricingSettings.blackAndWhite.singleSided);
  
  return copies * pricePerCopy;
};

// Generate a new order ID
export const generateOrderId = (): string => {
  return `ORD${(orders.length + 1001).toString()}`;
};
