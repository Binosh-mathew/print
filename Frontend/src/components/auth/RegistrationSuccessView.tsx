import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

interface RegistrationSuccessViewProps {
  onProceedToLogin: () => void;
  onResendVerification: () => void;
}

export const RegistrationSuccessView = ({ 
  onProceedToLogin, 
  onResendVerification 
}: RegistrationSuccessViewProps) => {
  return (
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
          onClick={onProceedToLogin}
        >
          Proceed to Login
        </Button>
      </div>
      <p className="text-sm text-gray-500 mt-4">
        Didn't receive the email? Check your spam folder or{" "}
        <button
          type="button"
          className="text-indigo-600 hover:underline transition-all"
          onClick={onResendVerification}
        >
          click here to resend
        </button>
      </p>
    </div>
  );
};
