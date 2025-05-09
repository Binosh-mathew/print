
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Auth Context Provider
import { AuthProvider } from "./contexts/AuthContext";

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
import AdminDashboard from "./pages/admin/Dashboard";
import ManageOrders from "./pages/admin/ManageOrders";
import ManageUsers from "./pages/admin/ManageUsers";
import PricingSettings from "./pages/admin/PricingSettings";
import NotFound from "./pages/NotFound";

// Protected Route Component
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Homepage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
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
                  <AdminDashboard />
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
            
            {/* Catch-All Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
