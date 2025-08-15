import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import useAuthStore from "@/store/authStore";
import { checkEmailExists } from "@/api";
import { validateEmail, validatePassword, isPrivateBrowsingMode } from "@/utils/registrationUtils";

export const useRegistration = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  
  const { register, loginWithGoogle, isAuthenticated, loading, error } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error) {
      console.log("Error detected in auth store:", error);
      // Show a toast notification with the error message
      toast({
        title: "Registration Failed",
        description: error || "Please check your input and try again.",
        variant: "destructive",
      });

      // Reset registration success if there's an error
      setRegistrationSuccess(false);

      // Set email error for existing user
      if (error.includes("User already exists")) {
        setEmailError(
          "This email is already registered. Please use a different email or try logging in."
        );
      }
    }
  }, [error]);

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
        title: "Registration failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Registration form submitted");

    // Reset previous errors and success state
    setEmailError("");
    setRegistrationSuccess(false);
    setPasswordError("");
    setConfirmPasswordError("");

    // Validate email format
    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      setPasswordError(passwordValidation.message);
      return;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      return;
    }

    try {
      // First check if the email already exists
      console.log("Checking if email exists before registration:", email);
      const exists = await checkEmailExists(email);

      if (exists) {
        console.log("Email already exists, showing error message");
        setEmailError(
          "This email is already registered. Please use a different email or try logging in."
        );
        return;
      }

      console.log("Email is available, proceeding with registration");
      await register(name, email, password, confirmPassword);

      // Only set success if we don't have any errors
      const currentError = useAuthStore.getState().error;
      console.log("After registration attempt - Error state:", currentError);

      if (!currentError) {
        console.log("Registration successful, showing success screen");
        setRegistrationSuccess(true);
      } else {
        console.log("Registration failed with error:", currentError);
      }
    } catch (error: any) {
      console.error("Registration error caught in component:", error);
      setRegistrationSuccess(false);

      // Handle specific errors
      if (error.message && error.message.includes("User already exists")) {
        console.log("Setting email error for existing user");
        setEmailError(
          "This email is already registered. Please use a different email or try logging in."
        );
      }
    }
  };

  const handleResendVerification = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/resend-verification`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

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

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (emailError && validateEmail(value)) {
      setEmailError("");
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    
    // Validate password
    if (value) {
      const validation = validatePassword(value);
      setPasswordError(validation.valid ? "" : validation.message);
    } else {
      setPasswordError("");
    }
    
    // Check if passwords match whenever password changes
    if (confirmPassword && confirmPassword !== value) {
      setConfirmPasswordError("Passwords do not match");
    } else if (confirmPassword) {
      setConfirmPasswordError("");
    }
    
    if (passwordError && validatePassword(value).valid) {
      setPasswordError("");
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    
    // Check if passwords match
    if (value && password !== value) {
      setConfirmPasswordError("Passwords do not match");
    } else {
      setConfirmPasswordError("");
    }
  };

  return {
    // Form state
    name,
    setName,
    email,
    password,
    confirmPassword,
    emailError,
    registrationSuccess,
    passwordError,
    confirmPasswordError,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    googleLoading,
    
    // Auth state
    loading,
    error,
    
    // Actions
    handleGoogleSignIn,
    handleSubmit,
    handleResendVerification,
    handleEmailChange,
    handlePasswordChange,
    handleConfirmPasswordChange,
    navigate
  };
};
