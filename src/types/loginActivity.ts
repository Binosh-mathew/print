export interface LoginActivity {
  id: string;
  userName: string;
  userRole: 'user' | 'admin' | 'developer';
  timestamp: Date;
  ipAddress: string;
  action: 'login' | 'logout';
  status: 'success' | 'failed';
} 