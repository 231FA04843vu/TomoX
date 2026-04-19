import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { Toast, useToast } from '../components/Toast';

const API = import.meta.env.VITE_API;

function Register() {
  const navigate = useNavigate();
  const { toasts, showToast, removeToast } = useToast();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    proof: null,
  });
  const [preview, setPreview] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value, files } = event.target;
    if (name === 'proof') {
      const file = files?.[0];
      setForm((prev) => ({ ...prev, proof: file || null }));

      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result || '');
        reader.readAsDataURL(file);
      } else {
        setPreview('');
      }
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name || !form.email || !form.password || !form.phone || !form.proof) {
      showToast('All fields are required', 'error');
      return;
    }

    if (form.password.length < 6) {
      showToast('Password must be at least 6 characters', 'warning');
      return;
    }

    const payload = new FormData();
    Object.keys(form).forEach((key) => payload.append(key, form[key]));

    try {
      setLoading(true);
      const res = await fetch(`${API}/api/vendors/register`, { method: 'POST', body: payload });
      const result = await res.json();
      if (res.ok) {
        showToast('Account created. Redirecting to login...', 'success');
        setTimeout(() => navigate('/login'), 900);
      } else {
        showToast(result.message || 'Registration failed', 'error');
      }
    } catch (error) {
      console.error(error);
      showToast('Server error. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vx-auth">
      <Toast toasts={toasts} removeToast={removeToast} />
      
      <div className="vx-auth-card vx-fade-in">
        <div className="vx-auth-head">
          <div className="vx-auth-badge"><i className="fas fa-rocket"></i></div>
          <h1>Launch Vendor Profile</h1>
          <p>Onboard your restaurant and activate your digital sales pipeline.</p>
        </div>

        <form className="vx-stack" onSubmit={handleSubmit}>
          <div>
            <label className="vx-label">Restaurant Name</label>
            <input className="vx-input" name="name" value={form.name} onChange={handleChange} placeholder="Urban Spice Kitchen" required />
          </div>

          <div>
            <label className="vx-label">Email Address</label>
            <input className="vx-input" type="email" name="email" value={form.email} onChange={handleChange} placeholder="owner@restaurant.com" required />
          </div>

          <div>
            <label className="vx-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input className="vx-input" type={showPassword ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} placeholder="At least 6 characters" required />
              <button type="button" onClick={() => setShowPassword((prev) => !prev)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', color: '#9aa7d4', cursor: 'pointer' }}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div>
            <label className="vx-label">Phone</label>
            <input className="vx-input" name="phone" value={form.phone} onChange={handleChange} placeholder="+91 98xxxxxx10" required />
          </div>

          <div>
            <label className="vx-label">FSSAI / License Proof</label>
            <input className="vx-input" type="file" name="proof" onChange={handleChange} accept=".jpg,.jpeg,.png,.pdf" required />
            {preview ? <img src={preview} alt="Proof preview" style={{ marginTop: '10px', maxHeight: '120px', borderRadius: '10px' }} /> : null}
          </div>

          <button className="vx-btn vx-btn-primary" type="submit" disabled={loading}>
            <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-circle-check'}`}></i>
            {loading ? 'Creating account...' : 'Create Vendor Account'}
          </button>
        </form>

        <p className="vx-auth-foot">
          Already registered? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
