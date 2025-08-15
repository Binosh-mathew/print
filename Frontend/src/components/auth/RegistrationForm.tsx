import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";

interface RegistrationFormProps {
  // Form values
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  
  // Handlers
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  
  // Errors
  emailError: string;
  passwordError: string;
  confirmPasswordError: string;
  error: string | null;
  
  // UI state
  showPassword: boolean;
  showConfirmPassword: boolean;
  onTogglePassword: () => void;
  onToggleConfirmPassword: () => void;
  isLoading: boolean;
}

export const RegistrationForm = ({
  name,
  email,
  password,
  confirmPassword,
  onNameChange,
  onEmailChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onSubmit,
  emailError,
  passwordError,
  confirmPasswordError,
  error,
  showPassword,
  showConfirmPassword,
  onTogglePassword,
  onToggleConfirmPassword,
  isLoading
}: RegistrationFormProps) => {
  return (
    <form className="space-y-3" onSubmit={onSubmit} noValidate>
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
          onChange={(e) => onNameChange(e.target.value)}
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
          onChange={(e) => onEmailChange(e.target.value)}
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
            onChange={(e) => onPasswordChange(e.target.value)}
            placeholder="Create a password"
            required
            className={`mt-1 pr-10 transition-all focus:ring-2 focus:ring-indigo-500 ${passwordError ? "border-red-500 focus:border-red-500" : ""}`}
            aria-describedby="password-requirements password-error"
            aria-invalid={!!passwordError}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-indigo-600 transition-colors"
            onClick={onTogglePassword}
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
            onChange={(e) => onConfirmPasswordChange(e.target.value)}
            placeholder="Confirm your password"
            required
            className={`mt-1 pr-10 transition-all focus:ring-2 focus:ring-indigo-500 ${confirmPasswordError ? "border-red-500 focus:border-red-500" : ""}`}
            aria-describedby="confirm-password-error"
            aria-invalid={!!confirmPasswordError}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-indigo-600 transition-colors"
            onClick={onToggleConfirmPassword}
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
          disabled={isLoading}
          aria-label="Create account"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> Creating
              account...
            </>
          ) : (
            "Create Account"
          )}
        </Button>
      </div>
    </form>
  );
};
