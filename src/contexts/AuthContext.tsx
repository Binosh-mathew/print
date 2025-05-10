import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { registerUser, loginUser, updateUserProfile as apiUpdateUserProfile } from '@/api';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Define types
interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'developer';
}

interface AuthResponse {
  token: string;
  user: User;
}

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, role?: 'user' | 'admin' | 'developer') => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUserProfile: (userData: Partial<User>) => Promise<void>;
};

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => false,
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

  // Check for existing user session on load
  useEffect(() => {
    const token = localStorage.getItem('printShopToken');
    if (token) {
      // Verify token with backend
      axios.get(`${API_BASE_URL}/auth/verify`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(response => {
        setUser(response.data.user);
      })
      .catch(() => {
        localStorage.removeItem('printShopToken');
      })
      .finally(() => {
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, []);

  // Login function
  const login = async (email: string, password: string, role: 'user' | 'admin' | 'developer' = 'user') => {
    setIsLoading(true);
    
    try {
      const response = await loginUser(email, password, role);
      setUser(response.user);
      localStorage.setItem('printShopToken', response.token);
      toast({
        title: "Login successful",
        description: `Welcome back, ${response.user.name}!`,
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
      const response = await registerUser(name, email, password);
      setUser(response.user);
      localStorage.setItem('printShopToken', response.token);
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
    localStorage.removeItem('printShopToken');
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
      
      // No need to update token in localStorage as it remains the same
      
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
