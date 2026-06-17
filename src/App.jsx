import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Sidebar from "./Componentes/Sidebar/Sidebar";
import Header from "./Componentes/Header/Header";

import Explore from "./pages/Explore/Explore";
import Manage_Categories from "./pages/ManageCategories/Manage_Categories";
import Manage_Items from "./pages/ManageItems/Manage_items";
import Manage_Users from "./pages/ManageUsers/Manage_users";
import ManageEmployees from "./pages/ManageEmployees/ManageEmployees";
import Dashboard from "./pages/Dashboard/Dashboard";
import OrderHistory from "./pages/OrderHistory/OrderHistory";
import Login from "./Componentes/Login/Login";

import Settings from "./pages/Settings/Settings";
import ImportHistory from "./Componentes/ImportHistory/ImportHistory";
import VerifyEmail from "./pages/VerifyEmail/VerifyEmail";
import Reports from "./pages/Reports/Reports";
import toast, { Toaster } from "react-hot-toast";

import { useContext, useEffect, useState } from "react";
import { AppContext } from "./context/AppContext";
import ReceiptPopup from "./Componentes/ReceiptPopup/ReceiptPopup";
import SubscriptionBanner from "./Componentes/SubscriptionBanner/SubscriptionBanner";
import { requestSubscriptionRenewal } from "./Service/SubscriptionService";

import RegisterShop from "./pages/RegisterShop/RegisterShop";
import PendingApproval from "./pages/PendingApproval/PendingApproval";
import AccountRejected from "./pages/AccountRejected/AccountRejected";
import AccountDisabled from "./pages/AccountDisabled/AccountDisabled";
import ManageShops from "./pages/ManageShops/ManageShops";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";
import SubscriptionManagement from "./pages/SubscriptionManagement/SubscriptionManagement";

// Prevent logged-in users from going to login page
const LoginRoute = ({ auth, element }) => {
  if (auth?.token) {
    return <Navigate to="/dashboard" replace />;
  }
  return element;
};

