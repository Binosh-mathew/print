export interface Message {
  _id: string; // MongoDB uses _id
  id?: string; // Some APIs might return id instead of _id
  sender: {
    id: string;
    name: string;
    role: 'user' | 'admin' | 'developer' | 'store';
  };
  recipient: {
    id?: string; // Optional for role-based messages
    name: string;
    role: 'user' | 'admin' | 'developer' | 'store';
  };
  content: string;
  status: 'unread' | 'read';
  createdAt: string | Date; // API may return as string
  updatedAt: string | Date; // API may return as string
} 