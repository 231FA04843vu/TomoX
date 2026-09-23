import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import '../styles/dashboard.css';

const API_URL = import.meta.env.VITE_API || 'http://localhost:5000';

function MenuManager() {
  const [activeTab, setActiveTab] = useState('MY MENU');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState(['General']);
  const [selectedCategory, setSelectedCategory] = useState('General');
  const [newCategoryName, setNewCategoryName] = useState('');

  // Item form state
  const [newItem, setNewItem] = useState({ name: '', price: '', description: '', category: 'General' });

  const vendorToken = localStorage.getItem('vendorToken');
  const vendorInfo = JSON.parse(localStorage.getItem('vendorInfo') || '{}');
  const vendorId = vendorInfo?._id || vendorInfo?.id;

  const fetchMenu = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/vendor-menu/menu`, {
        headers: { Authorization: `Bearer ${vendorToken}` }
      });
      const items = res.data || [];
      setMenuItems(items);
      
      const uniqueCats = ['General', ...new Set(items.map(item => item.category).filter(Boolean))];
      setCategories([...new Set(uniqueCats)]);
    } catch (err) {
      console.error('Failed to fetch menu:', err);
    } finally {
      setLoading(false);
    }
  }, [vendorToken]);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  useEffect(() => {
    if (!vendorToken) return;
    const socket = io(API_URL, { auth: { token: vendorToken, isVendor: true } });
    
    socket.on('menu-updated', () => {
      fetchMenu();
    });

    return () => socket.disconnect();
  }, [vendorToken, fetchMenu]);

  const toggleAvailability = async (id, currentStatus) => {
    try {
      setMenuItems(prev => prev.map(item => {
        const itemId = item.id || item._id;
        if (itemId === id) {
          return { ...item, available: !currentStatus };
        }
        return item;
      }));

      await axios.put(`${API_URL}/api/vendor-menu/menu/${id}/toggle`, {}, {
        headers: { Authorization: `Bearer ${vendorToken}` }
      });
    } catch (err) {
      console.error('Failed to toggle item availability:', err);
      fetchMenu();
    }
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    const catName = newCategoryName.trim();
    if (!categories.includes(catName)) {
      setCategories([...categories, catName]);
    }
    setNewCategoryName('');
    setShowCategoryModal(false);
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/vendor-menu/menu`, newItem, {
        headers: { Authorization: `Bearer ${vendorToken}` }
      });
      setShowItemModal(false);
      setNewItem({ name: '', price: '', description: '', category: selectedCategory });
      fetchMenu();
    } catch (err) {
      console.error('Failed to add item:', err);
    }
  };

  const renderCategoryModal = () => (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
      background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', 
      alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{ background: 'white', width: '400px', borderRadius: '8px', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3 style={{ margin: 0 }}>Create a Category</h3>
          <button style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '18px' }} onClick={() => setShowCategoryModal(false)}>✕</button>
        </div>
        
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '13px', color: 'var(--sw-text-light)', marginBottom: '8px' }}>Category name</label>
          <input 
            type="text" 
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Type your Category name*" 
            style={{ width: '100%', padding: '12px', border: '1px solid var(--sw-border)', borderRadius: '4px', marginBottom: '12px' }}
          />
          <button className="sw-btn" style={{ width: '100%' }} onClick={handleAddCategory}>Save</button>
        </div>
      </div>
    </div>
  );

  const renderItemModal = () => (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
      background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', 
      alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{ background: 'white', width: '500px', borderRadius: '8px', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3 style={{ margin: 0 }}>Add New Item</h3>
          <button style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '18px' }} onClick={() => setShowItemModal(false)}>✕</button>
        </div>
        
        <form onSubmit={handleAddItem}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px' }}>Name*</label>
            <input required type="text" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }} />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px' }}>Price*</label>
            <input required type="number" value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }} />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px' }}>Category</label>
            <select value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px' }}>Description</label>
            <textarea value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', minHeight: '80px' }} />
          </div>
          <button type="submit" className="sw-btn" style={{ width: '100%' }}>Add Item</button>
        </form>
      </div>
    </div>
  );

  const disabledCount = menuItems.filter(item => !item.available).length;
  const displayItems = menuItems.filter(item => (item.category || 'General') === selectedCategory);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {showCategoryModal && renderCategoryModal()}
      {showItemModal && renderItemModal()}

      {/* Sub Navbar */}
      <div style={{ display: 'flex', padding: '0 24px', background: 'var(--sw-sidebar-bg)', color: 'white' }}>
        {['MY MENU', 'HISTORY OF MENU CHANGES'].map(tab => (
          <div 
            key={tab} 
            className={`sw-tab ${activeTab === tab ? 'active' : ''}`}
            style={{ color: activeTab === tab ? 'white' : '#93959f', borderColor: activeTab === tab ? 'var(--sw-orange)' : 'transparent', marginBottom: '-1px' }}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </div>
        ))}
      </div>

      <div style={{ background: 'white', padding: '16px 24px', borderBottom: '1px solid var(--sw-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ position: 'relative' }}>
          <i className="fas fa-search" style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--sw-text-light)' }}></i>
          <input 
            type="text" 
            placeholder="Search for an item or category" 
            style={{ width: '300px', padding: '10px 10px 10px 36px', border: '1px solid var(--sw-border)', borderRadius: '4px', outline: 'none' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="sw-btn sw-btn-dark" style={{ background: '#7e808c', display: 'flex', alignItems: 'center', gap: '8px' }}>
            DISABLED <span style={{ background: 'white', color: '#7e808c', padding: '2px 6px', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold' }}>{disabledCount}</span>
          </button>
        </div>
      </div>

      <div className="sw-layout-split" style={{ flex: 1, background: 'var(--sw-bg)' }}>
        {/* Categories Sidebar */}
        <div className="sw-layout-sidebar" style={{ width: '300px', background: 'white', borderRight: '1px solid var(--sw-border)', overflowY: 'auto' }}>
          <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--sw-border)', fontWeight: 'bold', fontSize: '13px' }}>
            <span>CATEGORY ({categories.length})</span>
            <span style={{ color: '#2196f3', cursor: 'pointer' }} onClick={() => setShowCategoryModal(true)}>+ ADD NEW</span>
          </div>
          
          {categories.map(cat => (
            <div key={cat} onClick={() => setSelectedCategory(cat)} style={{ 
              padding: '16px', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              borderBottom: '1px solid var(--sw-border)',
              background: selectedCategory === cat ? '#f5f5f6' : 'white',
              borderLeft: selectedCategory === cat ? '4px solid var(--sw-dark)' : '4px solid transparent',
              cursor: 'pointer'
            }}>
              <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{cat} ({menuItems.filter(i => (i.category || 'General') === cat).length})</span>
            </div>
          ))}
        </div>

        {/* Items Main Area */}
        <div className="sw-layout-main" style={{ padding: 0, overflowY: 'auto' }}>
          <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--sw-border)', background: 'white', position: 'sticky', top: 0, zIndex: 10 }}>
            <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{selectedCategory} ({displayItems.length}) <span style={{ color: 'var(--sw-text-light)', fontWeight: 'normal' }}>| DISABLED ({displayItems.filter(i => !i.available).length})</span></span>
            <span style={{ color: '#2196f3', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }} onClick={() => { setNewItem({...newItem, category: selectedCategory}); setShowItemModal(true); }}>+ ADD NEW ITEM</span>
          </div>

          {loading ? (
            <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LoadingSpinner message="Loading your menu..." />
            </div>
          ) : displayItems.length === 0 ? (
            <div className="sw-empty-state">
              <i className="fas fa-utensils" style={{ fontSize: '48px', color: '#ccc', marginBottom: '16px' }}></i>
              <h3>No items in {selectedCategory}</h3>
              <p>Add items to this category to start selling.</p>
              <button className="sw-btn" onClick={() => { setNewItem({...newItem, category: selectedCategory}); setShowItemModal(true); }} style={{ marginTop: '16px' }}>Add New Item</button>
            </div>
          ) : (
            displayItems.map(item => {
              const itemId = item.id || item._id;
              return (
                <div key={itemId} style={{ background: 'white', padding: '20px', borderBottom: '1px solid var(--sw-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    {item.image ? (
                      <img src={item.image} alt={item.name} style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '8px' }} />
                    ) : (
                      <div style={{ width: '120px', height: '120px', background: '#f0f0f0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className="fas fa-image" style={{ color: '#ccc', fontSize: '24px' }}></i>
                      </div>
                    )}
                    
                    <div>
                      <span style={{ color: 'var(--sw-green)', marginRight: '8px' }}>
                        <i className="fas fa-stop-circle" style={{ fontSize: '12px' }}></i>
                      </span>
                      <strong style={{ fontSize: '16px' }}>{item.name}</strong>
                      <p style={{ margin: '8px 0', fontSize: '15px', color: 'var(--sw-text-dark)', fontWeight: '500' }}>₹{item.price}</p>
                      {item.description && (
                        <p style={{ margin: '4px 0', fontSize: '13px', color: 'var(--sw-text-light)', maxWidth: '400px' }}>{item.description}</p>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                      <input 
                        type="checkbox" 
                        className="sw-toggle" 
                        checked={item.available} 
                        onChange={() => toggleAvailability(itemId, item.available)}
                      />
                      <span style={{ fontSize: '11px', color: item.available ? 'var(--sw-green)' : 'var(--sw-red)', fontWeight: 'bold' }}>
                        {item.available ? 'IN STOCK' : 'OUT OF STOCK'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default MenuManager;
