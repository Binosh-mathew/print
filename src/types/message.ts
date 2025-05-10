export interface Message {
  id: string;
  sender: {
    id: string;
    name: string;
    role: 'user' | 'admin' | 'developer';
  };
  recipient: {
    id: string;
    name: string;
    role: 'user' | 'admin' | 'developer';
  };
  content: string;
  status: 'unread' | 'read';
  createdAt: Date;
  updatedAt: Date;
} 