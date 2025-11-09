import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import useAuthStore from "@/store/authStore";
import { toast } from "@/components/ui/use-toast";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, isAuthenticated, error, loading } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/admin/");
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (error) {
      toast({
        title: "Login failed",
        description: error,
        variant: "destructive",
      });
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password, "admin");
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="bg-white shadow-2xl rounded-3xl w-full max-w-md p-6 transform animate-scale-in">
        <div className="flex flex-col items-center mb-5">
          <Link
            to="/"
            className="text-center  transition-transform hover:scale-105 flex flex-col items-center"
          >
            <div className="h-14 w-14 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center mb-3 shadow-md mx-auto">
              <span className="text-xl font-extrabold text-white flex items-center justify-center h-full w-full">
                PS
              </span>
            </div>
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
              PrintSpark
            </span>
          </Link>
          <h2 className="mt-4 text-center text-2xl font-bold text-gray-900 animate-slide-in-bottom">
            Admin Login{" "}
            <span className="ml-1 px-1.5 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-md font-medium">
              Store Owner
            </span>
          </h2>
          <p className="mt-1 text-center text-sm text-gray-600">
            Please sign in with your admin credentials
          </p>
        </div>

        <form className="space-y-4 mt-4" onSubmit={handleSubmit}>
          {error && (
            <Alert className="bg-red-50 border-red-200 animate-slide-in-bottom">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <AlertDescription className="text-red-700">
                {error}
              </AlertDescription>
            </Alert>
          )}
          <div
            className="animate-slide-in-bottom"
            style={{ animationDelay: "50ms" }}
          >
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter admin email"
              required
              className="mt-0.5 transition-all focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div
            className="animate-slide-in-bottom"
            style={{ animationDelay: "100ms" }}
          >
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                required
                className="mt-0.5 pr-10 transition-all focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-indigo-600 transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
          <div
            className="animate-slide-in-bottom"
            style={{ animationDelay: "150ms" }}
          >
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white transition-all transform hover:translate-y-[-1px] active:translate-y-[1px]"
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
            </Button>{" "}
          </div>{" "}
        </form>

        <p
          className="mt-4 text-center text-xs text-gray-600 animate-fade-in"
          style={{ animationDelay: "200ms" }}
        >
          <Link
            to="/"
            className="font-medium text-indigo-600 hover:text-indigo-500 hover:underline transition-colors"
          >
            Return to homepage
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
