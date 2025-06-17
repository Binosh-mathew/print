import { create } from "zustand";
import { authState, User } from "../types/auth";
import {
  loginUser,
  logoutUser,
  registerUser,
  updateUserProfile,
} from "@/api";

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

  _clearAuthData: async () => {
    localStorage.removeItem(authStoreKey);
  },
  _validateAuthData: () => {
    try {
      const authData = localStorage.getItem(authStoreKey);
      const parsedData = JSON.parse(authData || "{}");
      
      // Only validate based on expiration time for now 
      // to avoid async operations that can cause render loops
      return (
        typeof parsedData.expiresIn === "number" &&
        parsedData.expiresIn > Date.now() &&
        parsedData.user &&
        parsedData.user.id
      );
    } catch (error) {
      console.error("Error validating auth data:", error);
      return false;
    }
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
  },  register: async (name, email, password, confirmPassword) => {
    set({ loading: true, error: null });

    if (!name || !email || !password || !confirmPassword) {
      set({ error: "All fields are required", loading: false });
      throw new Error("All fields are required");
    }
    if (password.length < 6) {
      set({
        error: "Password must be at least 6 characters long",
        loading: false,
      });
      throw new Error("Password must be at least 6 characters long");
    }
    if (password !== confirmPassword) {
      set({ error: "Passwords do not match", loading: false });
      throw new Error("Passwords do not match");
    }    
    
    try {
      console.log("Auth Store: Calling registerUser API");
      await registerUser(name, email, password);
        console.log("Auth Store: Registration API call successful");
      // Since we've implemented email verification, the user isn't authenticated yet
      // Just return success and let the UI show the "check your email" message
      set({
        user: null,
        isAuthenticated: false,
        loading: false,
        isAdmin: false,
        role: null,
        error: null
      });
      
      // Don't store auth data since the user needs to verify email first
    } catch (error) {
      console.log("Auth Store: Registration error caught:", error);
      get()._clearAuthData();
      
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      
      set({
        user: null,
        isAuthenticated: false,
        loading: false,
        error: errorMessage
      });
      
      // Re-throw the error so the component can handle it
      throw error;
    }
  },

  updateUserProfile: async (userData: Partial<User>) => {
    set({ loading: true, error: null });

    if (!userData || !userData.id) {
      set({ error: "User data is required", loading: false });
      return;
    }
    try {
      const response = await updateUserProfile(userData.id, userData);
      const updatedUser: User = {
        id: response?.id,
        username: response?.username,
        email: response?.email,
        role: response?.role,
      };
      set({
        user: updatedUser,
        isAuthenticated: true,
        loading: false,
        isAdmin: updatedUser.role === "admin",
        role: updatedUser.role,
        error: null,
      });
      get()._setAuthData(updatedUser);
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
        loading: false,
      });
    }
  },
  logout: async () => {
    set({ loading: true, error: null });
    try {
      await logoutUser();
    } catch (error) {
      console.error("Logout failed:", error);
    }
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
