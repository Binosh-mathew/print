import { create } from "zustand";
import { authState } from "../types/auth";
import { loginUser } from "@/api";

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
        "printShopUser",
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
    localStorage.removeItem("printShopUser");
  },

  checkauth: async () => {
    const user = localStorage.getItem("printshopUser");
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
