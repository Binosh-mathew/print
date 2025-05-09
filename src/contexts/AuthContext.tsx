
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { registerUser, loginUser, updateUserProfile as apiUpdateUserProfile } from '@/api';
import { shouldUseMockData } from '@/utils/orderUtils';

// Define types
type User = {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, role?: 'user' | 'admin') => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUserProfile: (userData: Partial<User>) => Promise<void>;
};

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  updateUserProfile: async () => {},
});

// Hook to use auth context
export const useAuth = () => useContext(AuthContext);

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const useMockData = shouldUseMockData();

  // Check for existing user session on load
  useEffect(() => {
    const storedUser = localStorage.getItem('printShopUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  // Login function
  const login = async (email: string, password: string, role: 'user' | 'admin' = 'user') => {
    setIsLoading(true);
    
    try {
      const userData = await loginUser(email, password, role);
      
      setUser(userData);
      localStorage.setItem('printShopUser', JSON.stringify(userData));
      toast({
        title: "Login successful",
        description: `Welcome back, ${userData.name}!`,
      });
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "An error occurred during login",
        variant: "destructive",
      });
      throw error;
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
      localStorage.setItem('printShopUser', JSON.stringify(userData));
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
    localStorage.removeItem('printShopUser');
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
      // Call the API to update the user profile
      const updatedUser = await apiUpdateUserProfile(user.id, userData);
      
      // Update local user state
      const newUserData = { ...user, ...userData };
      setUser(newUserData);
      
      // Update local storage
      localStorage.setItem('printShopUser', JSON.stringify(newUserData));
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
