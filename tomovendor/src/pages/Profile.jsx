import React, { useEffect, useState } from 'react';
import { Toast, useToast } from '../components/Toast';

const API = import.meta.env.VITE_API;

function Profile() {
  const vendor = JSON.parse(localStorage.getItem('vendorInfo') || '{}');
  const token = localStorage.getItem('vendorToken');
  const { toasts, showToast, removeToast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: vendor?.name || '',
    email: vendor?.email || '',
    phone: vendor?.phone || '',
    notificationPreferences: {
      email: vendor?.notificationPreferences?.email !== false,
    },
  });

  useEffect(() => {
    if (!token) return;

    const loadVendorProfile = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API}/api/vendor-auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to load profile');

        const nextVendor = data.vendor || {};
        const nextState = {
          name: nextVendor.name || '',
          email: nextVendor.email || '',
          phone: nextVendor.phone || '',
          notificationPreferences: {
            email: nextVendor.notificationPreferences?.email !== false,
          },
        };

        setFormData(nextState);
        localStorage.setItem('vendorInfo', JSON.stringify(nextVendor));
      } catch (error) {
        showToast(error.message || 'Failed to load profile', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadVendorProfile();
  }, [token, showToast]);

  const handleSave = async () => {
    if (!formData.name || !formData.email) {
      showToast('Name and email are required', 'warning');
      return;
    }

    if (!token) {
      showToast('Please login again', 'error');
      return;
    }

    try {
      setSaving(true);
      const response = await fetch(`${API}/api/vendor-auth/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to update profile');

      localStorage.setItem('vendorInfo', JSON.stringify(data.vendor));
      setFormData((prev) => ({
        ...prev,
        notificationPreferences: {
          email: data.vendor?.notificationPreferences?.email !== false,
        },
      }));

      showToast('Profile updated', 'success');
      setIsEditing(false);
    } catch (error) {
      console.error(error);
      showToast(error.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="vx-grid vx-grid-2">
      <Toast toasts={toasts} removeToast={removeToast} />

      <section className="vx-card vx-fade-in" style={{ textAlign: 'center' }}>
        <div className="vx-vendor-avatar" style={{ margin: '0 auto 10px', width: '76px', height: '76px', borderRadius: '20px', fontSize: '30px' }}>
          {(formData.name || 'V').charAt(0).toUpperCase()}
        </div>
        <h3 style={{ marginBottom: '4px' }}>{formData.name || 'Vendor'}</h3>
        <p style={{ marginTop: 0, color: '#9aa7d4' }}>{formData.email || 'No email'}</p>
        <span className="vx-pill success"><i className="fas fa-circle" style={{ fontSize: '8px' }}></i> Workspace Active</span>
      </section>

      <section className="vx-card vx-fade-in" style={{ animationDelay: '0.1s' }}>
        <div className="vx-card-head">
          <div>
            <h3>{isEditing ? 'Edit Account' : 'Account Details'}</h3>
            <p>Manage owner details and notification preferences for this workspace.</p>
          </div>
          {!isEditing ? (
            <button className="vx-btn vx-btn-primary" onClick={() => setIsEditing(true)} disabled={loading}>
              <i className="fas fa-edit"></i> Edit
            </button>
          ) : null}
        </div>

        {!isEditing ? (
          <div className="vx-grid vx-grid-2">
            <Info label="Restaurant Name" value={formData.name || 'Not set'} />
            <Info label="Email" value={formData.email || 'Not set'} />
            <Info label="Phone" value={formData.phone || 'Not provided'} />
            <Info label="Role" value="Vendor" />
            <Info label="Email Alerts" value={formData.notificationPreferences.email ? 'On' : 'Off'} />
          </div>
        ) : (
          <div className="vx-stack vx-fade-in">
            <div>
              <label className="vx-label">Restaurant Name</label>
              <input className="vx-input" value={formData.name} onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))} />
            </div>
            <div>
              <label className="vx-label">Email</label>
              <input className="vx-input" type="email" value={formData.email} onChange={(event) => setFormData((prev) => ({ ...prev, email: event.target.value }))} />
            </div>
            <div>
              <label className="vx-label">Phone</label>
              <input className="vx-input" value={formData.phone} onChange={(event) => setFormData((prev) => ({ ...prev, phone: event.target.value }))} />
            </div>

            <div className="vx-card" style={{ padding: '12px', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
              <p style={{ margin: '0 0 10px', color: '#9aa7d4', fontSize: '12px' }}>Notification Preferences</p>
              <div className="vx-row" style={{ justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>Email Updates</span>
                <input
                  type="checkbox"
                  checked={formData.notificationPreferences.email}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      notificationPreferences: {
                        ...prev.notificationPreferences,
                        email: event.target.checked,
                      },
                    }))
                  }
                />
              </div>
            </div>

            <div className="vx-row" style={{ gap: '8px' }}>
              <button className="vx-btn vx-btn-primary" onClick={handleSave} disabled={saving}>
                <i className={`fas ${saving ? 'fa-spinner fa-spin' : 'fa-save'}`}></i>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button className="vx-btn" onClick={() => setIsEditing(false)}><i className="fas fa-times"></i> Cancel</button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <article className="vx-card" style={{ padding: '12px' }}>
      <p style={{ margin: 0, color: '#9aa7d4', fontSize: '12px' }}>{label}</p>
      <h4 style={{ margin: '6px 0 0', fontSize: '15px' }}>{value}</h4>
    </article>
  );
}

export default Profile;
