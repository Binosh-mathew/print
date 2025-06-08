import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import useAuthStore from "@/store/authStore";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isAuthenticated, error, loading } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated]);

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
    await login(email, password, "user");
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link
          to="/"
          className="flex justify-center font-bold text-2xl text-primary"
        >
          PrintSpark Studio
        </Link>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{" "}
          <Link
            to="/register"
            className="font-medium text-primary hover:text-primary-500"
          >
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
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
              <div className="flex justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  to="#"
                  className="text-sm font-medium text-primary hover:text-primary-500"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary-500"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing
                    in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Demo Credentials
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setEmail("user@example.com");
                  setPassword("user123");
                  toast({
                    title: "Demo credentials filled",
                    description:
                      "You can now sign in with the demo user account.",
                  });
                }}
                className="w-full text-gray-700 hover:bg-gray-50"
              >
                Use demo user account
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600">
          Are you an admin?{" "}
          <Link
            to="/admin/login"
            className="font-medium text-primary hover:text-primary-500"
          >
            Admin Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
