import React from 'react';

function Step1Info({ formData, setFormData, onNext }) {
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleWorkingDayChange = (day) => {
    const days = [...formData.workingDays];
    if (days.includes(day)) {
      setFormData({ ...formData, workingDays: days.filter(d => d !== day) });
    } else {
      days.push(day);
      setFormData({ ...formData, workingDays: days });
    }
  };

  const allDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div>
      <div className="onboard-page-header">
        <div>
          <h1 className="onboard-page-title">Restaurant Information</h1>
          <p className="card-subtitle" style={{ margin: 0, marginTop: '4px' }}>Name, address and contact details</p>
        </div>
      </div>

      <div className="onboard-form-card">
        <h2 className="card-title">Basic Details</h2>
        <p className="card-subtitle">These details will be shown to customers</p>
        
        <div className="form-group swiggy-input-wrapper">
          <input type="text" name="ownerFullName" placeholder=" " value={formData.ownerFullName} onChange={handleChange} required />
          <label>Owner Full Name</label>
        </div>

        <div className="form-group swiggy-input-wrapper">
          <input type="text" name="restaurantName" placeholder=" " value={formData.restaurantName} onChange={handleChange} required />
          <label>Restaurant Name</label>
        </div>

        <div className="form-group swiggy-input-wrapper">
          <input type="text" name="restaurantAddress" placeholder=" " value={formData.restaurantAddress} onChange={handleChange} required />
          <label>Complete Address</label>
        </div>
      </div>

      <div className="onboard-form-card">
        <h2 className="card-title">Owner Contact Details</h2>
        <p className="card-subtitle">For sharing business updates</p>

        <div className="form-row">
          <div className="swiggy-input-wrapper">
            <input type="email" name="contactEmail" placeholder=" " value={formData.contactEmail} onChange={handleChange} required />
            <label>Owner Email Address</label>
          </div>
          <div className="swiggy-input-wrapper">
            <input type="tel" name="whatsappNumber" placeholder=" " value={formData.whatsappNumber} onChange={handleChange} />
            <label>WhatsApp Number</label>
          </div>
        </div>
      </div>

      <div className="onboard-form-card">
        <h2 className="card-title">Working Days</h2>
        <p className="card-subtitle">Select the days your restaurant will be open</p>

        <div className="swiggy-checkbox-grid">
          {allDays.map(day => (
            <label key={day} className="swiggy-checkbox">
              <input 
                type="checkbox" 
                checked={formData.workingDays.includes(day)}
                onChange={() => handleWorkingDayChange(day)}
              />
              {day}
            </label>
          ))}
        </div>
      </div>

      <div className="onboard-form-card">
        <h2 className="card-title">Opening & Closing Time</h2>
        <p className="card-subtitle">Help customers know when they can order from you</p>

        <div className="swiggy-radio-group">
          <label className="swiggy-radio">
            <input 
              type="radio" 
              name="sameAllDays" 
              checked={formData.timings.sameAllDays === true} 
              onChange={() => setFormData({ ...formData, timings: { ...formData.timings, sameAllDays: true }})}
            />
            Same timings for all days
          </label>
          <label className="swiggy-radio">
            <input 
              type="radio" 
              name="sameAllDays" 
              checked={formData.timings.sameAllDays === false} 
              onChange={() => setFormData({ ...formData, timings: { ...formData.timings, sameAllDays: false }})}
            />
            Different timings for some days
          </label>
        </div>

        <div className="time-picker-row">
          <div className="time-box">
            <i className="far fa-clock"></i> 09:00 AM
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>To</div>
          <div className="time-box">
            <i className="far fa-clock"></i> 10:00 PM
          </div>
        </div>
        <div className="slot-note">We recommend keeping your restaurant open during 7-11 PM to get maximum orders</div>
      </div>
    </div>
  );
}

export default Step1Info;
