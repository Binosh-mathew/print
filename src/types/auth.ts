//

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  photoURL?: string;
}

export interface GoogleAuthData {
  email: string;
  name: string;
  photoURL?: string;
  uid: string;
}

interface InternalMethods {
  _setAuthData: (user: User, token?: string) => void;
  _clearAuthData: () => void;
  _validateAuthData: () => boolean | null;
  _getAuthData: () => { user: User; expiresIn: number; token?: string } | null;
}

export interface authState extends InternalMethods {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error?: string | null;
  role: string | null;
  isAdmin: boolean;
  loginWithGoogle: (googleData: GoogleAuthData) => Promise<boolean>;
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
  refreshSession: () => Promise<boolean | void>;
  initialize: () => void;
}
