import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Toast, useToast } from '../components/Toast';

const API = import.meta.env.VITE_API || 'https://tb-dddy.onrender.com';

const normalizeAssetUrl = (value) => {
  if (!value) return value;
  const raw = String(value).trim();
  if (!raw) return raw;

  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(raw)) {
    return raw.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i, API.replace(/\/$/, ''));
  }

  if (raw.startsWith('/uploads/')) {
    return `${API.replace(/\/$/, '')}${raw}`;
  }

  if (raw.startsWith('uploads/')) {
    return `${API.replace(/\/$/, '')}/${raw}`;
  }

  return raw;
};

function RestaurantSetup() {
  const vendor = JSON.parse(localStorage.getItem('vendorInfo') || '{}');
  const vendorId = vendor?._id || vendor?.id;
  const { toasts, showToast, removeToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [restaurant, setRestaurant] = useState({
    name: '',
    location: '',
    cuisine: '',
    logo: '',
  });
  const [preview, setPreview] = useState('');

  useEffect(() => {
    if (!vendorId) return;

    const fetchRestaurant = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API}/api/restaurants/vendor/${vendorId}`);
        if (res.data) {
          const savedLogo = normalizeAssetUrl(res.data.logo || '');
          setRestaurant({
            name: res.data.name || '',
            location: res.data.location || '',
            cuisine: Array.isArray(res.data.cuisine) ? res.data.cuisine.join(', ') : '',
            logo: savedLogo,
          });
          setPreview(savedLogo || '');
        }
      } catch (error) {
        console.error(error);
        showToast('Unable to fetch restaurant details', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurant();
  }, [vendorId]);

  const handleLogoChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await axios.post(`${API}/api/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const uploadedLogo = normalizeAssetUrl(res.data.url);
      setRestaurant((prev) => ({ ...prev, logo: uploadedLogo }));
      setPreview(uploadedLogo);

      if (restaurant.name && restaurant.location && restaurant.cuisine) {
        const payload = {
          ...restaurant,
          logo: uploadedLogo,
          cuisine: restaurant.cuisine
            .split(',')
            .map((value) => value.trim())
            .filter(Boolean),
        };
        await axios.post(`${API}/api/restaurants/vendor/${vendorId}`, payload);
        showToast('Logo uploaded and saved', 'success');
      } else {
        showToast('Logo uploaded. Click Save Configuration to persist.', 'success');
      }
    } catch (error) {
      console.error(error);
      showToast('Logo upload failed', 'error');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!restaurant.name || !restaurant.location || !restaurant.cuisine) {
      showToast('Fill all required fields', 'warning');
      return;
    }

    const payload = {
      ...restaurant,
      cuisine: restaurant.cuisine
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean),
    };

    try {
      setSaving(true);
      await axios.post(`${API}/api/restaurants/vendor/${vendorId}`, payload);
      showToast('Restaurant details saved', 'success');
    } catch (error) {
      console.error(error);
      showToast('Failed to save details', 'error');
    } finally {
      setSaving(false);
    }
  };

  return loading ? (
    <div className="vx-stack" style={{ padding: '60px' }}>
      <div className="vx-grid vx-grid-2">
        {[1, 2].map((i) => (
          <div key={i} className="vx-card vx-skeleton" style={{ height: '400px' }}></div>
        ))}
      </div>
    </div>
  ) : (
    <div className="vx-grid vx-grid-2">
      <Toast toasts={toasts} removeToast={removeToast} />

      <section className="vx-card vx-fade-in">
        <div className="vx-card-head">
          <div>
            <h3>Restaurant Branding</h3>
            <p>Upload logo and tune storefront identity assets.</p>
          </div>
        </div>

        <div className="vx-stack">
          <div>
            <label className="vx-label">Restaurant Logo</label>
            <input type="file" accept="image/*" className="vx-input" onChange={handleLogoChange} />
          </div>
          {preview ? (
            <img 
              src={preview} 
              alt="Logo Preview" 
              className="vx-fade-in"
              style={{ 
                width: '120px', 
                height: '120px', 
                borderRadius: '14px', 
                objectFit: 'cover',
                border: '2px solid rgba(252, 128, 25, 0.3)'
              }} 
            />
          ) : (
            <div className="vx-card" style={{ padding: '20px', color: '#9aa7d4', fontSize: '13px', textAlign: 'center' }}>
              <i className="fas fa-image" style={{ fontSize: '32px', marginBottom: '8px', color: '#fc8019' }}></i>
              <p style={{ margin: '0' }}>Upload a square logo for best storefront presentation.</p>
            </div>
          )}
        </div>
      </section>

      <section className="vx-card vx-fade-in" style={{ animationDelay: '0.1s' }}>
        <div className="vx-card-head">
          <div>
            <h3>Business Profile</h3>
            <p>Control how customers discover your restaurant.</p>
          </div>
        </div>

        <form className="vx-stack" onSubmit={handleSubmit}>
          <div>
            <label className="vx-label">Restaurant Name</label>
            <input className="vx-input" value={restaurant.name} onChange={(event) => setRestaurant((prev) => ({ ...prev, name: event.target.value }))} />
          </div>

          <div>
            <label className="vx-label">Location / Address</label>
            <input className="vx-input" value={restaurant.location} onChange={(event) => setRestaurant((prev) => ({ ...prev, location: event.target.value }))} />
          </div>

          <div>
            <label className="vx-label">Cuisine Types</label>
            <input className="vx-input" value={restaurant.cuisine} onChange={(event) => setRestaurant((prev) => ({ ...prev, cuisine: event.target.value }))} placeholder="Italian, Indian, Thai" />
          </div>

          <button className="vx-btn vx-btn-primary" type="submit" disabled={saving}>
            <i className={`fas ${saving ? 'fa-spinner fa-spin' : 'fa-check'}`}></i>
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </form>
      </section>
    </div>
  );
}

export default RestaurantSetup;
