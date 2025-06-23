import { create } from "zustand";
import { authState, User } from "../types/auth";
import {
  loginUser,
  logoutUser,
  registerUser,
  googleAuthLogin,
  updateUserProfile,
} from "@/api";

const authStoreKey = "auth_data";
const jwtExpirationDays = 14 * 24 * 60 * 60; // 14 days in seconds

const useAuthStore = create<authState>((set, get) => ({
  //Internal methods to manage authentication data in localStorage
  _setAuthData: (user: User, token?: string) => {
    const authData = {
      user: user,
      expiresIn: Date.now() + jwtExpirationDays * 1000, // Convert seconds to milliseconds
      token: token, // Store the token if provided
    };

    try {
      localStorage.setItem(authStoreKey, JSON.stringify(authData));
    } catch (error) {
      console.error("Error saving auth data to localStorage:", error);
    }
  },

  _clearAuthData: async () => {
    localStorage.removeItem(authStoreKey);
  },
  _validateAuthData: () => {
    try {
      const authData = localStorage.getItem(authStoreKey);

      if (!authData) {
        console.log("No auth data found in localStorage");
        return false;
      }

      const parsedData = JSON.parse(authData);

      // Detailed validation with logging
      const hasExpiry = typeof parsedData.expiresIn === "number";
      const notExpired = parsedData.expiresIn > Date.now();
      const hasUser = !!parsedData.user;
      const hasUserId = hasUser && !!parsedData.user.id;

      // Only validate based on expiration time for now
      // to avoid async operations that can cause render loops
      return hasExpiry && notExpired && hasUser && hasUserId;
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
  loginWithGoogle: async (googleData) => {
    set({ loading: true, error: null });
    try {
      if (!googleData.email || !googleData.uid) {
        throw new Error(
          "Email and user ID are required for Google authentication"
        );
      }
      const response = await googleAuthLogin(googleData);

      if (!response?.user) {
        throw new Error("Invalid response from server");
      }

      // Make sure we have all required fields for the user
      if (!response.user.id || !response.user.email || !response.user.role) {
        throw new Error("Incomplete user data received from server");
      }

      const userData: User = {
        id: response.user.id,
        username: response.user.username,
        email: response.user.email,
        role: response.user.role,
        photoURL: response.user.photoURL,
      };


      // Extract the token from the response
      const token = response.token;

      get()._setAuthData(userData, token);

      // Now update the state
      set({
        user: userData,
        isAuthenticated: true,
        loading: false,
        isAdmin: userData.role === "admin",
        role: userData.role,
        error: null,
      });

      return true;
    } catch (error) {
      console.error("Google authentication error:", error);
      get()._clearAuthData();
      set({
        user: null,
        isAuthenticated: false,
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to authenticate with Google",
        isAdmin: false,
        role: null,
      });
      return false;
    }
  },
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

      // Extract the token
      const token = response?.token;

      set({
        user: userData,
        isAuthenticated: true,
        loading: false,
        isAdmin: userData.role === "admin",
        role: userData.role,
        error: null,
      });

      get()._setAuthData(userData, token);
    } catch (error) {
      get()._clearAuthData();
      set({
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
        loading: false,
      });
    }
  },
  register: async (name, email, password, confirmPassword) => {
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
      await registerUser(name, email, password);
      // Since we've implemented email verification, the user isn't authenticated yet
      // Just return success and let the UI show the "check your email" message
      set({
        user: null,
        isAuthenticated: false,
        loading: false,
        isAdmin: false,
        role: null,
        error: null,
      });

      // Don't store auth data since the user needs to verify email first
    } catch (error) {
      console.log("Auth Store: Registration error caught:", error);
      get()._clearAuthData();

      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";

      set({
        user: null,
        isAuthenticated: false,
        loading: false,
        error: errorMessage,
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

    // Clear local state first
    set({
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null,
      isAdmin: false,
      role: null,
    });

    // Clear localStorage
    get()._clearAuthData();

    // Also sign out from Firebase if it was used
    try {
      const { auth } = await import("@/config/firebase");
      await auth.signOut();
    } catch (firebaseError) {
      console.log("Firebase sign out error (non-critical):", firebaseError);
    }

    // Then try to notify the server (but don't block on it)
    try {
      await logoutUser();
    } catch (error) {
      console.log("Logout server notification failed:", error);
      // This is non-critical since we've already cleared local state
    }
  },
  checkauth: () => {
    set({ loading: true, error: null });

    try {
      const data = get()._getAuthData();

      if (data && get()._validateAuthData()) {

        set({
          user: data.user,
          isAuthenticated: true,
          role: data?.user?.role,
          isAdmin: data?.user?.role === "admin",
          loading: false,
          error: null,
        });
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
    } catch (error) {
      console.error("Error in checkauth:", error);
      get()._clearAuthData();
      set({
        user: null,
        isAuthenticated: false,
        loading: false,
        error: "Authentication check failed",
        isAdmin: false,
        role: null,
      });
      return false;
    }
  }, // Session monitoring and refresh mechanism
  refreshSession: async () => {

    // Check if Firebase user is still valid
    try {
      const { auth } = await import("@/config/firebase");
      const currentUser = auth.currentUser;

      if (currentUser) {
        // If we have an active Firebase user but no valid local auth,
        // this could indicate a state mismatch - refresh the auth
        if (!get()._validateAuthData()) {

          // Get fresh ID token
          const idToken = await currentUser.getIdToken(true);

          // Prepare user data for backend
          const googleData = {
            email: currentUser.email || "",
            name:
              currentUser.displayName ||
              currentUser.email?.split("@")[0] ||
              "User",
            photoURL: currentUser.photoURL || undefined,
            uid: currentUser.uid,
            idToken,
          };

          // Re-authenticate with the backend
          await get().loginWithGoogle(googleData);
        }
      }
    } catch (error) {
      console.error("Error refreshing Firebase session:", error);
    }

    // Return current auth state
    return get().checkauth();
  },

  initialize: () => {
    set({ loading: true });

    // Use setTimeout to ensure this runs after all other synchronous operations
    setTimeout(() => {
      const authResult = get().checkauth();
      set({ loading: false });

      // Set up periodic session refresh for long sessions
      // Only if user is authenticated, check every 30 minutes to ensure session is still valid
      if (authResult) {
        const sessionRefreshInterval = setInterval(() => {
          const isStillValid = get().refreshSession();
          if (!isStillValid) {
            clearInterval(sessionRefreshInterval);
          }
        }, 30 * 60 * 1000); // 30 minutes

        // Store interval ID for cleanup
        (window as any).__authRefreshInterval = sessionRefreshInterval;
      }
    }, 0);
  },
}));

export default useAuthStore;
