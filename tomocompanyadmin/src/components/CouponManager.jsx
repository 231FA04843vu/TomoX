import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { API_URL } from "../config";

const initialForm = {
  code: "",
  discountType: "percentage",
  discountValue: "",
  minOrderAmount: "0",
  maxDiscountAmount: "",
  validUntil: "",
  description: "",
  couponType: "standard",
  usageLimit: "",
  isActive: true,
};

const CouponManager = () => {
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);

  const endpoint = useMemo(() => `${API_URL}/coupons`, []);

  const fetchCoupons = async () => {
    try {
      const res = await axios.get(`${endpoint}/all`);
      setCoupons(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch coupons", err);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        code: String(form.code || "").toUpperCase().trim(),
        discountValue: Number(form.discountValue),
        minOrderAmount: Number(form.minOrderAmount || 0),
        maxDiscountAmount: form.maxDiscountAmount ? Number(form.maxDiscountAmount) : null,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
      };

      if (editingId) {
        await axios.put(`${endpoint}/${editingId}`, payload);
      } else {
        await axios.post(endpoint, payload);
      }

      resetForm();
      fetchCoupons();
    } catch (err) {
      console.error("Failed to save coupon", err);
      alert(err?.response?.data?.message || "Failed to save coupon");
    }
  };

  const handleEdit = (coupon) => {
    setEditingId(coupon._id);
    setForm({
      code: coupon.code || "",
      discountType: coupon.discountType || "percentage",
      discountValue: String(coupon.discountValue ?? ""),
      minOrderAmount: String(coupon.minOrderAmount ?? 0),
      maxDiscountAmount: coupon.maxDiscountAmount == null ? "" : String(coupon.maxDiscountAmount),
      validUntil: coupon.validUntil ? new Date(coupon.validUntil).toISOString().slice(0, 16) : "",
      description: coupon.description || "",
      couponType: coupon.couponType || "standard",
      usageLimit: coupon.usageLimit == null ? "" : String(coupon.usageLimit),
      isActive: Boolean(coupon.isActive),
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this coupon offer?")) return;
    try {
      await axios.delete(`${endpoint}/${id}`);
      fetchCoupons();
    } catch (err) {
      console.error("Failed to delete coupon", err);
    }
  };

  return (
    <div className="section-box">
      <h3><i className="fas fa-tags"></i> Coupon Offers Manager</h3>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Coupon Code (e.g. SAVE50)"
          value={form.code}
          onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value }))}
          required
        />

        <select
          value={form.discountType}
          onChange={(e) => setForm((prev) => ({ ...prev, discountType: e.target.value }))}
        >
          <option value="percentage">Percentage</option>
          <option value="fixed">Fixed</option>
        </select>

        <input
          type="number"
          min="1"
          placeholder="Discount Value"
          value={form.discountValue}
          onChange={(e) => setForm((prev) => ({ ...prev, discountValue: e.target.value }))}
          required
        />

        <input
          type="number"
          min="0"
          placeholder="Min Order Amount"
          value={form.minOrderAmount}
          onChange={(e) => setForm((prev) => ({ ...prev, minOrderAmount: e.target.value }))}
        />

        <input
          type="number"
          min="0"
          placeholder="Max Discount Amount (optional)"
          value={form.maxDiscountAmount}
          onChange={(e) => setForm((prev) => ({ ...prev, maxDiscountAmount: e.target.value }))}
        />

        <input
          type="datetime-local"
          value={form.validUntil}
          onChange={(e) => setForm((prev) => ({ ...prev, validUntil: e.target.value }))}
          required
        />

        <input
          type="text"
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
        />

        <select
          value={form.couponType}
          onChange={(e) => setForm((prev) => ({ ...prev, couponType: e.target.value }))}
        >
          <option value="standard">Standard</option>
          <option value="flash">Flash</option>
          <option value="hot">Hot</option>
          <option value="limited">Limited</option>
          <option value="welcome">Welcome</option>
          <option value="save">Save</option>
          <option value="delivery">Delivery</option>
          <option value="mega">Mega</option>
        </select>

        <input
          type="number"
          min="0"
          placeholder="Usage Limit (optional)"
          value={form.usageLimit}
          onChange={(e) => setForm((prev) => ({ ...prev, usageLimit: e.target.value }))}
        />

        <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
          />
          Active
        </label>

        <button type="submit">
          {editingId ? "Update Coupon" : "Create Coupon"}
        </button>
        {editingId && (
          <button type="button" onClick={resetForm} style={{ marginLeft: "8px" }}>
            Cancel Edit
          </button>
        )}
      </form>

      <table>
        <thead>
          <tr>
            <th>Code</th>
            <th>Discount</th>
            <th>Min Order</th>
            <th>Valid Until</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {coupons.map((coupon) => (
            <tr key={coupon._id}>
              <td>{coupon.code}</td>
              <td>
                {coupon.discountType === "percentage"
                  ? `${coupon.discountValue}%`
                  : `₹${coupon.discountValue}`}
              </td>
              <td>₹{coupon.minOrderAmount || 0}</td>
              <td>{coupon.validUntil ? new Date(coupon.validUntil).toLocaleString() : "-"}</td>
              <td>{coupon.isActive ? "Active" : "Inactive"}</td>
              <td>
                <button onClick={() => handleEdit(coupon)}><i className="fas fa-edit"></i> Edit</button>
                <button onClick={() => handleDelete(coupon._id)} style={{ backgroundColor: "#e74c3c" }}>
                  <i className="fas fa-trash"></i> Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CouponManager;
