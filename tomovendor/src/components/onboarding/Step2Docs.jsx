import React, { useState } from 'react';
import Drawer from './Drawer';

function Step2Docs({ formData, setFormData, onNext }) {
  const [isOutletDrawerOpen, setIsOutletDrawerOpen] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, panImage: e.target.files[0] });
    }
  };

  return (
    <div>
      <div className="onboard-page-header">
        <div>
          <h1 className="onboard-page-title">Restaurant Documents</h1>
          <p className="card-subtitle" style={{ margin: 0, marginTop: '4px' }}>PAN, GSTIN, FSSAI and Bank Details</p>
        </div>
      </div>

      <div className="onboard-form-card">
        <h2 className="card-title">Select Outlet Type</h2>
        <p className="card-subtitle">Choose the category that best describes your food business</p>
        
        <div className="swiggy-select-box" onClick={() => setIsOutletDrawerOpen(true)}>
          <div className="text">{formData.outletType || 'Select Outlet Type'}</div>
          <i className="fas fa-chevron-down"></i>
        </div>
      </div>

      <div className="onboard-form-card">
        <h2 className="card-title">PAN & GSTIN</h2>
        <p className="card-subtitle">Required for taxation purposes</p>

        <div className="form-row">
          <div className="swiggy-input-wrapper">
            <input type="text" name="panNumber" placeholder=" " value={formData.panNumber} onChange={handleChange} required />
            <label>PAN Number</label>
          </div>
          <div className="swiggy-input-wrapper">
            <input type="text" name="gstin" placeholder=" " value={formData.gstin} onChange={handleChange} />
            <label>GSTIN (Optional)</label>
          </div>
        </div>

        <div style={{ marginTop: '24px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#3f3f46', marginBottom: '12px' }}>Upload PAN Card</h3>
          <div className="upload-card">
            <ul className="upload-requirements">
              <li>Upload a clear picture of your PAN card</li>
              <li>Size should be less than 5MB</li>
            </ul>
            <label className="upload-btn-outline">
              Upload Image
              <input type="file" name="panImage" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
            </label>
            {formData.panImage && (
              <div className="file-preview">
                <i className="fas fa-file-image" style={{ color: '#fc8019', fontSize: '24px' }}></i>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>{formData.panImage.name}</div>
                  <div style={{ fontSize: '11px', color: '#6b7280' }}>Ready to upload</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="onboard-form-card">
        <h2 className="card-title">Official Bank Details</h2>
        <p className="card-subtitle">Bank account where your payouts will be credited</p>

        <div className="form-row">
          <div className="swiggy-input-wrapper">
            <input type="text" name="bankIfsc" placeholder=" " value={formData.bankIfsc} onChange={handleChange} required />
            <label>Bank IFSC</label>
          </div>
          <div className="swiggy-input-wrapper">
            <input type="text" name="bankAccount" placeholder=" " value={formData.bankAccount} onChange={handleChange} required />
            <label>Bank Account Number</label>
          </div>
        </div>
      </div>

      <div className="onboard-form-card">
        <h2 className="card-title">FSSAI Registration</h2>
        <p className="card-subtitle">Food Safety and Standards Authority of India</p>

        <div className="swiggy-input-wrapper" style={{ maxWidth: '50%' }}>
          <input type="text" name="fssaiNumber" placeholder=" " value={formData.fssaiNumber} onChange={handleChange} required />
          <label>FSSAI Registration Number</label>
        </div>
      </div>

      <Drawer isOpen={isOutletDrawerOpen} onClose={() => setIsOutletDrawerOpen(false)} title="Select your outlet type">
        <div 
          className={`category-card ${formData.outletType === 'Category I' ? 'selected' : ''}`}
          onClick={() => { setFormData({ ...formData, outletType: 'Category I' }); setIsOutletDrawerOpen(false); }}
        >
          <div className="category-header">
            <div className="category-title">Category I</div>
            <div className="category-select">Select</div>
          </div>
          <div className="category-desc">Establishments preparing and serving fresh food. Applicable GST is generally 5% without ITC.</div>
          <div className="category-footer">Restaurants, Cloud Kitchens, Cafes</div>
        </div>
        
        <div 
          className={`category-card ${formData.outletType === 'Category II' ? 'selected' : ''}`}
          onClick={() => { setFormData({ ...formData, outletType: 'Category II' }); setIsOutletDrawerOpen(false); }}
        >
          <div className="category-header">
            <div className="category-title">Category II</div>
            <div className="category-select">Select</div>
          </div>
          <div className="category-desc">Establishments selling pre-packaged goods only. GST rates vary based on items sold.</div>
          <div className="category-footer">Bakeries, Sweet Shops, Grocery Stores</div>
        </div>

        <div 
          className={`category-card ${formData.outletType === 'Category III' ? 'selected' : ''}`}
          onClick={() => { setFormData({ ...formData, outletType: 'Category III' }); setIsOutletDrawerOpen(false); }}
        >
          <div className="category-header">
            <div className="category-title">Category III</div>
            <div className="category-select">Select</div>
          </div>
          <div className="category-desc">Establishments operating in special economic zones or specific high-end hotels. GST is generally 18% with ITC.</div>
          <div className="category-footer">5-Star Hotels, Premium Dining</div>
        </div>
      </Drawer>
    </div>
  );
}

export default Step2Docs;
