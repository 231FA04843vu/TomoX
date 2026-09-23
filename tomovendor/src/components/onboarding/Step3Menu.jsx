import React, { useState } from 'react';
import Drawer from './Drawer';

function Step3Menu({ formData, setFormData, onNext }) {
  const [isCuisineDrawerOpen, setIsCuisineDrawerOpen] = useState(false);
  const [cuisineSearch, setCuisineSearch] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, menuFile: e.target.files[0] });
    }
  };

  const handleCuisineToggle = (cuisine) => {
    const cuisines = [...formData.cuisines];
    if (cuisines.includes(cuisine)) {
      setFormData({ ...formData, cuisines: cuisines.filter(c => c !== cuisine) });
    } else {
      cuisines.push(cuisine);
      setFormData({ ...formData, cuisines });
    }
  };

  const allCuisines = ['North Indian', 'South Indian', 'Chinese', 'Biryani', 'Pizzas', 'Burgers', 'Desserts', 'Beverages', 'Fast Food', 'Healthy Food', 'Mughlai', 'Street Food'];

  return (
    <div>
      <div className="onboard-page-header">
        <div>
          <h1 className="onboard-page-title">Menu Setup</h1>
          <p className="card-subtitle" style={{ margin: 0, marginTop: '4px' }}>Food details, Cuisines, and POS</p>
        </div>
      </div>

      <div className="onboard-form-card">
        <h2 className="card-title">POS Integration</h2>
        <p className="card-subtitle">Do you use any Point of Sale system?</p>
        
        <div className="swiggy-radio-group">
          <label className="swiggy-radio">
            <input 
              type="radio" 
              name="hasPos" 
              checked={formData.hasPos === true} 
              onChange={() => setFormData({ ...formData, hasPos: true })}
            />
            Yes, I have a POS system
          </label>
          <label className="swiggy-radio">
            <input 
              type="radio" 
              name="hasPos" 
              checked={formData.hasPos === false} 
              onChange={() => setFormData({ ...formData, hasPos: false })}
            />
            No, I don't use a POS
          </label>
        </div>
      </div>

      <div className="onboard-form-card">
        <h2 className="card-title">Food Details</h2>
        <p className="card-subtitle">Information about the food you serve</p>

        <div className="swiggy-radio-group" style={{ marginBottom: '24px' }}>
          <label className="swiggy-radio">
            <input 
              type="radio" 
              name="foodType" 
              checked={formData.foodType === 'Veg Only'} 
              onChange={() => setFormData({ ...formData, foodType: 'Veg Only' })}
            />
            Veg Only
          </label>
          <label className="swiggy-radio">
            <input 
              type="radio" 
              name="foodType" 
              checked={formData.foodType === 'Both Veg & Non-Veg'} 
              onChange={() => setFormData({ ...formData, foodType: 'Both Veg & Non-Veg' })}
            />
            Both Veg & Non-Veg
          </label>
        </div>

        <div className="swiggy-select-box" onClick={() => setIsCuisineDrawerOpen(true)} style={{ marginBottom: '24px' }}>
          <div className="text" style={{ color: formData.cuisines.length ? '#1f2937' : '#fc8019' }}>
            {formData.cuisines.length > 0 
              ? formData.cuisines.join(', ') 
              : 'Add Cuisines (e.g. North Indian, Chinese)'}
          </div>
          <i className="fas fa-search" style={{ color: '#6b7280' }}></i>
        </div>

        <div className="swiggy-input-wrapper" style={{ maxWidth: '50%' }}>
          <input type="number" name="costForTwo" placeholder=" " value={formData.costForTwo || ''} onChange={handleChange} required />
          <label>Expected Cost for Two (₹)</label>
        </div>
      </div>

      <div className="onboard-form-card">
        <h2 className="card-title">Upload Menu</h2>
        <p className="card-subtitle">Share your menu with prices</p>

        <div className="upload-card">
          <ul className="upload-requirements">
            <li>Upload a PDF or Image of your menu</li>
            <li>Ensure prices are clearly visible</li>
          </ul>
          <label className="upload-btn-outline">
            Upload Menu File
            <input type="file" name="menuFile" accept="image/*,.pdf" onChange={handleFileChange} style={{ display: 'none' }} />
          </label>
          {formData.menuFile && (
            <div className="file-preview">
              <i className="fas fa-file-pdf" style={{ color: '#fc8019', fontSize: '24px' }}></i>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: 600 }}>{formData.menuFile.name}</div>
                <div style={{ fontSize: '11px', color: '#6b7280' }}>Ready to upload</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="onboard-form-card">
        <h2 className="card-title">Packaging Charges</h2>
        <p className="card-subtitle">How do you charge for packaging?</p>
        
        <div className="swiggy-radio-group">
          <label className="swiggy-radio">
            <input 
              type="radio" 
              name="packagingChargeType" 
              checked={formData.packagingChargeType === 'Item-wise'} 
              onChange={() => setFormData({ ...formData, packagingChargeType: 'Item-wise' })}
            />
            Item-wise packaging charge
          </label>
          <label className="swiggy-radio">
            <input 
              type="radio" 
              name="packagingChargeType" 
              checked={formData.packagingChargeType === 'Order-wise'} 
              onChange={() => setFormData({ ...formData, packagingChargeType: 'Order-wise' })}
            />
            Order-wise fixed charge
          </label>
          <label className="swiggy-radio">
            <input 
              type="radio" 
              name="packagingChargeType" 
              checked={formData.packagingChargeType === 'None'} 
              onChange={() => setFormData({ ...formData, packagingChargeType: 'None' })}
            />
            No packaging charge
          </label>
        </div>
      </div>

      <Drawer isOpen={isCuisineDrawerOpen} onClose={() => setIsCuisineDrawerOpen(false)} title="Select Cuisines">
        <input 
          type="text" 
          className="cuisine-search" 
          placeholder="Search cuisines..." 
          value={cuisineSearch}
          onChange={(e) => setCuisineSearch(e.target.value)}
        />
        
        <div className="suggested-title">All Cuisines</div>
        <div className="cuisine-tags">
          {allCuisines.filter(c => c.toLowerCase().includes(cuisineSearch.toLowerCase())).map(cuisine => (
            <div 
              key={cuisine} 
              className={`cuisine-tag ${formData.cuisines.includes(cuisine) ? 'selected' : ''}`}
              onClick={() => handleCuisineToggle(cuisine)}
            >
              {cuisine} {formData.cuisines.includes(cuisine) && <i className="fas fa-check" style={{ marginLeft: '4px' }}></i>}
            </div>
          ))}
        </div>
      </Drawer>
    </div>
  );
}

export default Step3Menu;
