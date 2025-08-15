import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";

interface VerificationMessageProps {
  email: string;
  onEmailChange: (value: string) => void;
  onResendVerification: () => void;
  onBackToLogin: () => void;
  isLoading: boolean;
}

export const VerificationMessage = ({
  email,
  onEmailChange,
  onResendVerification,
  onBackToLogin,
  isLoading
}: VerificationMessageProps) => {
  return (
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
        onChange={(e) => onEmailChange(e.target.value)}
        placeholder="Confirm your email"
        className="mt-1"
        disabled={isLoading}
      />
      
      <div className="flex gap-2">
        <Button
          type="button"
          className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white transition-all"
          onClick={onResendVerification}
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Resend Verification Email
        </Button>
        
        <Button
          type="button"
          variant="outline"
          onClick={onBackToLogin}
          className="flex-1"
        >
          Back to Login
        </Button>
      </div>
    </div>
  );
};
