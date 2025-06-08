//

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

interface InternalMethods {
  _setAuthData: (user: User) => void;
  _clearAuthData: () => void;
  _validateAuthData: () => boolean;
  _getAuthData: () => { user: User; expiresIn: number } | null;
}

export interface authState extends InternalMethods {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error?: string | null;
  role: string | null;
  isAdmin: boolean;
  login: (email: string, password: string, role: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    confirmPassword: string
  ) => Promise<void>;
  updateUserProfile: (userData: Partial<User>) => Promise<void>;
  logout: () => void;
  checkauth: () => boolean | void;
  initialize: () => void;
}
