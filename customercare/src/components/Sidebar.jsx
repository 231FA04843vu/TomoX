import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Sidebar() {
  const navigate = useNavigate();
  const [hasNewTicket, setHasNewTicket] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  useEffect(() => {
    const checkNewTicket = () => {
      const flag = localStorage.getItem("newTicket");
      setHasNewTicket(flag === "true");
    };

    checkNewTicket();

    const handleStorage = () => {
      checkNewTicket();
    };

    // Listen for storage event across tabs/windows or dispatches
    window.addEventListener("storage", handleStorage);

    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return (
    <div className="sidebar">
      <h3 className="logo">Tomox SPS</h3>
      <nav>
        <NavLink to="/dashboard" className="nav-link">Dashboard</NavLink>

        <NavLink
          to="/tickets"
          className="nav-link"
          onClick={() => {
            setTimeout(() => {
              localStorage.setItem("newTicket", "false");
              setHasNewTicket(false);
            }, 300); // safely delay reset
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            Ticket Viewer
            {hasNewTicket && (
              <span className="red-dot" style={{
                display: "inline-block",
                width: "8px",
                height: "8px",
                backgroundColor: "red",
                borderRadius: "50%"
              }} />
            )}
          </div>
        </NavLink>

        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </nav>
    </div>
  );
}
