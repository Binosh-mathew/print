//

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

export interface authState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error?: string | null;
  role: "user" | "admin" | "developer" | null;
  isAdmin: boolean;
  login: (email: string, password: string, role: string) => void;
  logout: () => void;
  checkauth: () => void;
}
