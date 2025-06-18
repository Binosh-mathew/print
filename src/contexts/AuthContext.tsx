import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import {
  registerUser,
  loginUser,
  googleAuthLogin,
  updateUserProfile as apiUpdateUserProfile,
} from "@/api";
import { auth, googleProvider } from "@/config/firebase";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";

// Define types
interface User {
  id: string;
  name: string;
  username?: string; // Added username field to match MongoDB data structure
  email: string;
  role: "user" | "admin" | "developer";
  token?: string;
  photoURL?: string;
}

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    email: string,
    password: string,
    role?: "user" | "admin" | "developer"
  ) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUserProfile: (userData: Partial<User>) => Promise<User>;
  signInWithGoogle: () => Promise<boolean>;
};

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => false,
  register: async () => {},
  logout: () => {},
  updateUserProfile: async () => {
    throw new Error("Not implemented");
    return {} as User; // This line is never reached due to the error above
  },
  signInWithGoogle: async () => false,
});

// Hook to use auth context
export const useAuth = () => useContext(AuthContext);

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Check for existing user session on load
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("printShopUser");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser && typeof parsedUser === "object") {
          setUser(parsedUser);
        } else {
          // If the stored data is not a valid user object, remove it
          localStorage.removeItem("printShopUser");
        }
      }
    } catch (error) {
      // If there's any error parsing the stored data, remove it
      console.error("Error parsing stored user data:", error);
      localStorage.removeItem("printShopUser");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Login function
  const login = async (
    email: string,
    password: string,
    role: "user" | "admin" | "developer" = "user"
  ) => {
    setIsLoading(true);

    try {
      const response = await loginUser(email, password, role);

      // Ensure we have a name property for display purposes
      // For admin users, the backend might return username but not name
      const userData = {
        ...response,
        // If name is missing but username exists, use username as name
        name: response.name || response.username || email.split("@")[0],
      };

      setUser(userData);
      localStorage.setItem("printShopUser", JSON.stringify(userData));

      // Use the display name (name or username) for the welcome message
      const displayName = userData.name || userData.username || "user";

      toast({
        title: "Login successful",
        description: `Welcome back, ${displayName}!`,
      });
      return true;
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "An error occurred during login",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);

    try {
      const userData = await registerUser(name, email, password);

      setUser(userData);
      localStorage.setItem("printShopUser", JSON.stringify(userData));
      toast({
        title: "Registration successful",
        description: `Welcome, ${name}!`,
      });
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "An error occurred during registration",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem("printShopUser");
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  // Update user profile function
  const updateUserProfile = async (userData: Partial<User>) => {
    if (!user) {
      toast({
        title: "Not logged in",
        description: "You must be logged in to update your profile",
        variant: "destructive",
      });
      throw new Error("User not logged in");
    }

    try {
      setIsLoading(true);

      // If updating name, also update username field for compatibility
      const updatedFields = { ...userData };
      if (userData.name) {
        updatedFields.username = userData.name;
      }

      // Call the API to update the user profile
      const updatedUser = await apiUpdateUserProfile(user.id, updatedFields);

      // Update local user state
      const newUserData = {
        ...user,
        ...updatedFields,
        // Ensure both name and username are updated
        name: updatedFields.name || user.name,
        username: updatedFields.name || user.username || user.name,
      };

      setUser(newUserData);

      // Update local storage
      localStorage.setItem("printShopUser", JSON.stringify(newUserData));

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });

      return updatedUser;
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message || "An error occurred during profile update",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  // Google Sign-in method
  const signInWithGoogle = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const userData = result.user;

      // Call your backend to create or get the user
      const googleData = {
        email: userData.email || "",
        name: userData.displayName || userData.email?.split("@")[0] || "User",
        photoURL: userData.photoURL || undefined,
        uid: userData.uid
      };
      
      const backendUserData = await googleAuthLogin(googleData);

      // Prepare user data for context
      const userToSave: User = {
        id: backendUserData.user.id || userData.uid,
        name: backendUserData.user.username || userData.displayName || "User",
        email: userData.email || "",
        role: backendUserData.user.role || "user",
        token: backendUserData.token,
        photoURL: userData.photoURL || undefined,
      };

      setUser(userToSave);
      localStorage.setItem("printShopUser", JSON.stringify(userToSave));

      toast({
        title: "Login successful",
        description: `Welcome, ${userToSave.name}!`,
      });

      return true;
    } catch (error: any) {
      console.error("Google sign-in error:", error);
      toast({
        title: "Login failed",
        description: error.message || "Failed to sign in with Google",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateUserProfile,
        signInWithGoogle,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
