import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaInfoCircle } from 'react-icons/fa';
import { Toast, useToast } from '../components/Toast';
import AuthLayout from '../layouts/AuthLayout';

const API = import.meta.env.VITE_API;

function Login({ setIsAuth }) {
  const navigate = useNavigate();
  const { toasts, showToast, removeToast } = useToast();

  const [loginMethod, setLoginMethod] = useState('phone'); // 'phone' or 'email'
  const [step, setStep] = useState('phone'); // 'phone' or 'otp'
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const otpRefs = useRef([]);

  const handleSendOtp = async (event) => {
    event.preventDefault();
    if (!phone || phone.length < 10) {
      showToast('Enter a valid mobile number', 'error');
      return;
    }

    try {
      setLoading(true);
      await axios.post(`${API}/api/vendor-auth/send-otp`, { phone });
      setStep('otp');
      showToast('OTP sent successfully (Use 111111)', 'success');
    } catch (error) {
      console.error(error);
      showToast('Failed to send OTP', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length < 6) {
      showToast('Please enter complete OTP', 'error');
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`${API}/api/vendor-auth/verify-otp`, { phone, otp: otpValue });
      
      if (res.data.isNewUser) {
        // User not found in DB -> Route to onboarding
        localStorage.setItem('tempPhone', phone);
        navigate('/onboarding');
      } else {
        // Existing user -> Login
        localStorage.setItem('vendorToken', res.data.token);
        localStorage.setItem('vendorInfo', JSON.stringify(res.data.vendor));
        setIsAuth(true);
        showToast('Welcome back! Redirecting...', 'success');
        setTimeout(() => navigate('/dashboard'), 450);
      }
    } catch (error) {
      console.error(error);
      showToast(error.response?.data?.message || 'Invalid OTP', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (event) => {
    event.preventDefault();
    if (!email || !password) {
      showToast('Please enter email and password', 'error');
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

  const handleOtpChange = (index, value) => {
    if (!/^[0-9]*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      otpRefs.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1].focus();
    }
  };

  return (
    <AuthLayout>
      <Toast toasts={toasts} removeToast={removeToast} />
      
      <div className="auth-card-container vx-fade-in">
        {step === 'phone' ? (
          <>
            <h2 className="auth-card-title">Get Started</h2>
            <div className="auth-card-subtitle">
              Enter a mobile number or restaurant ID to continue
              
              <div className="auth-info-icon-wrapper">
                <FaInfoCircle size={16} color="#7e808c" />
                <div className="auth-tooltip">
                  <ul>
                    <li>Use registered mobile number for login if you want to track business</li>
                    <li>Use restaurant ID to login if you only want to take orders</li>
                    <li>Use registered mobile for signing-up a new user</li>
                    <li>Enter a mobile number to start onboarding an outlet</li>
                  </ul>
                </div>
              </div>
            </div>

            {loginMethod === 'phone' ? (
              <>
                <form onSubmit={handleSendOtp}>
                  <div className="auth-input-group floating">
                    <input 
                      type="text" 
                      placeholder=" " 
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value)} 
                      disabled={loading} 
                      required 
                    />
                    <label className="auth-floating-label">Enter Restaurant ID / Mobile number</label>
                  </div>

                  <button className="auth-submit-btn" type="submit" disabled={loading || phone.length < 10}>
                    {loading ? 'Please wait...' : 'Continue'}
                  </button>
                </form>
                
                <div style={{ textAlign: 'center', marginTop: '16px' }}>
                  <button 
                    type="button" 
                    onClick={() => setLoginMethod('email')}
                    style={{ background: 'none', border: 'none', color: 'var(--brand)', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    Login with Email & Password instead
                  </button>
                </div>
              </>
            ) : (
              <>
                <form onSubmit={handleEmailLogin}>
                  <div className="auth-input-group floating" style={{ marginBottom: '16px' }}>
                    <input 
                      type="email" 
                      placeholder=" " 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      disabled={loading} 
                      required 
                    />
                    <label className="auth-floating-label">Email Address</label>
                  </div>

                  <div className="auth-input-group floating">
                    <input 
                      type="password" 
                      placeholder=" " 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      disabled={loading} 
                      required 
                    />
                    <label className="auth-floating-label">Password</label>
                  </div>

                  <button className="auth-submit-btn" type="submit" disabled={loading || !email || !password}>
                    {loading ? 'Please wait...' : 'Login'}
                  </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '16px' }}>
                  <button 
                    type="button" 
                    onClick={() => setLoginMethod('phone')}
                    style={{ background: 'none', border: 'none', color: 'var(--brand)', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    Login with Mobile Number instead
                  </button>
                </div>
              </>
            )}
            
            <p className="auth-terms">
              By logging in, I agree to TomoX's <a href="#">terms & conditions</a>
            </p>
          </>
        ) : (
          <>
            <h2 className="auth-card-title">Enter OTP</h2>
            <div className="auth-card-subtitle" style={{marginBottom: '32px'}}>
              Enter OTP sent on number XXXXXX{phone.slice(-4)}
            </div>

            <form onSubmit={handleVerifyOtp}>
              <div className="auth-otp-container">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (otpRefs.current[index] = el)}
                    type="text"
                    maxLength="1"
                    className="auth-otp-input"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    disabled={loading}
                  />
                ))}
              </div>

              <div className="auth-otp-resend">
                Resend OTP (00:27)
              </div>

              <button className="auth-submit-btn" type="submit" disabled={loading || otp.join('').length < 6}>
                {loading ? 'Verifying...' : 'Continue'}
              </button>
            </form>

            <p className="auth-terms">
              By logging in, I agree to TomoX's <a href="#">terms & conditions</a>
            </p>
          </>
        )}
      </div>
    </AuthLayout>
  );
}

export default Login;
