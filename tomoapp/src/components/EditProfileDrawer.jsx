import React, { useState } from 'react';

const EditProfileDrawer = ({ isOpen, onClose, user }) => {
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [phone, setPhone] = useState('8520004688');
  const [email, setEmail] = useState('allavamsikrishna33@gmail.com');

  if (!isOpen) return null;

  return (
    <div className="edit-profile-drawer-overlay" onClick={onClose} style={{ zIndex: 1000 }}>
      <div 
        className="edit-profile-drawer-container" 
        onClick={(e) => e.stopPropagation()}
        style={{ padding: '40px 50px', fontFamily: '"Proxima Nova", "Inter", sans-serif' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '50px' }}>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: '#282c3f', padding: '0 24px 0 0', fontWeight: '300' }}>
            <i className="fas fa-times"></i>
          </button>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#282c3f', margin: 0, letterSpacing: '-0.3px' }}>Edit profile</h2>
        </div>
        <div className="edit-profile-body">
          <div style={{ borderBottom: '1px solid #d4d5d9', paddingBottom: '32px', marginBottom: '32px' }}>
            <h3 style={{ fontSize: '16px', color: '#3d4152', fontWeight: '600', marginBottom: '20px' }}>Phone number</h3>
            {!isEditingPhone ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '15px', color: '#686b78', fontWeight: '400' }}>{phone}</span>
                <button 
                  onClick={() => {
                    setIsEditingPhone(true);
                    setIsEditingEmail(false);
                  }}
                  style={{ background: 'none', border: 'none', color: '#fc8019', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}
                >
                  CHANGE
                </button>
              </div>
            ) : (
              <div>
                <div style={{ border: '1px solid #d4d5d9', padding: '10px 20px 5px', display: 'flex', flexDirection: 'column' }}>
                  <label style={{ fontSize: '12px', color: '#93959f', fontWeight: '600', marginBottom: '5px' }}>New phone number</label>
                  <input 
                    type="text" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{ border: 'none', outline: 'none', fontSize: '15px', color: '#282c3f', fontWeight: '500', padding: 0 }}
                    autoFocus
                  />
                </div>
                <button 
                  onClick={() => setIsEditingPhone(false)}
                  style={{ width: '100%', padding: '15px', marginTop: '20px', background: '#fc8019', color: '#fff', border: 'none', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}
                >
                  VERIFY
                </button>
              </div>
            )}
          </div>

          <div>
            <h3 style={{ fontSize: '16px', color: '#3d4152', fontWeight: '600', marginBottom: '20px' }}>Email id</h3>
            {!isEditingEmail ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '15px', color: '#686b78', fontWeight: '400' }}>{email}</span>
                <button 
                  onClick={() => {
                    setIsEditingEmail(true);
                    setIsEditingPhone(false);
                  }}
                  style={{ background: 'none', border: 'none', color: '#fc8019', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}
                >
                  CHANGE
                </button>
              </div>
            ) : (
              <div>
                <div style={{ border: '1px solid #d4d5d9', padding: '10px 20px 5px', display: 'flex', flexDirection: 'column' }}>
                  <label style={{ fontSize: '12px', color: '#93959f', fontWeight: '600', marginBottom: '5px' }}>Email id</label>
                  <input 
                    type="text" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ border: 'none', outline: 'none', fontSize: '15px', color: '#282c3f', fontWeight: '500', padding: 0 }}
                    autoFocus
                  />
                </div>
                <button 
                  onClick={() => setIsEditingEmail(false)}
                  style={{ width: '100%', padding: '15px', marginTop: '20px', background: '#fc8019', color: '#fff', border: 'none', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}
                >
                  UPDATE
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfileDrawer;
