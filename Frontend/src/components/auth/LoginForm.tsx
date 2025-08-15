import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Loader2, Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";
import { GoogleSignInButton } from "./GoogleSignInButton";

interface LoginFormProps {
  // Form values
  email: string;
  password: string;
  
  // Handlers
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onGoogleSignIn: () => void;
  
  // UI state
  showPassword: boolean;
  onTogglePassword: () => void;
  isLoading: boolean;
  googleLoading: boolean;
  
  // Error state
  error: string | null;
  
  // Verification success state
  isVerificationSuccess?: boolean;
}

export const LoginForm = ({
  email,
  password,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  onGoogleSignIn,
  showPassword,
  onTogglePassword,
  isLoading,
  googleLoading,
  error,
  isVerificationSuccess = false
}: LoginFormProps) => {
  return (
    <>
      {isVerificationSuccess && (
        <div className="mt-6 space-y-4">
          <Alert className="bg-green-50 border-green-200 animate-pulse">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <AlertDescription className="text-green-800">
              Your email has been verified successfully! You can now log in to your account.
            </AlertDescription>
          </Alert>
        </div>
      )}
      
      <form onSubmit={onSubmit} className="space-y-4 mt-4">
        {error && (
          <Alert className="bg-red-50 border-red-200 animate-slide-in-bottom">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <AlertDescription className="text-red-700">{error}</AlertDescription>
          </Alert>
        )}

        <div className="animate-slide-in-bottom" style={{ animationDelay: "50ms" }}>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="Enter your email"
            required
            className="mt-1 transition-all focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="animate-slide-in-bottom" style={{ animationDelay: "100ms" }}>
          <div className="flex justify-between items-center">
            <Label htmlFor="password">Password</Label>
            <Link to="#" className="text-sm text-indigo-600 hover:text-indigo-500 transition-colors">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              placeholder="Enter your password" 
              required
              className="mt-1 pr-10 transition-all focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-indigo-600 transition-colors"
              onClick={onTogglePassword}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div className="animate-slide-in-bottom" style={{ animationDelay: "150ms" }}>
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white transition-all transform hover:translate-y-[-1px] active:translate-y-[1px]"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </div>
        
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-300"></span>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-gray-500">Or continue with</span>
          </div>
        </div>
        
        <GoogleSignInButton
          onGoogleSignIn={onGoogleSignIn}
          isLoading={googleLoading}
        />
      </form>
    </>
  );
};
