import { useEffect, useState, useRef } from "react";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { API_URL } from "../config";

export default function Dashboard() {
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const isFirstLoad = useRef(true);

  const [lastTotal, setLastTotal] = useState(() => {
    const stored = localStorage.getItem("lastTicketTotal");
    return stored ? Number(stored) : null;
  });

  const employee = JSON.parse(localStorage.getItem("employee"));
  const lastLogin = localStorage.getItem("lastLogin");

  const fetchSummary = async () => {
    try {
      const res = await fetch(`${API_URL}/support/summary`);
      const data = await res.json();

      console.log("📊 Summary Fetched:", data);
      console.log("🧠 Last Total:", lastTotal);

      if (!isFirstLoad.current && lastTotal !== null && data.total > lastTotal) {
        console.log("🔥 Triggering new ticket notification...");
        toast.info("🚨 New support ticket submitted!", {
          position: "top-right",
          autoClose: 5000,
          theme: "colored",
        });

        const audio = new Audio("/notify.mp3");
        audio.play();

        localStorage.setItem("newTicket", "true");
        window.dispatchEvent(new Event("storage")); // 🔁 Force Sidebar update
      }

      setSummary(data);
      setLastTotal(data.total);
      localStorage.setItem("lastTicketTotal", data.total);

      isFirstLoad.current = false;
    } catch (err) {
      console.error("Failed to load summary", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
    const interval = setInterval(fetchSummary, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatDate = (iso) =>
    new Date(iso).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "medium",
      timeStyle: "short",
    });

  return (
    <div className="dashboard">
      <ToastContainer />

      <div className="profile-header">
        <div className="profile-badge">{employee?.name?.[0] || "U"}</div>
        <div>
          <h2>Welcome, {employee?.name}</h2>
          <p className="role-badge">{employee?.role || "Support Agent"}</p>
          <p><strong>Last login:</strong> {formatDate(lastLogin)}</p>
        </div>
      </div>

      <div className="employee-info">
        <p><strong>Company:</strong> TomoX</p>
        <p><strong>Email:</strong> {employee?.email}</p>
        <p><strong>Working Hours:</strong> 9:00 AM – 6:00 PM</p>
      </div>

      {loading ? (
        <p>Loading ticket summary...</p>
      ) : (
        <div className="summary-cards">
          <div className="card total">Total Tickets: {summary.total}</div>
          <div className="card raised">Raised: {summary.raised}</div>
          <div className="card pending">Pending: {summary.pending}</div>
          <div className="card resolved">Resolved: {summary.resolved}</div>
        </div>
      )}
    </div>
  );
}
