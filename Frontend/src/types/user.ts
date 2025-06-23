export interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin' | 'developer';
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
} 