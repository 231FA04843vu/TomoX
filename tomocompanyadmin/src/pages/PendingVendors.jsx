// src/pages/PendingVendors.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../config";

function PendingVendors() {
  const [vendors, setVendors] = useState([]);

  useEffect(() => {
    axios.get(`${API_URL}/pending-vendors`)
      .then(res => {
        console.log("✅ Pending vendors loaded:", res.data);
        setVendors(res.data);
      })
      .catch(err => {
        console.error("❌ Error loading pending vendors:", err);
      });
  }, []);

  const approveVendor = async (id) => {
    try {
      console.log("🛠️ Approving vendor with ID:", id);
      const res = await axios.post(`${API_URL}/vendor-approvals/approve/${id}`);
      console.log("✅ Approval response:", res.data);

      setVendors(prev => prev.filter(v => v._id !== id));
      alert("Vendor approved!");
    } catch (err) {
      console.error("❌ Approval failed:", err.response?.data || err.message);
      alert("Approval failed: " + (err.response?.data?.error || "Server error"));
    }
  };

  return (
    <div className="vendor-approval-page">
      <h2>Pending Vendor Requests</h2>
      <ul>
        {vendors.map(vendor => (
          <li key={vendor._id}>
            <strong>{vendor.name}</strong> - {vendor.email}
            <button onClick={() => approveVendor(vendor._id)}>Approve</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PendingVendors;
