import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { nanoid } from 'nanoid';
import { Toast, useToast } from '../components/Toast';

const API = import.meta.env.VITE_API;

function MenuManager() {
  const vendor = JSON.parse(localStorage.getItem('vendorInfo') || '{}');
  const vendorId = vendor?._id || vendor?.id;
  const { toasts, showToast, removeToast } = useToast();

  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [item, setItem] = useState({ name: '', price: '', description: '', image: '' });
  const [preview, setPreview] = useState('');

  useEffect(() => {
    if (!vendorId) return;

    const fetchMenu = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API}/api/restaurants/vendor/${vendorId}`);
        setMenu(res.data?.menu || []);
      } catch (error) {
        console.error('Menu fetch error:', error);
        showToast('Unable to load menu items', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, [vendorId]);

  const filteredMenu = useMemo(() => {
    const lower = query.toLowerCase();
    const found = menu.filter((menuItem) =>
      (menuItem.name || '').toLowerCase().includes(lower) ||
      (menuItem.description || '').toLowerCase().includes(lower)
    );

    return found.sort((a, b) => {
      if (sortBy === 'price-low') return Number(a.price || 0) - Number(b.price || 0);
      if (sortBy === 'price-high') return Number(b.price || 0) - Number(a.price || 0);
      return (a.name || '').localeCompare(b.name || '');
    });
  }, [menu, query, sortBy]);

  const handleImageChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await axios.post(`${API}/api/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setItem((prev) => ({ ...prev, image: res.data.url }));
      showToast('Image uploaded', 'success');
    } catch (error) {
      console.error('Upload failed:', error);
      showToast('Image upload failed', 'error');
    }
  };

  const handleAdd = async () => {
    if (!item.name || !item.price || !item.image) {
      showToast('Name, price, and image are required', 'warning');
      return;
    }

    const newItem = { ...item, id: nanoid(), price: Number(item.price) };

    try {
      setSubmitting(true);
      await axios.post(`${API}/api/restaurants/vendor/${vendorId}/menu`, newItem);
      setMenu((prev) => [newItem, ...prev]);
      setItem({ name: '', price: '', description: '', image: '' });
      setPreview('');
      showToast('Menu item added', 'success');
    } catch (error) {
      console.error('Add failed:', error);
      showToast('Failed to add menu item', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/api/restaurants/vendor/${vendorId}/menu/${id}`);
      setMenu((prev) => prev.filter((menuItem) => menuItem.id !== id));
      showToast('Item deleted', 'success');
    } catch (error) {
      console.error('Delete failed:', error);
      showToast('Failed to delete item', 'error');
    }
  };

  return (
    <div className="vx-stack">
      <Toast toasts={toasts} removeToast={removeToast} />

      <section className="vx-card vx-fade-in">
        <div className="vx-card-head">
          <div>
            <h3>Create Dish</h3>
            <p>Add a polished menu card with pricing and media.</p>
          </div>
        </div>

        <div className="vx-grid vx-grid-2">
          <div>
            <label className="vx-label">Dish Name</label>
            <input className="vx-input" value={item.name} onChange={(event) => setItem((prev) => ({ ...prev, name: event.target.value }))} placeholder="Truffle Pasta" />
          </div>
          <div>
            <label className="vx-label">Price</label>
            <input className="vx-input" type="number" value={item.price} onChange={(event) => setItem((prev) => ({ ...prev, price: event.target.value }))} placeholder="499" />
          </div>
        </div>

        <div style={{ marginTop: '10px' }}>
          <label className="vx-label">Description</label>
          <textarea className="vx-textarea" value={item.description} onChange={(event) => setItem((prev) => ({ ...prev, description: event.target.value }))} placeholder="Describe flavor, ingredients, and appeal..." />
        </div>

        <div style={{ marginTop: '10px' }}>
          <label className="vx-label">Image</label>
          <input className="vx-input" type="file" accept="image/*" onChange={handleImageChange} />
          {preview && (
            <div style={{ marginTop: '10px' }}>
              <img 
                src={preview} 
                alt="Dish preview" 
                style={{ 
                  width: '100%', 
                  maxWidth: '220px', 
                  height: '140px', 
                  objectFit: 'cover', 
                  borderRadius: '12px',
                  border: '2px solid rgba(252, 128, 25, 0.3)'
                }} 
                className="vx-fade-in"
              />
            </div>
          )}
        </div>

        <div style={{ marginTop: '12px' }}>
          <button className="vx-btn vx-btn-primary" onClick={handleAdd} disabled={submitting}>
            <i className={`fas ${submitting ? 'fa-spinner fa-spin' : 'fa-plus'}`}></i>
            {submitting ? 'Adding...' : 'Add to Menu'}
          </button>
        </div>
      </section>

      <section className="vx-card vx-fade-in" style={{ animationDelay: '0.1s' }}>
        <div className="vx-grid vx-grid-3" style={{ alignItems: 'end' }}>
          <div>
            <label className="vx-label">Search</label>
            <input className="vx-input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Dish name / description" />
          </div>

          <div>
            <label className="vx-label">Sort</label>
            <select className="vx-select" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
              <option value="name">Name (A-Z)</option>
              <option value="price-low">Price Low to High</option>
              <option value="price-high">Price High to Low</option>
            </select>
          </div>

          <article className="vx-card" style={{ padding: '12px' }}>
            <p style={{ margin: 0, color: '#9aa7d4', fontSize: '12px' }}>Visible Items</p>
            <h3 style={{ margin: '6px 0 0' }}>{filteredMenu.length}</h3>
          </article>
        </div>
      </section>

      {loading ? (
        <div className="vx-grid vx-grid-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="vx-card vx-skeleton" style={{ height: '320px' }}></div>
          ))}
        </div>
      ) : filteredMenu.length === 0 ? (
        <div className="vx-empty-state vx-fade-in" style={{ animationDelay: '0.2s' }}>
          <i className="fas fa-utensils" style={{ fontSize: '48px', color: '#fc8019', marginBottom: '16px' }}></i>
          <h4>No dishes yet</h4>
          <p>Create your first menu item to start attracting orders.</p>
        </div>
      ) : (
        <section className="vx-grid vx-grid-3 vx-fade-in" style={{ animationDelay: '0.2s' }}>
          {filteredMenu.map((menuItem) => (
            <article key={menuItem.id} className="vx-card">
              <img 
                src={menuItem.image} 
                alt={menuItem.name} 
                style={{ 
                  width: '100%', 
                  height: '180px', 
                  objectFit: 'cover', 
                  borderRadius: '12px',
                  marginBottom: '10px'
                }} 
              />
              <h3 style={{ marginBottom: '4px', fontSize: '16px' }}>{menuItem.name}</h3>
              <p style={{ marginTop: 0, color: '#9aa7d4', minHeight: '40px', fontSize: '13px' }}>{menuItem.description}</p>
              <div className="vx-row" style={{ justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                <strong style={{ fontSize: '18px', color: '#fc8019' }}>₹{menuItem.price}</strong>
                <button className="vx-btn vx-btn-danger" onClick={() => handleDelete(menuItem.id)}>
                  <i className="fas fa-trash"></i> Delete
                </button>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}

export default MenuManager;
