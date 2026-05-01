import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Pages
import Register from "./pages/Register";
import Login from "./pages/Login";
import RestaurantSetup from "./pages/RestaurantSetup";
import Dashboard from "./pages/Dashboard";
import MenuManager from "./pages/MenuManager";
import Orders from "./pages/Orders";
import Analytics from "./pages/Analytics";
import Profile from "./pages/Profile";
import PortalLayout from "./layouts/PortalLayout";

const ProtectedPortal = ({ isAuth }) => {
  if (!isAuth) return <Navigate to="/login" replace />;
  return <PortalLayout />;
};

// App Component
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
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login setIsAuth={setIsAuth} />} />

        <Route element={<ProtectedPortal isAuth={isAuth} />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/restaurant-setup" element={<RestaurantSetup />} />
          <Route path="/menu" element={<MenuManager />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
