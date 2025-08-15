import { Link } from "react-router-dom";
import { useRegistration } from "@/hooks/useRegistration";
import { RegistrationSuccessView } from "@/components/auth/RegistrationSuccessView";
import { GoogleSignUpButton } from "@/components/auth/GoogleSignUpButton";
import { RegistrationForm } from "@/components/auth/RegistrationForm";

const Register = () => {
  const {
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
    loading,
    error,
    handleGoogleSignIn,
    handleSubmit,
    handleResendVerification,
    handleEmailChange,
    handlePasswordChange,
    handleConfirmPasswordChange,
    navigate
  } = useRegistration();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-6">
      <div className="bg-white shadow-2xl rounded-3xl w-full max-w-md p-5 transform animate-scale-in">
        <div className="flex flex-col items-center mb-3">
          <Link to="/" className="text-center transition-transform hover:scale-105 flex flex-col items-center">
            <div className="h-12 w-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center mb-2 shadow-md mx-auto">
              <span className="text-lg font-extrabold text-white flex items-center justify-center h-full w-full">PS</span>
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
              PrintSpark
            </span>
          </Link>
          <h2 className="mt-2 text-center text-xl font-bold text-gray-900 animate-slide-in-bottom">
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
          <RegistrationSuccessView
            onProceedToLogin={() => navigate("/login")}
            onResendVerification={handleResendVerification}
          />
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

            <GoogleSignUpButton
              onGoogleSignIn={handleGoogleSignIn}
              isLoading={googleLoading}
            />

            <div className="relative my-3 animate-fade-in" style={{ animationDelay: "150ms" }}>
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300"></span>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">Or with email</span>
              </div>
            </div>

            <RegistrationForm
              name={name}
              email={email}
              password={password}
              confirmPassword={confirmPassword}
              onNameChange={setName}
              onEmailChange={handleEmailChange}
              onPasswordChange={handlePasswordChange}
              onConfirmPasswordChange={handleConfirmPasswordChange}
              onSubmit={handleSubmit}
              emailError={emailError}
              passwordError={passwordError}
              confirmPasswordError={confirmPasswordError}
              error={error || null}
              showPassword={showPassword}
              showConfirmPassword={showConfirmPassword}
              onTogglePassword={() => setShowPassword(!showPassword)}
              onToggleConfirmPassword={() => setShowConfirmPassword(!showConfirmPassword)}
              isLoading={loading}
            />

            <div className="mt-4 text-center text-xs text-gray-600 animate-fade-in" style={{ animationDelay: "450ms" }}>
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
