import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config";

export default function LoginForm() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Save token and employee info
      localStorage.setItem("token", data.token);
      localStorage.setItem("employee", JSON.stringify(data.employee));
      localStorage.setItem("lastLogin", new Date().toISOString()); 

      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
        required
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        value={form.password}
        onChange={handleChange}
        required
      />
      {error && <p className="error-text">{error}</p>}
      <button type="submit">Login</button>
    </form>
  );
}
