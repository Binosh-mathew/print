import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, useEffect, lazy } from "react";
import Homepage from "./pages/Homepage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserDashboard from "./pages/user/Dashboard";
import NewOrder from "./pages/user/NewOrder";
import OrderHistory from "./pages/user/OrderHistory";
import OrderDetails from "./pages/user/OrderDetails";
import UserProfile from "./pages/user/Profile";
import OffersShops from "./pages/user/OffersShops";
import AdsPage from "./pages/user/AdsPage";

import AdminLogin from "./pages/admin/AdminLogin";
import Dashboard from "./pages/admin/Dashboard";
import ManageOrders from "./pages/admin/ManageOrders";
import ManageUsers from "./pages/admin/ManageUsers";
import PricingSettings from "./pages/admin/PricingSettings";
import StoreSettings from "./pages/admin/StoreSettings";
import Messages from "./pages/admin/Messages";
import AdminProfile from "./pages/admin/Profile";
import NotFound from "./pages/NotFound";
import VerifyEmail from "./pages/VerifyEmail";

import ProtectedRoute from "./components/ProtectedRoute";
import MaintenanceCheck from "./components/MaintenanceCheck";

import DeveloperDashboard from "@/pages/developer/DeveloperDashboard";
import DeveloperLogin from "@/pages/developer/DeveloperLogin";
import DeveloperMessages from "@/pages/developer/Messages";
import SystemStatus from "@/pages/developer/SystemStatus";
import Database from "@/pages/developer/Database";
import Logs from "@/pages/developer/Logs";
import CreateAdmin from "@/pages/developer/CreateAdmin";
import ProductManagement from "@/pages/developer/ProductManagement";
import LoginAlerts from "@/pages/developer/LoginAlerts";
import AdManagement from "./pages/developer/AdManagement";
import useAuthStore from "./store/authStore";

const SocketDiagnostic = lazy(() => import("./components/SocketDiagnostic"));

const queryClient = new QueryClient();
const App = () => {
  const { initialize } = useAuthStore();

  useEffect(() => {
    initialize();

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "auth_data") {
        initialize();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    const setupFirebaseAuthListener = async () => {
      try {
        const { auth } = await import("./config/firebase");
        const { onAuthStateChanged } = await import("firebase/auth");
        const unsubscribe = onAuthStateChanged(auth, async (_user) => {});
        return unsubscribe;
      } catch (error) {
        console.error("Failed to set up Firebase auth listener:", error);
        return null;
      }
    };

    let authUnsubscribe: (() => void) | null = null;
    setupFirebaseAuthListener().then((unsubscribe) => {
      authUnsubscribe = unsubscribe;
    });

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      if (authUnsubscribe) {
        authUnsubscribe();
      }

      if ((window as any).__authRefreshInterval) {
        clearInterval((window as any).__authRefreshInterval);
      }
    };
  }, [initialize]);


  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter basename="/">
          <MaintenanceCheck>
            <Routes>
              {" "}
              <Route path="/" element={<Homepage />} index={true} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-email/:token" element={<VerifyEmail />} />
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
              <Route
                path="/offers-shops"
                element={
                  <ProtectedRoute allowedRole="user">
                    <OffersShops />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ads"
                element={
                  <ProtectedRoute allowedRole="user">
                    <AdsPage />
                  </ProtectedRoute>
                }
              />
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
                path="/admin/settings"
                element={
                  <ProtectedRoute allowedRole="admin">
                    <StoreSettings />
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
                path="/developer/login-alerts"
                element={
                  <ProtectedRoute allowedRole="developer">
                    <LoginAlerts />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/developer/products"
                element={
                  <ProtectedRoute allowedRole="developer">
                    <ProductManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/developer/ads"
                element={
                  <ProtectedRoute allowedRole="developer">
                    <AdManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/developer/socket-diagnostic"
                element={
                  <ProtectedRoute allowedRole="developer">
                    <Suspense fallback={<div>Loading diagnostic tool...</div>}>
                      <SocketDiagnostic />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </MaintenanceCheck>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
