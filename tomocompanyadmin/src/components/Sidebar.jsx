// src/components/Sidebar.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "../index.css";

const Sidebar = ({ onSelect, current }) => {
  const navigate = useNavigate();

  const items = [
    { key: "vendors", label: "Pending Vendors" },
    { key: "announcements", label: "Announcements" },
    { key: "banners", label: "Banners" },
    { key: "coupons", label: "Coupon Offers" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminInfo");
    navigate("/login");
  };

  return (
    <div className="sidebar">
      <h2 className="sidebar-title">TomoX Admin</h2>
      <ul className="sidebar-list">
        {items.map((item) => (
          <li
            key={item.key}
            className={`sidebar-item ${current === item.key ? "active" : ""}`}
            onClick={() => onSelect(item.key)}
          >
            {item.label}
          </li>
        ))}
      </ul>
      <button className="logout-btn" onClick={handleLogout}>
        <i className="fas fa-sign-out-alt"></i> Logout
      </button>
    </div>
  );
};

export default Sidebar;
