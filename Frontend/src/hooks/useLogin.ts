import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import useAuthStore from "@/store/authStore";
import { isPrivateBrowsingMode } from "@/utils/registrationUtils";

export const useLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  
  const { login, loginWithGoogle, isAuthenticated, error, loading } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if coming from email verification
  const urlParams = new URLSearchParams(location.search);
  const verified = urlParams.get('verified');

  useEffect(() => {
    // Check if the URL has a verified query parameter
    if (verified === 'true') {
      setVerificationSuccess(true);
      toast({
        title: "Email verified successfully!",
        description: "Your email has been verified. You can now log in.",
        variant: "default",
      });
    }
  }, [verified]);

  useEffect(() => {
    // Don't redirect immediately to avoid race conditions
    if (isAuthenticated) {
      // Small delay to ensure state is stable before redirecting
      const redirectTimer = setTimeout(() => {
        navigate("/dashboard");
      }, 300);
      
      return () => clearTimeout(redirectTimer);
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error) {
      // Show a toast notification with the error message
      toast({
        title: "Login Failed",
        description: error || "Invalid username or password",
        variant: "destructive",
      });
    }
  }, [error]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNeedsVerification(false); // Reset this state
    
    try {
      await login(email, password, "user");
    } catch (err: any) {
      // Check if the error is due to unverified email
      if (err?.response?.data?.needsVerification) {
        setNeedsVerification(true);
      }
    }
  };
  
  const handleResendVerification = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: "Email Sent",
          description: "Verification email has been resent to your inbox.",
        });
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to resend verification email.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resend verification email. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle Google sign-in
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      // Import Firebase auth and provider
      const { auth, googleProvider } = await import("@/config/firebase");
      const { signInWithPopup, getAdditionalUserInfo, signInWithRedirect } = await import("firebase/auth");
      
      // Check if running in private/incognito mode which can cause issues with popups
      const isPrivateMode = await isPrivateBrowsingMode();
      
      let result;
      try {
        // Use popup for standard mode, redirect for private browsing
        if (isPrivateMode) {
          // Redirect flow is better for private browsing
          toast({
            title: "Using redirect sign-in",
            description: "You'll be redirected to Google for authentication",
          });
          await signInWithRedirect(auth, googleProvider);
          return; // Page will reload after redirect
        } else {
          // Use popup for normal browsing
          result = await signInWithPopup(auth, googleProvider);
        }
      } catch (error: any) {
        // Handle specific Firebase Auth errors
        console.error("Firebase auth error:", error?.code || error);
        
        if (error?.code === 'auth/popup-blocked') {
          toast({
            title: "Popup Blocked",
            description: "Please allow popups for this site to use Google Sign-In",
            variant: "destructive",
          });
          setGoogleLoading(false);
          return;
        }
        
        if (error?.code === 'auth/popup-closed-by-user') {
          toast({
            title: "Sign-in cancelled",
            description: "Google sign-in was cancelled",
            variant: "default",
          });
          setGoogleLoading(false);
          return;
        }
        
        // For any other popup errors, try redirect as fallback
        try {
          toast({
            title: "Trying alternative sign-in method",
            description: "We'll redirect you to sign in with Google",
          });
          await signInWithRedirect(auth, googleProvider);
          return; // Page will reload after redirect
        } catch (redirectError) {
          throw redirectError; // Propagate error to outer catch block
        }
      }
      
      const userData = result.user;
      
      // Check if this is a new or existing user
      const additionalInfo = getAdditionalUserInfo(result);
      const isNewUser = additionalInfo?.isNewUser;
      
      if (!userData.email) {
        throw new Error("Unable to get email from Google account. Please try another account.");
      }
      
      // Prepare data for backend
      const googleData = {
        email: userData.email,
        name: userData.displayName || userData.email?.split("@")[0] || "User",
        photoURL: userData.photoURL || undefined,
        uid: userData.uid
      };

      // Use our store to handle authentication with backend
      const success = await loginWithGoogle(googleData);
      if (success) {
        if (isNewUser) {
          // Show welcome message for new users
          toast({
            title: "Welcome to PrintSpark!",
            description: "Your account has been created successfully with Google.",
          });
        } else {
          toast({
            title: "Welcome back!",
            description: "You've successfully signed in with Google.",
          });
        }
        // Let the useEffect handle the navigation with a short delay
        // to ensure state is fully updated before redirect
      }
    } catch (error: any) {
      console.error("Google sign in error:", error);
      // Handle different types of Firebase Auth errors
      let errorMessage = "Failed to sign in with Google. Please try again.";
      
      // Parse Firebase error codes
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = "Google sign-in was cancelled. Please try again.";
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = "Pop-up was blocked by your browser. Please enable pop-ups for this site.";
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        errorMessage = "An account already exists with the same email. Try signing in with a different method.";
      }
      
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  return {
    // Form state
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    needsVerification,
    setNeedsVerification,
    verificationSuccess,
    googleLoading,
    
    // Auth state
    loading,
    error,
    
    // Actions
    handleSubmit,
    handleResendVerification,
    handleGoogleSignIn
  };
};
