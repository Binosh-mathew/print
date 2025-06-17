import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Auth Context Provider
// import { AuthProvider } from "./contexts/AuthContext";

// User Pages
import Homepage from "./pages/Homepage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserDashboard from "./pages/user/Dashboard";
import NewOrder from "./pages/user/NewOrder";
import OrderHistory from "./pages/user/OrderHistory";
import OrderDetails from "./pages/user/OrderDetails";
import UserProfile from "./pages/user/Profile";

// Admin Pages
import AdminLogin from "./pages/admin/AdminLogin";
import Dashboard from "./pages/admin/Dashboard";
import ManageOrders from "./pages/admin/ManageOrders";
import ManageUsers from "./pages/admin/ManageUsers";
import PricingSettings from "./pages/admin/PricingSettings";
import Messages from "./pages/admin/Messages";
import AdminProfile from "./pages/admin/Profile";
import NotFound from "./pages/NotFound";
import VerifyEmail from "./pages/VerifyEmail"; 

// Protected Route Component
import ProtectedRoute from "./components/ProtectedRoute";
import MaintenanceCheck from "./components/MaintenanceCheck";

// Developer Pages
import DeveloperDashboard from "@/pages/developer/DeveloperDashboard";
import DeveloperLogin from "@/pages/developer/DeveloperLogin";
import DeveloperMessages from "@/pages/developer/Messages";
import SystemStatus from "@/pages/developer/SystemStatus";
import Database from "@/pages/developer/Database";
import Logs from "@/pages/developer/Logs";
import CreateAdmin from "@/pages/developer/CreateAdmin";
import LoginActivity from "@/pages/developer/LoginActivity";
import { useEffect } from "react";
import useAuthStore from "./store/authStore";

const queryClient = new QueryClient();
const App = () => {
  const { initialize ,user} = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <MaintenanceCheck>
            <Routes>              {/* Public Routes */}
              <Route path="/" element={<Homepage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-email/:token" element={<VerifyEmail />} />

              {/* User Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute allowedRole="user">
                    <UserDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/new-order"
                element={
                  <ProtectedRoute allowedRole="user">
                    <NewOrder />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders"
                element={
                  <ProtectedRoute allowedRole="user">
                    <OrderHistory />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders/:id"
                element={
                  <ProtectedRoute allowedRole="user">
                    <OrderDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute allowedRole="user">
                    <UserProfile />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRole="admin">
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/orders"
                element={
                  <ProtectedRoute allowedRole="admin">
                    <ManageOrders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute allowedRole="admin">
                    <ManageUsers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/pricing"
                element={
                  <ProtectedRoute allowedRole="admin">
                    <PricingSettings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/messages"
                element={
                  <ProtectedRoute allowedRole="admin">
                    <Messages />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/profile"
                element={
                  <ProtectedRoute allowedRole="admin">
                    <AdminProfile />
                  </ProtectedRoute>
                }
              />

              {/* Developer Routes */}
              <Route path="/developer/login" element={<DeveloperLogin />} />
              <Route
                path="/developer"
                element={
                  <ProtectedRoute allowedRole="developer">
                    <DeveloperDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/developer/create-admin"
                element={
                  <ProtectedRoute allowedRole="developer">
                    <CreateAdmin />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/developer/messages"
                element={
                  <ProtectedRoute allowedRole="developer">
                    <DeveloperMessages />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/developer/system"
                element={
                  <ProtectedRoute allowedRole="developer">
                    <SystemStatus />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/developer/database"
                element={
                  <ProtectedRoute allowedRole="developer">
                    <Database />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/developer/logs"
                element={
                  <ProtectedRoute allowedRole="developer">
                    <Logs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/developer/login-activity"
                element={
                  <ProtectedRoute allowedRole="developer">
                    <LoginActivity />
                  </ProtectedRoute>
                }
              />

              {/* Catch-All Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </MaintenanceCheck>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
