import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Loader2, AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";
import useAuthStore from "@/store/authStore";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { checkEmailExists } from "@/api";

const Register = () => {
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
  }, [isAuthenticated]);

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

  const validateEmail = (email: string) => {
    // RFC 5322 compliant email regex
    const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailRegex.test(email);
  };
  // Password validation function
  const validatePassword = (password: string): { valid: boolean; message: string } => {
    // Password requirements:
    // 1. At least 6 characters
    // 2. At least one uppercase letter
    // 3. At least one lowercase letter
    // 4. At least one number
    // 5. At least one special character

    if (password.length < 6) {
      return {
        valid: false,
        message: "Password must be at least 6 characters long",
      };
    }

    if (!/[A-Z]/.test(password)) {
      return {
        valid: false,
        message: "Password must contain at least one uppercase letter",
      };
    }

    if (!/[a-z]/.test(password)) {
      return {
        valid: false,
        message: "Password must contain at least one lowercase letter",
      };
    }

    if (!/[0-9]/.test(password)) {
      return {
        valid: false,
        message: "Password must contain at least one number",
      };
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return {
        valid: false,
        message: "Password must contain at least one special character",
      };
    }

    return {
      valid: true,
      message: "Password meets all requirements",
    };
  };

  // Helper function to detect private browsing mode
  const isPrivateBrowsingMode = () => {
    return new Promise((resolve) => {
      const yes = () => resolve(true);
      const no = () => resolve(false);

      // Try to use localStorage as a test (often disabled in private mode)
      try {
        const testKey = "test";
        localStorage.setItem(testKey, testKey);
        localStorage.removeItem(testKey);
        no();
      } catch (e) {
        // If localStorage fails, it might be private mode
        yes();
      }
    });
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
            title: "Welcome to PrintSpark Studio!",
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
  
  return (    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-6">
      <div className="bg-white shadow-2xl rounded-3xl w-full max-w-md p-5 transform animate-scale-in"><div className="flex flex-col items-center mb-3">          <Link to="/" className="text-center block transition-transform hover:scale-105 flex flex-col items-center">            <div className="h-12 w-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center mb-2 shadow-md mx-auto">
              <span className="text-lg font-extrabold text-white flex items-center justify-center h-full w-full">PS</span>
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
              PrintSpark
            </span>
          </Link>          <h2 className="mt-2 text-center text-xl font-bold text-gray-900 animate-slide-in-bottom">
            Create an Account
          </h2>
          <p className="mt-0.5 text-center text-xs text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
              Sign in
            </Link>
          </p>
        </div>          
        
        {registrationSuccess ? (
          <div className="text-center space-y-4 animate-scale-in">
            <div className="flex justify-center">
              <div className="bg-green-100 rounded-full p-3 animate-pulse-soft">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              </div>
            </div>
            <h3 className="text-xl font-medium text-gray-900">
              Registration Successful!
            </h3>
            <p className="text-gray-600">
              We've sent a verification link to your email address. Please check
              your inbox and click the link to verify your account.
            </p>
            <div className="mt-4">
              <Button
                type="button"
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white transition-all"
                onClick={() => navigate("/login")}
              >
                Proceed to Login
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Didn't receive the email? Check your spam folder or{" "}
              <button
                type="button"
                className="text-indigo-600 hover:underline transition-all"
                onClick={async () => {
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
                }}
              >
                click here to resend
              </button>
            </p>
          </div>
        ) : (
          <>
            <div className="relative my-3 animate-fade-in" style={{ animationDelay: "50ms" }}>
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300"></span>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">Quick sign up with</span>
              </div>
            </div>
            
            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center justify-center gap-2 mb-3 border border-gray-300 hover:bg-gray-50 transition-colors animate-slide-in-bottom"
              style={{ animationDelay: "100ms" }}
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              aria-label="Sign up with Google"
            >
              {googleLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              )}
              {googleLoading ? "Signing up..." : "Sign up with Google"}
            </Button>
            
            <div className="relative my-3 animate-fade-in" style={{ animationDelay: "150ms" }}>
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300"></span>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">Or with email</span>
              </div>
            </div>

            <form className="space-y-3" onSubmit={handleSubmit} noValidate>
              {error && (
                <Alert className="bg-red-50 border-red-200">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <AlertDescription className="text-red-700">{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="animate-slide-in-bottom" style={{ animationDelay: "200ms" }}>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                  className="mt-0.5 transition-all focus:ring-2 focus:ring-indigo-500"
                  aria-describedby="name-description"
                />
                <span id="name-description" className="sr-only">Enter your full name as it will appear on your account</span>
              </div>
              
              <div className="animate-slide-in-bottom" style={{ animationDelay: "250ms" }}>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError && validateEmail(e.target.value)) {
                      setEmailError("");
                    }
                  }}
                  placeholder="Enter your email"
                  required
                  className={`mt-1 transition-all focus:ring-2 focus:ring-indigo-500 ${emailError ? "border-red-500 focus:border-red-500" : ""}`}
                  aria-describedby="email-error"
                  aria-invalid={!!emailError}
                />
                {emailError && (
                  <div className="flex items-center gap-x-2 text-sm text-red-600 mt-1" id="email-error">
                    <AlertCircle className="h-4 w-4" aria-hidden="true" />
                    <span>{emailError}</span>
                  </div>
                )}
              </div>
              
              <div className="animate-slide-in-bottom" style={{ animationDelay: "300ms" }}>
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      const newPassword = e.target.value;
                      setPassword(newPassword);
                      
                      // Validate password
                      if (newPassword) {
                        const validation = validatePassword(newPassword);
                        setPasswordError(validation.valid ? "" : validation.message);
                      } else {
                        setPasswordError("");
                      }
                      
                      // Check if passwords match whenever password changes
                      if (confirmPassword && confirmPassword !== newPassword) {
                        setConfirmPasswordError("Passwords do not match");
                      } else if (confirmPassword) {
                        setConfirmPasswordError("");
                      }
                      if (passwordError && validatePassword(e.target.value).valid) {
                        setPasswordError("");
                      }
                    }}
                    placeholder="Create a password"
                    required
                    className={`mt-1 pr-10 transition-all focus:ring-2 focus:ring-indigo-500 ${passwordError ? "border-red-500 focus:border-red-500" : ""}`}
                    aria-describedby="password-requirements password-error"
                    aria-invalid={!!passwordError}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-indigo-600 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                <div id="password-requirements" className="text-xs text-gray-500 mt-1">
                  Password must have at least 6 characters, one uppercase letter, one lowercase letter, one number, and one special character.
                </div>
                {passwordError && (
                  <div className="flex items-center gap-x-2 text-sm text-red-600 mt-1" id="password-error">
                    <AlertCircle className="h-4 w-4" aria-hidden="true" />
                    <span>{passwordError}</span>
                  </div>
                )}
              </div>
              
              <div className="animate-slide-in-bottom" style={{ animationDelay: "350ms" }}>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => {
                      const newConfirmPassword = e.target.value;
                      setConfirmPassword(newConfirmPassword);
                      
                      // Check if passwords match
                      if (newConfirmPassword && password !== newConfirmPassword) {
                        setConfirmPasswordError("Passwords do not match");
                      } else {
                        setConfirmPasswordError("");
                      }
                    }}
                    placeholder="Confirm your password"
                    required
                    className={`mt-1 pr-10 transition-all focus:ring-2 focus:ring-indigo-500 ${confirmPasswordError ? "border-red-500 focus:border-red-500" : ""}`}
                    aria-describedby="confirm-password-error"
                    aria-invalid={!!confirmPasswordError}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-indigo-600 transition-colors"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {confirmPasswordError && (
                  <div className="flex items-center gap-x-2 text-sm text-red-600 mt-1" id="confirm-password-error">
                    <AlertCircle className="h-4 w-4" aria-hidden="true" />
                    <span>{confirmPasswordError}</span>
                  </div>
                )}
              </div>

              <div className="animate-slide-in-bottom" style={{ animationDelay: "400ms" }}>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white transition-all transform hover:translate-y-[-1px] active:translate-y-[1px]"
                  disabled={loading}
                  aria-label="Create account"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> Creating
                      account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </div>
            </form>            <div className="mt-4 text-center text-xs text-gray-600 animate-fade-in" style={{ animationDelay: "450ms" }}>
              By creating an account, you agree to our{" "}
              <Link
                to="#"
                className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                to="#"
                className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
              >
                Privacy Policy
              </Link>
              .
            </div>
            
            <div className="mt-4 text-center text-xs text-gray-600 animate-fade-in" style={{ animationDelay: "500ms" }}>
              Are you an admin?{" "}
              <Link to="/admin/login" className="font-medium text-indigo-600 hover:text-indigo-500 hover:underline transition-colors inline-flex items-center">
                Admin Login <span className="ml-1 px-1.5 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-md font-medium">Store Owner</span>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Register;
