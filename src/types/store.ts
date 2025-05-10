export interface Store {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  status: 'active' | 'inactive';
  admin: {
    username: string;
    email: string;
    password: string;
    status: 'active' | 'inactive';
  };
  createdAt: Date;
  updatedAt: Date;
} 