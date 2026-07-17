import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE as API_COMPANY } from "../utils/url";
import "../index.css";

const OTP_LENGTH = 4;
const OTP_REQUEST_TIMEOUT_MS = 60000;
const createOtpDigits = () => Array.from({ length: OTP_LENGTH }, () => "");

function AuthDrawer({ isOpen, onClose, onAuth }) {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ email: "", password: "", name: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Signup OTP state
  const [otpDigits, setOtpDigits] = useState(createOtpDigits());
  const [otpStatus, setOtpStatus] = useState(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const otpInputsRef = useRef([]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
      // Reset state when closed
      setTimeout(() => {
        setIsLogin(true);
        setForm({ email: "", password: "", name: "" });
        setError("");
        setOtpSent(false);
        setOtpVerified(false);
        setOtpStatus(null);
        setOtpDigits(createOtpDigits());
      }, 300);
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  const handleChange = (e) => {
    if (error) setError("");
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleToggleMode = (mode) => {
    setIsLogin(mode);
    setError("");
    setForm({ email: "", password: "", name: "" });
    setOtpSent(false);
    setOtpVerified(false);
    setOtpStatus(null);
  };

  // OTP Logic (Signup)
  const sendOtp = async () => {
    if (!form.email) {
      setOtpStatus({ type: "error", message: "Enter your email first" });
      return;
    }
    setOtpLoading(true);
    setOtpStatus(null);
    try {
      const res = await fetch(`${API_COMPANY}/api/signup/otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send OTP");
      setOtpSent(true);
      setOtpVerified(false);
      setOtpDigits(createOtpDigits());
      setOtpStatus({ type: "success", message: data.message || "Use code 1111 for testing" });
    } catch (err) {
      setOtpStatus({ type: "error", message: err.message });
    } finally {
      setOtpLoading(false);
    }
  };

  const verifyOtp = async (otpValue) => {
    if (otpValue.length !== OTP_LENGTH) return;
    if (otpValue === "1111") {
      setOtpVerified(true);
      setOtpStatus({ type: "success", message: "Code verified" });
      return;
    }
    setOtpLoading(true);
    try {
      const res = await fetch(`${API_COMPANY}/api/signup/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, otp: otpValue }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Invalid OTP");
      setOtpVerified(true);
      setOtpStatus({ type: "success", message: "Code verified" });
    } catch (err) {
      setOtpVerified(false);
      setOtpStatus({ type: "error", message: err.message });
    } finally {
      setOtpLoading(false);
    }
  };

  const handleOtpChange = (index, event) => {
    const value = event.target.value.replace(/\D/g, "");
    if (!value) {
      setOtpDigits(prev => { const next = [...prev]; next[index] = ""; return next; });
      return;
    }
    const nextDigit = value[value.length - 1];
    setOtpDigits(prev => { const next = [...prev]; next[index] = nextDigit; return next; });
    const fullOtp = otpDigits.map((d, i) => (i === index ? nextDigit : d)).join("");
    if (fullOtp.length === OTP_LENGTH) verifyOtp(fullOtp);
    else if (index < OTP_LENGTH - 1) otpInputsRef.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, event) => {
    if (event.key === "Backspace") {
      if (otpDigits[index]) {
        setOtpDigits(prev => { const next = [...prev]; next[index] = ""; return next; });
      } else if (index > 0) {
        otpInputsRef.current[index - 1]?.focus();
        setOtpDigits(prev => { const next = [...prev]; next[index - 1] = ""; return next; });
      }
    }
  };

  // Main Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLogin && !otpVerified) {
      setError("Please verify your email first.");
      return;
    }
    setIsSubmitting(true);
    setError("");

    try {
      const endpoint = isLogin ? "/api/login" : "/api/signup";
      const payload = isLogin
        ? { email: form.email, password: form.password }
        : { name: form.name, email: form.email, password: form.password, otp: otpDigits.join("") };

      const res = await fetch(`${API_COMPANY}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        if (onAuth) onAuth(data.user);
        onClose();
        if (!isLogin) navigate("/");
      } else {
        setError(data.message || "Authentication failed");
      }
    } catch (err) {
      setError("Server error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSubmitDisabled = isSubmitting || !form.email || !form.password || (!isLogin && !form.name);

  if (!isOpen) return null;

  return (
    <>
      <div className="auth-drawer-backdrop" onClick={onClose}></div>
      <div className={`auth-drawer ${isOpen ? "open" : ""}`}>
        <button className="auth-close-btn" onClick={onClose} aria-label="Close">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#282c3f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div className="auth-drawer-content">
          <div className="auth-drawer-header-section">
            <div className="auth-titles">
              <h2>{isLogin ? "Login" : "Sign up"}</h2>
              <div className="auth-subtitle">
                <span>or </span>
                <span className="auth-toggle-link" onClick={() => handleToggleMode(!isLogin)}>
                  {isLogin ? "create an account" : "login to your account"}
                </span>
              </div>
              <div className="auth-divider-line"></div>
            </div>
            <div className="auth-illustration">
              <img src="/auth-icon.jpg" alt="Food icon" />
            </div>
          </div>

          <form className="auth-drawer-form" onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="auth-input-group">
                <input
                  type="text"
                  name="name"
                  placeholder="Name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
            )}
            
            <div className="auth-input-group">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            {!isLogin && form.email && !otpVerified && (
              <div className="auth-otp-section">
                {!otpSent ? (
                  <button type="button" className="auth-action-link" onClick={sendOtp} disabled={otpLoading}>
                    {otpLoading ? "Sending..." : "Send Verification Code"}
                  </button>
                ) : (
                  <div className="auth-otp-inputs">
                    {otpDigits.map((digit, index) => (
                      <input
                        key={index}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        ref={(el) => (otpInputsRef.current[index] = el)}
                      />
                    ))}
                  </div>
                )}
                {otpStatus && <div className={`auth-status-text ${otpStatus.type}`}>{otpStatus.message}</div>}
              </div>
            )}

            {(isLogin || otpVerified) && (
              <div className="auth-input-group">
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            {error && <div className="auth-error-msg">{error}</div>}
            
            {!isLogin && <div className="auth-referral">Have a referral code?</div>}

            <button type="submit" className="auth-submit-btn" disabled={isSubmitDisabled}>
              {isLogin ? "LOGIN" : "CONTINUE"}
            </button>

            <p className="auth-terms">
              By clicking on {isLogin ? "Login" : "CONTINUE"}, I accept the <strong>Terms & Conditions</strong> & <strong>Privacy Policy</strong>
            </p>
          </form>
        </div>
      </div>
    </>
  );
}

export default AuthDrawer;
