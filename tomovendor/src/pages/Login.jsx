import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { Toast, useToast } from '../components/Toast';

const API = import.meta.env.VITE_API;

function Login({ setIsAuth }) {
  const navigate = useNavigate();
  const { toasts, showToast, removeToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();
    if (!email || !password) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`${API}/api/vendor-auth/login`, { email, password });
      localStorage.setItem('vendorToken', res.data.token);
      localStorage.setItem('vendorInfo', JSON.stringify(res.data.vendor));
      setIsAuth(true);
      showToast('Welcome back! Redirecting...', 'success');
      setTimeout(() => navigate('/dashboard'), 450);
    } catch (error) {
      console.error(error);
      showToast(error.response?.data?.message || 'Invalid credentials', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vx-auth">
      <Toast toasts={toasts} removeToast={removeToast} />
      
      <div className="vx-auth-card vx-fade-in">
        <div className="vx-auth-head">
          <div className="vx-auth-badge"><i className="fas fa-store"></i></div>
          <h1>Vendor Access</h1>
          <p>Sign in to control orders, menu, and growth in one command center.</p>
        </div>

        <form className="vx-stack" onSubmit={handleLogin}>
          <div>
            <label className="vx-label">Email Address</label>
            <input className="vx-input" type="email" placeholder="vendor@restaurant.com" value={email} onChange={(event) => setEmail(event.target.value)} disabled={loading} required />
          </div>

          <div>
            <label className="vx-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input className="vx-input" type={showPassword ? 'text' : 'password'} placeholder="Enter password" value={password} onChange={(event) => setPassword(event.target.value)} disabled={loading} style={{ paddingRight: '42px' }} required />
              <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((prev) => !prev)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', color: '#9aa7d4', cursor: 'pointer', width: 'auto', padding: 0, margin: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button className="vx-btn vx-btn-primary" type="submit" disabled={loading}>
            <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-arrow-right'}`}></i>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="vx-auth-foot">
          New vendor? <Link to="/register">Create your account</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
