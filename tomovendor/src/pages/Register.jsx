import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaInfoCircle } from 'react-icons/fa';
import { Toast, useToast } from '../components/Toast';
import AuthLayout from '../layouts/AuthLayout';

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
    <AuthLayout>
      <Toast toasts={toasts} removeToast={removeToast} />
      
      <div className="auth-card-container vx-fade-in">
        <h2 className="auth-card-title">Apply Now</h2>
        <div className="auth-card-subtitle">
          Provide your details to list your restaurant
          <FaInfoCircle size={16} color="#7e808c" />
        </div>

        <form onSubmit={handleSubmit}>
          <div className="auth-input-group">
            <input 
              name="name" 
              value={form.name} 
              onChange={handleChange} 
              placeholder="Restaurant Name" 
              disabled={loading} 
              required 
            />
          </div>

          <div className="auth-input-group">
            <input 
              type="email" 
              name="email" 
              value={form.email} 
              onChange={handleChange} 
              placeholder="Email address" 
              disabled={loading} 
              required 
            />
          </div>

          <div className="auth-input-group">
            <input 
              type={showPassword ? 'text' : 'password'} 
              name="password" 
              value={form.password} 
              onChange={handleChange} 
              placeholder="Enter password (min 6 chars)" 
              disabled={loading} 
              style={{ paddingRight: '46px' }} 
              required 
            />
            <button 
              type="button" 
              aria-label={showPassword ? 'Hide password' : 'Show password'} 
              onClick={() => setShowPassword((prev) => !prev)} 
              style={{ 
                position: 'absolute', 
                right: '16px', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                border: 'none', 
                background: 'transparent', 
                color: '#7e808c', 
                cursor: 'pointer', 
                padding: 0, 
                display: 'inline-flex'
              }}
            >
              {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
            </button>
          </div>

          <div className="auth-input-group">
            <input 
              name="phone" 
              value={form.phone} 
              onChange={handleChange} 
              placeholder="Phone number" 
              disabled={loading} 
              required 
            />
          </div>

          <div className="auth-input-group">
            <label style={{display: 'block', fontSize: '13px', color: '#7e808c', marginBottom: '8px', fontWeight: '600'}}>FSSAI / License Proof (Required)</label>
            <input 
              type="file" 
              name="proof" 
              onChange={handleChange} 
              accept=".jpg,.jpeg,.png,.pdf" 
              disabled={loading} 
              required 
              style={{ padding: '12px' }}
            />
            {preview ? <img src={preview} alt="Proof preview" style={{ marginTop: '10px', maxHeight: '80px', borderRadius: '6px' }} /> : null}
          </div>

          <button className="auth-submit-btn" type="submit" disabled={loading || !form.name || !form.email || !form.password || !form.phone || !form.proof}>
            {loading ? 'Please wait...' : 'Submit Application'}
          </button>
        </form>

        <p className="auth-terms">
          By registering, I agree to TomoX's <a href="#">terms & conditions</a>
        </p>

        <Link to="/login" className="auth-switch-link">
          Already a partner? Login here
        </Link>
      </div>
    </AuthLayout>
  );
}

export default Register;
