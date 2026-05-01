import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import VendorApprovals from "../components/VendorApprovals";
import AnnouncementManager from "../components/AnnouncementManager";
import BannerManager from "../components/BannerManager";
import CouponManager from "../components/CouponManager";

const Dashboard = () => {
  const [section, setSection] = useState("vendors");

  const renderSection = () => {
    switch (section) {
      case "vendors":
        return <VendorApprovals />;
      case "announcements":
        return <AnnouncementManager />;
      case "banners":
        return <BannerManager />;
      case "coupons":
        return <CouponManager />;
      default:
        return <VendorApprovals />;
    }
  };

  return (
    <div className="admin-dashboard">
      <Sidebar onSelect={setSection} current={section} />
      <div className="admin-content">
        <h2 className="admin-header">{section.toUpperCase()} Section</h2>
        {renderSection()}
      </div>
    </div>
  );
};

export default Dashboard;
