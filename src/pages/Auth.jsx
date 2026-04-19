import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import tomoxLogo from "../assets/tomologo.png";

const API_COMPANY = import.meta.env.VITE_API_COMPANY;
const ALLOWED_EMAIL_DOMAINS = ["@gmail.com", "@domain.com"];

const isValidEmailDomain = (email) => {
  if (!email) return false;
  return ALLOWED_EMAIL_DOMAINS.some((domain) => email.toLowerCase().endsWith(domain));
};

function Auth({ onAuth }) {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ email: "", password: "", name: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);
  const [otpDigits, setOtpDigits] = useState(["", "", "", ""]);
  const [otpStatus, setOtpStatus] = useState(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetPassword, setResetPassword] = useState("");
  const [resetOtpDigits, setResetOtpDigits] = useState(["", "", "", ""]);
  const [resetOtpSent, setResetOtpSent] = useState(false);
  const [resetOtpVerified, setResetOtpVerified] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetCooldown, setResetCooldown] = useState(0);
  const [resetStatus, setResetStatus] = useState(null);
  const [resetShowPassword, setResetShowPassword] = useState(false);
  const lastVerifiedOtpRef = useRef("");
  const resetOtpInputsRef = useRef([]);
  const resetLastVerifiedOtpRef = useRef("");

  const handleChange = (e) => {
    if (error) {
      setError("");
    }
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleToggleMode = (nextIsLogin) => {
    setIsLogin(nextIsLogin);
    setError("");
    setOtpDigits(["", "", "", ""]);
    setOtpStatus(null);
    setOtpSent(false);
    setOtpVerified(false);
    setOtpCooldown(0);
    setAuthSuccess(false);
  };

  useEffect(() => {
    if (otpCooldown <= 0) return;
    const intervalId = setInterval(() => {
      setOtpCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(intervalId);
  }, [otpCooldown]);

  useEffect(() => {
    setOtpDigits(["", "", "", ""]);
    setOtpStatus(null);
    setOtpSent(false);
    setOtpVerified(false);
    setOtpCooldown(0);
    lastVerifiedOtpRef.current = "";
  }, [form.email]);

  useEffect(() => {
    if (resetCooldown <= 0) return;
    const intervalId = setInterval(() => {
      setResetCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(intervalId);
  }, [resetCooldown]);

  useEffect(() => {
    const otpValue = resetOtpDigits.join("");
    if (otpValue.length !== 4) return;
    if (resetLoading) return;
    if (otpValue === resetLastVerifiedOtpRef.current) return;
    if (!resetOtpSent) return;

    resetLastVerifiedOtpRef.current = otpValue;
    verifyResetOtp(otpValue);
  }, [resetOtpDigits, resetLoading, resetOtpSent]);

  useEffect(() => {
    const otpValue = otpDigits.join("");
    if (otpValue.length !== 4) return;
    if (otpLoading) return;
    if (otpValue === lastVerifiedOtpRef.current) return;
    if (!otpSent) return;

    lastVerifiedOtpRef.current = otpValue;
    verifyOtp(otpValue);
  }, [otpDigits, otpLoading, otpSent]);

  const otpInputsRef = useRef([]);

  const handleOtpChange = (index, event) => {
    const value = event.target.value.replace(/\D/g, "");
    if (!value) {
      setOtpDigits((prev) => {
        const next = [...prev];
        next[index] = "";
        return next;
      });
      return;
    }

    const nextDigit = value[value.length - 1];
    setOtpDigits((prev) => {
      const next = [...prev];
      next[index] = nextDigit;
      return next;
    });

    if (index < 3) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, event) => {
    if (event.key !== "Backspace") return;
    if (otpDigits[index]) {
      setOtpDigits((prev) => {
        const next = [...prev];
        next[index] = "";
        return next;
      });
      return;
    }

    if (index > 0) {
      otpInputsRef.current[index - 1]?.focus();
      setOtpDigits((prev) => {
        const next = [...prev];
        next[index - 1] = "";
        return next;
      });
    }
  };

  const handleOtpPaste = (event) => {
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (!pasted) return;
    event.preventDefault();
    const nextDigits = ["", "", "", ""];
    pasted.split("").forEach((digit, idx) => {
      if (idx < 4) nextDigits[idx] = digit;
    });
    setOtpDigits(nextDigits);
    const focusIndex = Math.min(pasted.length, 4) - 1;
    otpInputsRef.current[focusIndex]?.focus();
  };

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
      setOtpStatus({ type: "success", message: "OTP sent to email" });
      setOtpCooldown(30);
    } catch (err) {
      setOtpStatus({ type: "error", message: err.message || "Failed to send OTP" });
    } finally {
      setOtpLoading(false);
    }
  };

  const verifyOtp = async (otpValue) => {
    if (otpValue.length !== 4) {
      setOtpStatus({ type: "error", message: "Enter 4-digit OTP" });
      return;
    }

    setOtpLoading(true);
    setOtpStatus(null);
    try {
      const res = await fetch(`${API_COMPANY}/api/signup/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, otp: otpValue }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "OTP verification failed");
      setOtpVerified(true);
      setOtpStatus({ type: "success", message: "Email verified" });
    } catch (err) {
      setOtpVerified(false);
      setOtpStatus({ type: "error", message: err.message || "OTP verification failed" });
    } finally {
      setOtpLoading(false);
    }
  };

  const sendResetOtp = async () => {
    if (!resetEmail) {
      setResetStatus({ type: "error", message: "Enter your email first" });
      return;
    }

    setResetLoading(true);
    setResetStatus(null);
    try {
      const res = await fetch(`${API_COMPANY}/api/reset-password/otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send OTP");
      setResetOtpSent(true);
      setResetOtpVerified(false);
      setResetStatus({ type: "success", message: "OTP sent to email" });
      setResetCooldown(30);
    } catch (err) {
      setResetStatus({ type: "error", message: err.message || "Failed to send OTP" });
    } finally {
      setResetLoading(false);
    }
  };

  const verifyResetOtp = async (otpValue) => {
    if (otpValue.length !== 4) {
      setResetStatus({ type: "error", message: "Enter 4-digit OTP" });
      return;
    }

    setResetLoading(true);
    setResetStatus(null);
    try {
      const res = await fetch(`${API_COMPANY}/api/signup/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail, otp: otpValue }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "OTP verification failed");
      setResetOtpVerified(true);
      setResetStatus({ type: "success", message: "Email verified" });
    } catch (err) {
      setResetOtpVerified(false);
      setResetStatus({ type: "error", message: err.message || "OTP verification failed" });
    } finally {
      setResetLoading(false);
    }
  };

  const handleResetOtpChange = (index, event) => {
    const value = event.target.value.replace(/\D/g, "");
    if (!value) {
      setResetOtpDigits((prev) => {
        const next = [...prev];
        next[index] = "";
        return next;
      });
      return;
    }

    const nextDigit = value[value.length - 1];
    setResetOtpDigits((prev) => {
      const next = [...prev];
      next[index] = nextDigit;
      return next;
    });

    if (index < 3) {
      resetOtpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleResetOtpKeyDown = (index, event) => {
    if (event.key !== "Backspace") return;
    if (resetOtpDigits[index]) {
      setResetOtpDigits((prev) => {
        const next = [...prev];
        next[index] = "";
        return next;
      });
      return;
    }

    if (index > 0) {
      resetOtpInputsRef.current[index - 1]?.focus();
      setResetOtpDigits((prev) => {
        const next = [...prev];
        next[index - 1] = "";
        return next;
      });
    }
  };

  const submitPasswordReset = async (e) => {
    e.preventDefault();
    if (!resetEmail || !resetPassword) {
      setResetStatus({ type: "error", message: "All fields required" });
      return;
    }

    setResetLoading(true);
    setResetStatus(null);
    try {
      const res = await fetch(`${API_COMPANY}/api/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: resetEmail,
          otp: resetOtpDigits.join(""),
          newPassword: resetPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Password reset failed");

      if (data.token) {
        localStorage.setItem("token", data.token);
        setAuthSuccess(true);
        setTimeout(() => {
          onAuth(data.user);
          navigate("/");
        }, 5000);
      } else {
        setResetStatus({ type: "success", message: "Password reset successful. Signing in..." });
        setTimeout(() => setIsResetMode(false), 1500);
      }
    } catch (err) {
      setResetStatus({ type: "error", message: err.message || "Password reset failed" });
    } finally {
      setResetLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const endpoint = isLogin ? "/api/login" : "/api/signup";
      const otpValue = otpDigits.join("");
      const payload = isLogin
        ? { email: form.email, password: form.password }
        : { name: form.name, email: form.email, password: form.password, otp: otpValue };
      const res = await fetch(`${API_COMPANY}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.token) {
        localStorage.setItem("token", data.token);
        setAuthSuccess(true);
        setTimeout(() => {
          onAuth(data.user);
          navigate("/");
        }, 5000);
      } else {
        setError(data.message || "Authentication failed");
      }
    } catch (err) {
      setError("Server error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSubmitDisabled =
    isSubmitting ||
    !form.email ||
    !form.password ||
    (!isLogin && (!form.name || !otpVerified));

  return (
    <div className="auth-page">
      {!authSuccess && (
        <div className="auth-shell">
          <aside className="auth-visual">
            <div className="auth-visual-inner">
              <img src={tomoxLogo} alt="TomoX" />
              <h3>Order smarter with TomoX</h3>
              <p>Track orders, save favorites, and get curated offers in one place.</p>
            </div>
          </aside>

          <div className="auth-card">
          <div className="auth-header">
            <span className="auth-kicker">TomoX account</span>
            <h2>{isLogin ? "Welcome back" : "Create your account"}</h2>
            <p className="auth-subtitle">
              {isLogin
                ? "Sign in to track orders, save favorites, and get faster checkouts."
                : "Join TomoX to order faster, get personalized offers, and manage deliveries."}
            </p>
          </div>

          <div className="auth-tabs">
            <button
              type="button"
              className={isLogin ? "active" : ""}
              onClick={() => handleToggleMode(true)}
            >
              Sign in
            </button>
            <button
              type="button"
              className={!isLogin ? "active" : ""}
              onClick={() => handleToggleMode(false)}
            >
              Sign up
            </button>
          </div>

          {!isResetMode && !authSuccess && (
            <form className="auth-form" onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="auth-field">
                <label htmlFor="name">Full name</label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  placeholder="Enter your name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            <div className="auth-field">
              <label htmlFor="email">Email address</label>
              <div className="auth-email-wrapper">
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="name@email.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                />
                {!isLogin && isValidEmailDomain(form.email) && (
                  <div className="auth-email-check" aria-label="Email valid">
                    <i className="fas fa-check" style={{ color: '#28a745', fontSize: '18px' }}></i>
                  </div>
                )}
              </div>
            </div>

            {!isLogin && isValidEmailDomain(form.email) && (
              <div className="auth-otp-row">
                <div className="auth-field">
                  <label htmlFor="otp">Email OTP</label>
                  <div className="auth-otp-inputs" onPaste={handleOtpPaste}>
                    {otpDigits.map((digit, index) => (
                      <input
                        key={index}
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={1}
                        value={digit}
                        onChange={(event) => handleOtpChange(index, event)}
                        onKeyDown={(event) => handleOtpKeyDown(index, event)}
                        ref={(el) => (otpInputsRef.current[index] = el)}
                        aria-label={`OTP digit ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
                <div className="auth-otp-actions">
                  <button
                    type="button"
                    className="auth-ghost"
                    onClick={sendOtp}
                    disabled={otpLoading || otpCooldown > 0}
                  >
                    {otpLoading
                      ? "Sending..."
                      : otpCooldown > 0
                        ? `Resend in ${otpCooldown}s`
                        : otpSent
                          ? "Resend OTP"
                          : "Send OTP"}
                  </button>
                </div>
                {otpStatus && (
                  <div className={`auth-otp-status ${otpStatus.type}`}>
                    {otpStatus.message}
                  </div>
                )}
              </div>
            )}

            <div className="auth-field auth-password">
              <label htmlFor="password">Password</label>
              <div className="auth-password-input">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  autoComplete={isLogin ? "current-password" : "new-password"}
                />
                <button
                  type="button"
                  className="auth-ghost"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="auth-row">
              {isLogin ? (
                <label className="auth-checkbox">
                  <input type="checkbox" />
                  Remember me
                </label>
              ) : (
                <span className="auth-muted">
                  By signing up, you agree to our terms.
                </span>
              )}
              {isLogin && (
                <button
                  type="button"
                  className="auth-link"
                  onClick={() => setIsResetMode(true)}
                >
                  Forget password?
                </button>
              )}
            </div>

            <button
              type="submit"
              className="auth-submit"
              disabled={isSubmitDisabled}
            >
              {isSubmitting
                ? isLogin
                  ? "Signing in..."
                  : "Creating account..."
                : isLogin
                  ? "Sign in"
                  : "Create account"}
            </button>
            </form>
          )}

          {isResetMode && !authSuccess && (
            <form className="auth-reset-form" onSubmit={submitPasswordReset}>
              <div className="auth-reset-header">
                <button
                  type="button"
                  className="auth-reset-back"
                  onClick={() => {
                    setIsResetMode(false);
                    setResetEmail("");
                    setResetPassword("");
                    setResetOtpDigits(["", "", "", ""]);
                    setResetOtpSent(false);
                    setResetOtpVerified(false);
                    setResetStatus(null);
                    setResetCooldown(0);
                    setAuthSuccess(false);
                    resetLastVerifiedOtpRef.current = "";
                  }}
                >
                  ← Back
                </button>
                <h3>Reset Password</h3>
              </div>

              <div className="auth-field">
                <label htmlFor="reset-email">Email address</label>
                <input
                  id="reset-email"
                  type="email"
                  placeholder="name@email.com"
                  value={resetEmail}
                  onChange={(e) => {
                    setResetEmail(e.target.value);
                    setResetOtpDigits(["", "", "", ""]);
                    setResetOtpSent(false);
                    setResetOtpVerified(false);
                    setResetStatus(null);
                    setResetCooldown(0);
                    resetLastVerifiedOtpRef.current = "";
                  }}
                  required
                />
              </div>

              {resetOtpSent && (
                <>
                  <div className="auth-field">
                    <label>Enter OTP</label>
                    <div className="auth-otp-inputs">
                      {resetOtpDigits.map((digit, index) => (
                        <input
                          key={index}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(event) => handleResetOtpChange(index, event)}
                          onKeyDown={(event) => handleResetOtpKeyDown(index, event)}
                          ref={(el) => (resetOtpInputsRef.current[index] = el)}
                          aria-label={`OTP digit ${index + 1}`}
                        />
                      ))}
                    </div>
                  </div>

                  {resetOtpVerified && (
                    <div className="auth-field">
                      <label htmlFor="reset-password">New password</label>
                      <div className="auth-password-input">
                        <input
                          id="reset-password"
                          type={resetShowPassword ? "text" : "password"}
                          placeholder="Enter new password"
                          value={resetPassword}
                          onChange={(e) => setResetPassword(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          className="auth-ghost"
                          onClick={() => setResetShowPassword((prev) => !prev)}
                        >
                          {resetShowPassword ? "Hide" : "Show"}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {resetStatus && (
                <div className={`auth-otp-status ${resetStatus.type}`}>
                  {resetStatus.message}
                </div>
              )}

              {!resetOtpSent ? (
                <button
                  type="button"
                  className="auth-submit"
                  onClick={sendResetOtp}
                  disabled={resetLoading}
                >
                  {resetLoading ? "Sending..." : "Send OTP"}
                </button>
              ) : resetOtpVerified ? (
                <button
                  type="submit"
                  className="auth-submit"
                  disabled={resetLoading || !resetPassword}
                >
                  {resetLoading ? "Resetting..." : "Reset Password"}
                </button>
              ) : (
                <div className="auth-reset-waiting">
                  <p>Verifying OTP...</p>
                </div>
              )}
            </form>
          )}

          {!isResetMode && error && <div className="auth-error">{error}</div>}

          <div className="auth-footer">
            {isLogin ? "New to TomoX?" : "Already have an account?"}
            <button
              type="button"
              className="auth-text-button"
              onClick={() => handleToggleMode(!isLogin)}
            >
              {isLogin ? "Create an account" : "Sign in instead"}
            </button>
          </div>
        </div>
      </div>
      )}

      {authSuccess && (
        <div className="auth-success">
          <div className="auth-loader">
            <div className="auth-loader-dot auth-loader-dot-1"></div>
            <div className="auth-loader-dot auth-loader-dot-2"></div>
            <div className="auth-loader-dot auth-loader-dot-3"></div>
          </div>
          <h3>{isResetMode ? "Password reset successfully" : isLogin ? "Signed in successfully" : "Account created successfully"}</h3>
          <div className="auth-loader-text">Redirecting...</div>
        </div>
      )}
    </div>
  );
}

export default Auth;