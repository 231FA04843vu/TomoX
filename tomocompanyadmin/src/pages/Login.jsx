import { useState } from "react";
import { login } from "../utils/auth";
import { API_URL } from "../config";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (res.ok) {
      login(data.token, data.employee);
      window.location.href = "/dashboard";
    } else {
      alert(data.message || "Login failed");
    }
  };

  return (
    <div className="login-container">
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#111827", margin: "0 0 8px", letterSpacing: "-0.5px" }}>
          TomoX Admin Portal
        </h1>
        <p style={{ fontSize: "14px", color: "#6b7280", margin: 0, fontWeight: 500 }}>
          Secure Administration Access
        </p>
      </div>
      <form onSubmit={handleLogin} className="login-form">
        <input
          className="login-input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          className="login-input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit" className="login-button">
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
