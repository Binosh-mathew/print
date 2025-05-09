import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export function GoogleSignInButton() {
  const { handleGoogleSignIn } = useAuth();
  const navigate = useNavigate();

  const handleClick = async () => {
    try {
      await handleGoogleSignIn();
      navigate('/dashboard');
    } catch (error) {
      console.error('Google sign-in failed:', error);
    }
  };

  return (
    <Button 
      onClick={handleClick}
      variant="outline"
      className="w-full flex items-center gap-2"
    >
      <img src="/google-icon.svg" alt="Google" className="w-5 h-5" />
      Sign in with Google
    </Button>
  );
}