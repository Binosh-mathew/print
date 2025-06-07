import { create } from "zustand";
import { authState, User } from "../types/auth";
import { loginUser } from "@/api";

const authStoreKey = "auth_data";
const jwtExpirationDays = 14 * 24 * 60 * 60; // 14 days in seconds

const useAuthStore = create<authState>((set, get) => ({
  //Internal methods to manage authentication data in localStorage
  _setAuthData: (user: User) => {
    const authData = {
      user: user,
      expiresIn: Date.now() + jwtExpirationDays * 1000, // Convert seconds to milliseconds
    };

    localStorage.setItem(authStoreKey, JSON.stringify(authData));
  },

  _clearAuthData: () => {
    localStorage.removeItem(authStoreKey);
  },

  _validateAuthData: () => {
    const authData = localStorage.getItem(authStoreKey);
    const parsedData = JSON.parse(authData || "{}");
    return (
      typeof parsedData.expiresIn === "number" &&
      parsedData.expiresIn > Date.now()
    );
  },

  _getAuthData: () => {
    try {
      const authData = localStorage.getItem(authStoreKey);
      return authData ? JSON.parse(authData) : null;
    } catch {
      return null;
    }
  },

  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  isAdmin: false,
  role: null,

  login: async (email: string, password: string, role: string) => {
    set({ loading: true, error: null });
    try {
      const response = await loginUser(email, password, role);

      const userData: User = {
        id: response?.id,
        username: response?.username,
        email: response?.email,
        role: response?.role,
      };
      set({
        user: userData,
        isAuthenticated: true,
        loading: false,
        isAdmin: userData.role === "admin",
        role: userData.role,
        error: null,
      });

      get()._setAuthData(userData);
    } catch (error) {
      get()._clearAuthData();
      set({
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
        loading: false,
      });
    }
  },

  logout: async () => {
    set({
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null,
      isAdmin: false,
    });
    get()._clearAuthData();
  },

  checkauth: () => {
    set({ loading: true, error: null });
    const data = get()._getAuthData();
    if (data && get()._validateAuthData()) {
      set({
        user: data.user,
        isAuthenticated: true,
        role: data?.user?.role,
        isAdmin: data?.user?.role === "admin",
      });
      set({ loading: false, error: null });
      return true;
    } else {
      get()._clearAuthData();
      set({
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
        isAdmin: false,
        role: null,
      });
      return false;
    }
  },

  initialize: () => {
    set({ loading: true });
    get().checkauth();
    set({ loading: false });
  },
}));

export default useAuthStore;
