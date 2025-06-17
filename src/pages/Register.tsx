import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Loader2, AlertCircle } from "lucide-react";
import useAuthStore from "@/store/authStore";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { checkEmailExists } from "@/api";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [registrationSuccess, setRegistrationSuccess] = useState(false);  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const { register, isAuthenticated, loading, error } = useAuthStore();
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

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link
          to="/"
          className="flex justify-center font-bold text-2xl text-primary"
        >
          PrintSpark Studio
        </Link>        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign Up
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{" "}
          <Link
            to="/login"
            className="font-medium text-primary hover:text-primary-500"
          >
            sign in to your existing account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {registrationSuccess ? (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="bg-green-100 rounded-full p-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-medium text-gray-900">
                Registration Successful!
              </h3>
              <p className="text-gray-600">
                We've sent a verification link to your email address. Please check
                your inbox and click the link to verify your account.
              </p>
              <div className="mt-6">
                <Button
                  type="button"
                  className="w-full"
                  onClick={() => navigate("/login")}
                >
                  Proceed to Login
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                Didn't receive the email? Check your spam folder or{" "}
                <button
                  type="button"
                  className="text-primary hover:underline"
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
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                  className="mt-1"
                />
              </div>
              <div>
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
                  className={`mt-1 ${emailError ? "border-red-500" : ""}`}
                />
                {emailError && (
                  <div className="flex items-center gap-x-2 text-sm text-red-600 mt-1">
                    <AlertCircle className="h-4 w-4" />
                    <span>{emailError}</span>
                  </div>
                )}
              </div>              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}                  onChange={(e) => {
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
                  className="mt-1"
                />
                {passwordError && (
                  <div className="flex items-center gap-x-2 text-sm text-red-600 mt-1">
                    <AlertCircle className="h-4 w-4" />
                    <span>{passwordError}</span>
                  </div>
                )}
              </div>              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
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
                  className="mt-1"
                />
                {confirmPasswordError && (
                  <div className="flex items-center gap-x-2 text-sm text-red-600 mt-1">
                    <AlertCircle className="h-4 w-4" />
                    <span>{confirmPasswordError}</span>
                  </div>
                )}
              </div>

              <div>
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary-500"
                  disabled={loading}
                >                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating
                      account...
                    </>                  ) : (
                    "Sign Up"
                  )}
                </Button>
              </div>
            </form>
          )}

          {!registrationSuccess && (
            <div className="mt-6 text-center text-sm text-gray-600">
              By creating an account, you agree to our{" "}
              <Link
                to="#"
                className="font-medium text-primary hover:text-primary-500"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                to="#"
                className="font-medium text-primary hover:text-primary-500"
              >
                Privacy Policy
              </Link>
              .
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;
