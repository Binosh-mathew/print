import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import useAuthStore from "@/store/authStore";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const { login, isAuthenticated, error, loading } = useAuthStore();
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
    if (isAuthenticated) {
      navigate("/dashboard");
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
