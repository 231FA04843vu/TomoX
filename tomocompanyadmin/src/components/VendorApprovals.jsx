import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE, API_URL } from "../config";

const VendorApprovals = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPendingVendors = async () => {
    try {
      const res = await axios.get(`${API_URL}/pending-vendors`);
      setVendors(res.data);
    } catch (err) {
      console.error("Error fetching vendors", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingVendors();
  }, []);

  const approveVendor = async (id) => {
    try {
      await axios.post(`${API_URL}/vendor-approvals/approve/${id}`);
      alert("Vendor approved successfully");
      fetchPendingVendors();
    } catch (err) {
      console.error("Approval failed", err);
      alert("Approval failed");
    }
  };

  const rejectVendor = async (id) => {
    try {
      await axios.post(`${API_URL}/vendor-approvals/reject/${id}`);
      alert("Vendor rejected and notified via email");
      fetchPendingVendors();
    } catch (err) {
      console.error("Rejection failed", err);
      alert("Rejection failed");
    }
  };

  if (loading) return <div className="section-box"><p>Loading pending vendors...</p></div>;
  if (vendors.length === 0) return <div className="section-box"><p>No pending vendors found.</p></div>;

  return (
    <div className="section-box">
      <h3><i className="fas fa-user-check"></i> Pending Vendor Approvals</h3>
      {vendors.map((vendor) => (
        <div className="vendor-card" key={vendor._id}>
          <p><strong>Name:</strong> {vendor.name}</p>
          <p><strong>Email:</strong> {vendor.email}</p>
          <p><strong>Submitted At:</strong> {new Date(vendor.createdAt).toLocaleString()}</p>
          {vendor.proofDocument && (
            <p>
              <strong>Proof:</strong>{" "}
              <a href={`${API_BASE}/${vendor.proofDocument}`} target="_blank" rel="noreferrer">
                View Document
              </a>
            </p>
          )}
          <div className="action-buttons">
            <button className="approve-btn" onClick={() => approveVendor(vendor._id)}>
              <i className="fas fa-check-circle"></i> Approve
            </button>
            <button className="reject-btn" onClick={() => rejectVendor(vendor._id)}>
              <i className="fas fa-times-circle"></i> Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default VendorApprovals;