// Protect routes (auth + role check + subscription check)
const ProtectedRoute = ({ auth, children, roles, isRestricted, subscriptionInfo }) => {
  const [requesting, setRequesting] = useState(false);

  if (!auth?.token) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(auth?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSendRenewalRequest = async () => {
    setRequesting(true);
    const toastId = toast.loading("Sending subscription renewal request to Super Admin...");
    try {
      await requestSubscriptionRenewal();
      toast.success("Renewal request sent successfully! Super Admin has been notified.", { id: toastId });
    } catch (error) {
      console.error("Failed to send renewal request:", error);
      toast.error(error.response?.data?.message || "Failed to send renewal request.", { id: toastId });
    } finally {
      setRequesting(false);
    }
  };

  if (isRestricted && subscriptionInfo?.isExpired && auth?.role !== "ROLE_SUPERADMIN") {
    return (
      <div className="container d-flex align-items-center justify-content-center" style={{ minHeight: 'calc(100vh - 120px)' }}>
        <div className="glass-panel p-5 text-center" style={{ maxWidth: '600px', border: '1px solid rgba(244,63,94,0.2)', marginTop: '40px' }}>
          <div className="text-danger mb-4" style={{ fontSize: '3.5rem' }}>
            <i className="bi bi-exclamation-triangle-fill"></i>
          </div>
          <h3 className="text-white fw-bold mb-3">Access Restricted</h3>
          <p className="text-secondary fs-6 mb-4">
            Your subscription has expired. Please contact the Super Admin to activate your account.
          </p>
          <div className="d-flex align-items-center justify-content-center gap-3">
            <a href="/dashboard" className="btn btn-secondary px-4 py-2 fw-semibold" style={{ borderRadius: '8px' }}>
              Go to Dashboard
            </a>
            <button 
              onClick={handleSendRenewalRequest} 
              className="btn btn-primary px-4 py-2 fw-semibold" 
              style={{ borderRadius: '8px' }}
              disabled={requesting}
            >
              <i className="bi bi-envelope-fill me-1"></i>
              {requesting ? 'Sending...' : 'Contact Super Admin'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

const App = () => {
  const location = useLocation();
  const { auth, favicon, showPopup, setShowPopup, orderDetails, setOrderDetails, subscriptionInfo } = useContext(AppContext);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const isPublicRoute = ["/login", "/register-shop", "/pending-approval", "/account-rejected", "/account-disabled", "/verify-email", "/forgot-password"].includes(location.pathname);

  // Dynamic favicon switcher
  useEffect(() => {
    const link = document.querySelector("link[rel~='icon']") || document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'icon';
    link.href = favicon || '/vite.svg';
    document.getElementsByTagName('head')[0].appendChild(link);
  }, [favicon]);

  return (
    <div className="d-flex min-vh-100 bg-obsidian">
      {/* Left Sidebar (hidden on public screens) */}
      {!isPublicRoute && (
        <Sidebar isOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />
      )}

      {/* Main Content Area */}
      <div className="flex-grow-1 d-flex flex-column" style={{ minWidth: 0 }}>
        {/* Top Header Bar (hidden on public screens) */}
        {!isPublicRoute && (
          <Header onToggleSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)} />
        )}

        {!isPublicRoute && auth?.role !== 'ROLE_SUPERADMIN' && (
          <div className="mt-3">
            <SubscriptionBanner subscriptionInfo={subscriptionInfo} />
          </div>
        )}

        {/* Dynamic Route Content */}
        <div className="flex-grow-1">
          <Toaster />

          <Routes>
            {/* PUBLIC ROUTES */}
            <Route path="/login" element={<LoginRoute auth={auth} element={<Login />} />} />
            <Route path="/register-shop" element={<RegisterShop />} />
            <Route path="/pending-approval" element={<PendingApproval />} />
            <Route path="/account-rejected" element={<AccountRejected />} />
            <Route path="/account-disabled" element={<AccountDisabled />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* DEFAULT ROUTES */}
            <Route path="/" element={<ProtectedRoute auth={auth} roles={["ROLE_SUPERADMIN", "ROLE_SHOPOWNER", "ROLE_EMPLOYEE"]}><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute auth={auth} roles={["ROLE_SUPERADMIN", "ROLE_SHOPOWNER", "ROLE_EMPLOYEE"]}><Dashboard /></ProtectedRoute>} />
            <Route path="/explore" element={<ProtectedRoute auth={auth} roles={["ROLE_SHOPOWNER", "ROLE_EMPLOYEE"]} isRestricted={true} subscriptionInfo={subscriptionInfo}><Explore /></ProtectedRoute>} />

            {/* MANAGE ROUTES */}
            <Route
              path="/manage-categories"
              element={<ProtectedRoute auth={auth} roles={["ROLE_SHOPOWNER"]} isRestricted={true} subscriptionInfo={subscriptionInfo}><Manage_Categories /></ProtectedRoute>}
            />

            <Route
              path="/manage-items"
              element={<ProtectedRoute auth={auth} roles={["ROLE_SHOPOWNER"]} isRestricted={true} subscriptionInfo={subscriptionInfo}><Manage_Items /></ProtectedRoute>}
            />

            {/* ADMIN ONLY ROUTES */}
            <Route
              path="/manage-users"
              element={
                <ProtectedRoute auth={auth} roles={["ROLE_SUPERADMIN"]}>
                  <Manage_Users />
                </ProtectedRoute>
              }
            />

            <Route
              path="/manage-shops"
              element={
                <ProtectedRoute auth={auth} roles={["ROLE_SUPERADMIN"]}>
                  <ManageShops />
                </ProtectedRoute>
              }
            />

            <Route
              path="/subscription-management"
              element={
                <ProtectedRoute auth={auth} roles={["ROLE_SUPERADMIN"]}>
                  <SubscriptionManagement />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/manage-employees"
              element={
                <ProtectedRoute auth={auth} roles={["ROLE_SHOPOWNER"]} isRestricted={true} subscriptionInfo={subscriptionInfo}>
                  <ManageEmployees />
                </ProtectedRoute>
              }
            />

            {/* ORDERS */}
            <Route
              path="/manage-orders"
              element={
                <ProtectedRoute auth={auth} roles={["ROLE_SHOPOWNER", "ROLE_EMPLOYEE"]} isRestricted={true} subscriptionInfo={subscriptionInfo}>
                  <OrderHistory />
                </ProtectedRoute>
              }
            />

            {/* SETTINGS */}
            <Route
              path="/settings"
              element={
                <ProtectedRoute auth={auth} roles={["ROLE_SUPERADMIN", "ROLE_SHOPOWNER", "ROLE_EMPLOYEE"]}>
                  <Settings />
                </ProtectedRoute>
              }
            />

            {/* IMPORT HISTORY */}
            <Route
              path="/import-history"
              element={
                <ProtectedRoute auth={auth} roles={["ROLE_SHOPOWNER"]} isRestricted={true} subscriptionInfo={subscriptionInfo}>
                  <ImportHistory />
                </ProtectedRoute>
              }
            />

            {/* REPORTS */}
            <Route
              path="/reports"
              element={
                <ProtectedRoute auth={auth} roles={["ROLE_SHOPOWNER", "ROLE_EMPLOYEE"]} isRestricted={true} subscriptionInfo={subscriptionInfo}>
                  <Reports />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </div>

      {showPopup && <ReceiptPopup orderDetails={orderDetails} onClose={() => {
        setShowPopup(false);
        setOrderDetails(null);
      }} />}
    </div>
  );
};

export default App;