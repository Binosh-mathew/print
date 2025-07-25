import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, FilePlus, FileText, User, LogOut, Menu, X, ShoppingBag, PlayCircle } from "lucide-react";
import useAuthStore from "@/store/authStore";

interface UserLayoutProps {
  children: React.ReactNode;
}

const UserLayout: React.FC<UserLayoutProps> = ({ children }) => {
  const { logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: <Home size={18} /> },
    { path: "/new-order", label: "New Order", icon: <FilePlus size={18} /> },
    { path: "/orders", label: "Order History", icon: <FileText size={18} /> },
    { path: "/offers-shops", label: "Offers & Shops", icon: <ShoppingBag size={18} /> },
    { path: "/ads", label: "Watch Ads & Earn", icon: <PlayCircle size={18} /> },
    { path: "/profile", label: "Profile", icon: <User size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <span className="font-bold text-xl text-primary">PrintSpark</span>
          </Link>

          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 text-gray-600"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Desktop navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-1 py-2 px-1 border-b-2 text-sm font-medium transition-colors duration-150 ${
                  location.pathname === item.path
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-600 hover:text-primary hover:border-primary-200"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="flex items-center space-x-1 text-gray-600 hover:text-primary hover:bg-primary-100"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </Button>
          </nav>
        </div>
      </header>

      {/* Mobile menu drawer */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="bg-white w-64 h-full overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 border-b border-gray-200">
              <span className="font-bold text-xl text-primary">PrintSpark</span>
            </div>
            <nav className="px-2 py-3">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-3 py-3 rounded-md transition-colors duration-150 ${
                    location.pathname === item.path
                      ? "bg-primary-100 text-primary"
                      : "text-gray-600 hover:bg-primary-100 hover:text-primary"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center space-x-3 px-3 py-3 w-full text-left rounded-md text-gray-600 hover:bg-primary-100 hover:text-primary"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-grow container mx-auto px-4 py-6">{children}</main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          <p>© 2025 PrintSpark. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default UserLayout;
