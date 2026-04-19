import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { API_URL } from "../config";

const Vendors = () => {
  const [vendors, setVendors] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/vendors/pending`)
      .then((res) => res.json())
      .then(setVendors);
  }, []);

  const approveVendor = async (id) => {
    await fetch(`${API_URL}/vendors/approve/${id}`, {
      method: "PATCH",
    });
    setVendors((prev) => prev.filter((v) => v._id !== id));
  };

  return (
    <>
      <Navbar />
      <h2>Pending Vendor Requests</h2>
      {vendors.map((vendor) => (
        <div key={vendor._id} className="vendor-card">
          <p>Name: {vendor.name}</p>
          <p>Email: {vendor.email}</p>
          <p>Proof: <a href={vendor.document} target="_blank">View Document</a></p>
          <button onClick={() => approveVendor(vendor._id)}>Approve</button>
        </div>
      ))}
    </>
  );
};

export default Vendors;
