import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { useLogin } from "../hooks/auth/useLogin";
import { VerificationMessage } from "../components/auth/VerificationMessage";
import { LoginForm } from "../components/auth/LoginForm";

const Login = () => {
  const location = useLocation();
  
  // Check for verification success from URL params
  const urlParams = new URLSearchParams(location.search);
  const isVerificationSuccess = urlParams.get("verified") === "true";

  const {
    // Form state
    email,
    password,
    showPassword,
    setEmail,
    setPassword,
    setShowPassword,
    needsVerification,
    setNeedsVerification,
    
    // Loading states
    loading: isLoading,
    googleLoading,
    
    // Error states
    error,
    
    // Handlers
    handleSubmit,
    handleResendVerification,
    handleGoogleSignIn,
  } = useLogin();

  // If user is already logged in, they'll be redirected by the hook
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-8 animate-fade-in-up">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 animate-slide-in-bottom">
            Welcome back
          </h1>
          <p className="text-gray-600 animate-slide-in-bottom" style={{ animationDelay: "100ms" }}>
            Sign in to your account to continue
          </p>
        </div>

        <div className="bg-white shadow-xl rounded-2xl p-8 space-y-6 border-t-4 border-gradient-to-r from-purple-500 to-indigo-500">
          {/* Show verification message if user needs to verify email */}
          {needsVerification && (
            <VerificationMessage
              email={email}
              onEmailChange={setEmail}
              onResendVerification={handleResendVerification}
              onBackToLogin={() => {
                setNeedsVerification(false);
                setEmail("");
                setPassword("");
              }}
              isLoading={isLoading}
            />
          )}

          {/* Show login form if no verification needed */}
          {!needsVerification && (
            <LoginForm
              email={email}
              password={password}
              onEmailChange={setEmail}
              onPasswordChange={setPassword}
              onSubmit={handleSubmit}
              onGoogleSignIn={handleGoogleSignIn}
              showPassword={showPassword}
              onTogglePassword={() => setShowPassword(!showPassword)}
              isLoading={isLoading}
              googleLoading={googleLoading}
              error={error || null}
              isVerificationSuccess={isVerificationSuccess}
            />
          )}

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
              >
                Sign up here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
