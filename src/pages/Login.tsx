import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import useAuthStore from "@/store/authStore";
// Using auth store instead of context for Google auth

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);  const { login, loginWithGoogle, isAuthenticated, error, loading } = useAuthStore();
  const [googleLoading, setGoogleLoading] = useState(false);
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
        console.log("User authenticated, redirecting to dashboard...");
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
  };  // Helper function to detect private browsing mode
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
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-purple-200 via-blue-100 to-white px-4 py-12">
      <div className="backdrop-blur-lg bg-white/60 shadow-xl rounded-2xl w-full max-w-md p-8 border border-gray-200 animate-fade-in">
        <Link to="/" className="text-center block text-3xl font-bold text-purple-700">
          PrintSpark Studio
        </Link>
        <h2 className="mt-4 text-center text-xl font-semibold text-gray-800">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{" "}
          <Link to="/register" className="text-purple-600 hover:underline">
            create a new account
          </Link>
        </p>

        {needsVerification ? (
          <div className="mt-6 space-y-4">
            <Alert className="bg-yellow-50 border-yellow-200">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                Your email address has not been verified. Please check your inbox for a verification link or click below to resend it.
              </AlertDescription>
            </Alert>
            
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Confirm your email"
              className="mt-1"
              disabled={loading}
            />
            
            <div className="flex gap-2">
              <Button
                type="button"
                className="flex-1"
                onClick={handleResendVerification}
                disabled={loading}
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Resend Verification Email
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => setNeedsVerification(false)}
                className="flex-1"
              >
                Back to Login
              </Button>
            </div>
          </div>
        ) : verificationSuccess ? (
          <div className="mt-6 space-y-4">
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <AlertDescription className="text-green-800">
                Your email has been verified successfully! You can now log in to your account.
              </AlertDescription>
            </Alert>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="mt-1"
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link to="#" className="text-sm text-purple-500 hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password" 
                    required
                    className="mt-1 pr-10"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-primary"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10a9.96 9.96 0 012.338-6.338M21 21L3 3" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.522 5 12 5s8.268 2.943 9.542 7a9.959 9.959 0 01-1.664 3.043" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              
              <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white transition-all"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
              
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-300"></span>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-gray-500">Or continue with</span>
                </div>
              </div>
              
              <Button
                type="button"
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
              >
                {googleLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
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
                {googleLoading ? "Signing in..." : "Sign in with Google"}
              </Button>
            </form>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 mt-6">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="mt-1"
              />
            </div>

            <div>
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Password</Label>
                <Link to="#" className="text-sm text-purple-500 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password" 
                  required
                  className="mt-1 pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-primary"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10a9.96 9.96 0 012.338-6.338M21 21L3 3" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.522 5 12 5s8.268 2.943 9.542 7a9.959 9.959 0 01-1.664 3.043" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white transition-all"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
            
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300"></span>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">Or continue with</span>
              </div>
            </div>
            
            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
            >
              {googleLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <svg className="h-5 w-5" viewBox="0 0 24 24">
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
              {googleLoading ? "Signing in..." : "Sign in with Google"}
            </Button>
          </form>
        )}

        <div className="mt-6 text-center">
          <div className="text-sm text-gray-500">Demo Credentials</div>
          <Button
            variant="outline"
            className="w-full mt-2 hover:bg-purple-50 text-purple-700"
            onClick={() => {
              setEmail("user@example.com");
              setPassword("user123");
              toast({
                title: "Demo credentials filled",
                description: "You can now sign in with the demo user account.",
              });
            }}
          >
            Use demo user account
          </Button>
        </div>

        <p className="mt-6 text-center text-sm text-gray-600">
          Are you an admin?{" "}
          <Link to="/admin/login" className="text-purple-600 hover:underline">
            Admin Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
