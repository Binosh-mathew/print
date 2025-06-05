import { create } from "zustand";
import { authState } from "../types/auth";
import { loginUser } from "@/api";


const authStoreKey = "auth_data";
const jwtExpirationDays = 14* 24 * 60 * 60 ; // 14 days in seconds

const useAuthStore = create<authState>((set) => ({
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
      set({
        user: response?.data?.user,
        isAuthenticated: true,
        loading: false,
        isAdmin: response?.data?.user?.role === "admin",
        role: response?.data?.user?.role,
        error: null,
      });

      
      localStorage.setItem(
        authStoreKey,
        JSON.stringify(response?.data?.user)
      );
    } catch (error) {
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
    localStorage.removeItem(authStoreKey);
  },

  checkauth: async () => {
    const user = localStorage.getItem(authStoreKey);
    if (user) {
      set({
        user: JSON.parse(user),
        isAuthenticated: true,
        loading: false,
        isAdmin: JSON.parse(user).role === "admin",
        error: null,
      });
    }
  },
}));

export default useAuthStore;
