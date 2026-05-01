// src/components/AnnouncementManager.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../config";

const AnnouncementManager = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [form, setForm] = useState({ title: "", message: "" });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await axios.get(`${API_URL}/announcements`);
      setAnnouncements(res.data);
    } catch (err) {
      console.error("Failed to fetch announcements", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${API_URL}/announcements/${editingId}`, form);
      } else {
        await axios.post(`${API_URL}/announcements`, form);
      }
      setForm({ title: "", message: "" });
      setEditingId(null);
      fetchAnnouncements();
    } catch (err) {
      console.error("Failed to save announcement", err);
    }
  };

  const handleEdit = (announcement) => {
    setForm({ title: announcement.title, message: announcement.message });
    setEditingId(announcement._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure to delete this announcement?")) return;
    try {
      await axios.delete(`${API_URL}/announcements/${id}`);
      fetchAnnouncements();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  return (
    <div className="section-box">
      <h3><i className="fas fa-bullhorn"></i> Announcement Manager</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />
        <textarea
          placeholder="Message"
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          rows={4}
          required
        />
        <button type="submit">
          {editingId ? "Update Announcement" : "Add Announcement"}
        </button>
      </form>

      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Message</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {announcements.map((a) => (
            <tr key={a._id}>
              <td>{a.title}</td>
              <td>{a.message}</td>
              <td>{new Date(a.createdAt).toLocaleString()}</td>
              <td>
                <button onClick={() => handleEdit(a)}><i className="fas fa-edit"></i> Edit</button>
                <button onClick={() => handleDelete(a._id)} style={{ backgroundColor: "#e74c3c" }}>
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

export default AnnouncementManager;
