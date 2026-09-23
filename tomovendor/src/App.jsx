import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Auth & Onboarding
import Login from "./pages/Login";
import Onboarding from "./pages/Onboarding";

// Layout
import PortalLayout from "./layouts/PortalLayout";

// Dashboard Pages
import Orders from "./pages/Orders";
import Growth from "./pages/Growth";
import Discounts from "./pages/Discounts";
import MenuManager from "./pages/MenuManager";
import Complaints from "./pages/Complaints";
import Ratings from "./pages/Ratings";
import Reports from "./pages/Reports";
import Finance from "./pages/Finance";
import Help from "./pages/Help";
import VendorTickets from "./pages/VendorTickets";
import ManageOutlets from "./pages/ManageOutlets";
import UserSettings from "./pages/UserSettings";

const ProtectedPortal = ({ isAuth }) => {
  if (!isAuth) return <Navigate to="/login" replace />;
  return <PortalLayout />;
};

const App = () => {
  const [isAuth, setIsAuth] = useState(!!localStorage.getItem("vendorToken"));

  useEffect(() => {
    const handleStorageChange = () => {
      setIsAuth(!!localStorage.getItem("vendorToken"));
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/orders" replace />} />
        <Route path="/register" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login setIsAuth={setIsAuth} />} />
        <Route path="/onboarding" element={<Onboarding />} />

        <Route element={<ProtectedPortal isAuth={isAuth} />}>
          <Route path="/orders" element={<Orders />} />
          
          <Route path="/growth" element={<Growth />} />
          <Route path="/growth/discounts" element={<Discounts />} />
          
          <Route path="/menu" element={<MenuManager />} />
          <Route path="/complaints" element={<Complaints />} />
          <Route path="/ratings" element={<Ratings />} />
          <Route path="/reports/*" element={<Reports />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/help" element={<Help />} />
          <Route path="/tickets" element={<VendorTickets />} />
          <Route path="/manage-outlets" element={<ManageOutlets />} />
          <Route path="/settings" element={<UserSettings />} />
          
          {/* Legacy redirects */}
          <Route path="/dashboard" element={<Navigate to="/orders" replace />} />
          <Route path="/profile" element={<Navigate to="/settings" replace />} />
          <Route path="/analytics" element={<Navigate to="/reports" replace />} />
        </Route>

        <Route path="*" element={<Navigate to="/orders" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
