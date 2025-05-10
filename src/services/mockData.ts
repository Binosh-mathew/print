// Types
import type { Order as OrderType, FileDetails } from '@/types/order';

export type Order = OrderType;

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'developer';
  password?: string;
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
    id: 'dev1',
    name: 'System Developer',
    email: 'developer@system.com',
    role: 'developer',
    password: 'dev123',
    createdAt: '2024-01-01T00:00:00Z',
  },
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

export interface Admin {
  id: string;
  name: string;
  email: string;
  password: string;
  storeId: string;
  lastLogin: string;
  lastLoginIp: string;
  createdAt: string;
}

export interface Store {
  id: string;
  name: string;
  location: string;
  status: 'active' | 'inactive';
  adminId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlatformStats {
  dailyOrders: number;
  monthlyOrders: number;
  monthlyRevenue: number;
  activeStores: number;
  activeAdmins: number;
  storageUsed: number;
  totalStorage: number;
}

export interface LoginActivity {
  id: string;
  userId: string;
  userName: string;
  userRole: 'developer' | 'admin';
  timestamp: string;
  ipAddress: string;
  action: 'login' | 'logout' | 'failed_login';
}

// Mock admins array
export const admins: Admin[] = [
  {
    id: 'admin1',
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    storeId: 'store1',
    lastLogin: '2024-03-15T10:00:00Z',
    lastLoginIp: '192.168.1.1',
    createdAt: '2024-03-15T10:00:00Z',
  },
];

// Mock stores array
export const stores: Store[] = [
  {
    id: 'store1',
    name: 'Main Print Shop',
    location: 'Downtown',
    status: 'active',
    adminId: 'admin1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-03-15T10:00:00Z',
  },
];

// Mock platform statistics
export const platformStats: PlatformStats = {
  dailyOrders: 45,
  monthlyOrders: 1250,
  monthlyRevenue: 25000,
  activeStores: stores.filter(s => s.status === 'active').length,
  activeAdmins: admins.length,
  storageUsed: 92, // GB
  totalStorage: 100 // GB
};

// Mock login activity
export const loginActivity: LoginActivity[] = [
  {
    id: 'log1',
    userId: 'dev1',
    userName: 'Developer One',
    userRole: 'developer',
    timestamp: '2024-03-15T10:30:00Z',
    ipAddress: '192.168.1.100',
    action: 'login'
  },
  {
    id: 'log2',
    userId: 'admin1',
    userName: 'John Admin',
    userRole: 'admin',
    timestamp: '2024-03-15T09:15:00Z',
    ipAddress: '192.168.1.101',
    action: 'login'
  }
];

// Platform maintenance mode state
export let maintenanceMode = false;

// Function to toggle maintenance mode
export const toggleMaintenanceMode = (enabled: boolean) => {
  maintenanceMode = enabled;
};

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'admin' | 'developer';
  content: string;
  timestamp: string;
  read: boolean;
  storeId?: string;
  storeName?: string;
}

// Mock messages data
export const messages: Message[] = [
  {
    id: 'msg1',
    senderId: 'dev1',
    senderName: 'Developer One',
    senderRole: 'developer',
    content: 'Initial system setup completed',
    timestamp: '2024-03-14T10:00:00Z',
    read: true,
    storeId: 'store1',
    storeName: 'Downtown Print Shop'
  },
  {
    id: 'msg2',
    senderId: 'admin1',
    senderName: 'Admin One',
    senderRole: 'admin',
    content: 'Thank you for the update',
    timestamp: '2024-03-14T10:30:00Z',
    read: true,
    storeId: 'store1',
    storeName: 'Downtown Print Shop'
  }
];

// Function to add a new message
export const addMessage = (messageData: Omit<Message, 'id' | 'timestamp'>) => {
  const newMessage: Message = {
    ...messageData,
    id: `msg${messages.length + 1}`,
    timestamp: new Date().toISOString(),
  };
  messages.unshift(newMessage);
  return newMessage;
};

// Function to mark message as read
export const markMessageAsRead = (messageId: string) => {
  const message = messages.find(m => m.id === messageId);
  if (message) {
    message.read = true;
  }
};

// Function to create a new admin
export const createAdmin = (adminData: Omit<Admin, 'id' | 'lastLogin' | 'lastLoginIp' | 'createdAt'>) => {
  const newAdmin: Admin = {
    ...adminData,
    id: `admin${admins.length + 1}`,
    lastLogin: '',
    lastLoginIp: '',
    createdAt: new Date().toISOString(),
  };
  admins.push(newAdmin);
  return newAdmin;
};

// Function to create a new store
export const createStore = (storeData: Omit<Store, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => {
  const newStore: Store = {
    ...storeData,
    id: `store${stores.length + 1}`,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  stores.push(newStore);
  return newStore;
};
