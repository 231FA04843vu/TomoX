import React from "react";

const Topbar = () => {
  const vendor = JSON.parse(localStorage.getItem("vendorInfo")) || {};

  return (
    <div className="topbar">
      <h3>Dashboard</h3>
      <div className="profile">
        <span>{vendor.name}</span>
        <img src="https://cdn-icons-png.flaticon.com/512/149/149071.png" alt="profile" />
      </div>
    </div>
  );
};

export default Topbar;
