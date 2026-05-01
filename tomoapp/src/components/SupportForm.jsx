import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_COMPANY = import.meta.env.VITE_API_COMPANY || "http://localhost:5000";
const USER_STORAGE_KEY = "tomo.user.v1";

const statusSteps = ["raised", "pending", "resolved"];

const getStatusLabel = (status) => {
  if (status === "resolved") return "Resolved";
  if (status === "pending") return "Pending";
  return "Raised";
};

const getStatusNote = (status) => {
  if (status === "resolved") {
    return "Your issue has been resolved. If needed, open a new ticket.";
  }
  if (status === "pending") {
    return "Our support team is actively working on your request.";
  }
  return "Ticket raised successfully. We will review it shortly.";
};

export default function SupportForm() {
  const cachedUser = useMemo(() => {
    try {
      const raw = localStorage.getItem(USER_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const [formData, setFormData] = useState({
    name: cachedUser?.name || "",
    email: cachedUser?.email || "",
    phone: cachedUser?.phone || "",
    orderId: "",
    message: "",
  });
  const [status, setStatus] = useState(null);
  const [viewStatus, setViewStatus] = useState(false);
  const [ticketId, setTicketId] = useState("");
  const [currentTicket, setCurrentTicket] = useState(null);
  const [isChecking, setIsChecking] = useState(false);

  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus(null);

    const supportData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      orderId: formData.orderId || "No order ID",
      message: formData.message,
    };

    try {
      const res = await fetch(`${API_COMPANY}/api/support`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(supportData),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || "Failed to submit support message");
      }

      setStatus("success");
      setCurrentTicket(result.ticket || null);
      setTicketId(result.ticket?._id || "");
      setFormData((prev) => ({
        ...prev,
        orderId: "",
        message: "",
      }));
    } catch (error) {
      console.error("Submit failed", error);
      setStatus("error");
    }
  };

  const handleCheckStatus = async () => {
    if (!formData.email && !ticketId) {
      setStatus("error");
      return;
    }

    setIsChecking(true);
    setStatus(null);

    try {
      const params = new URLSearchParams();
      if (formData.email) params.set("email", formData.email);
      if (ticketId) params.set("ticketId", ticketId);

      const response = await fetch(
        `${API_COMPANY}/api/support/status?${params.toString()}`
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Could not fetch ticket status");
      }

      setCurrentTicket(data.ticket || null);
      setViewStatus(true);
    } catch (error) {
      setStatus("error");
      setCurrentTicket(null);
    } finally {
      setIsChecking(false);
    }
  };

  const activeStatus = (currentTicket?.status || "raised").toLowerCase();
  const activeStep = statusSteps.indexOf(activeStatus);
  const safeActiveStep = activeStep === -1 ? 0 : activeStep;

  return (
    <div className="support-page-wrap">
      <div className="support-form-container support-form-modern">
        <div className="support-header">
          <h2>Customer Support</h2>
          <p>Raise a ticket and track live status updates in one place.</p>
        </div>

        {!viewStatus ? (
          <>
            <form onSubmit={handleSubmit} className="support-form-grid">
              <label>
                Full Name
                <input
                  name="name"
                  type="text"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Email
                <input
                  name="email"
                  type="email"
                  placeholder="you@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Phone (optional)
                <input
                  name="phone"
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </label>

              <label>
                Order ID (optional)
                <input
                  name="orderId"
                  type="text"
                  placeholder="Order reference"
                  value={formData.orderId}
                  onChange={handleChange}
                />
              </label>

              <label className="support-full-width">
                Describe the issue
                <textarea
                  name="message"
                  placeholder="Tell us what happened and what help you need"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                />
              </label>

              <div className="support-actions support-full-width">
                <button type="submit" className="support-btn-primary">
                  Submit Ticket
                </button>
                <button
                  type="button"
                  className="support-btn-secondary"
                  onClick={handleCheckStatus}
                  disabled={isChecking}
                >
                  {isChecking ? "Checking..." : "Check Ticket Status"}
                </button>
              </div>
            </form>

            {ticketId && (
              <div className="support-ticket-id">
                Ticket ID: <strong>#{String(ticketId).slice(-6).toUpperCase()}</strong>
              </div>
            )}

            {status === "success" && (
              <p className="support-status-success">
                Ticket submitted successfully.
              </p>
            )}
            {status === "error" && (
              <p className="support-status-error">
                Unable to process request. Please verify details and try again.
              </p>
            )}
          </>
        ) : (
          <>
            <div className="support-status-header">
              <h3>Ticket Status</h3>
              <span className={`support-status-pill ${activeStatus}`}>
                {getStatusLabel(activeStatus)}
              </span>
            </div>

            <div className="support-status-card">
              <p>{getStatusNote(activeStatus)}</p>
              <div className="support-status-meta">
                <span>
                  Ticket: #
                  {String(currentTicket?._id || ticketId || "")
                    .slice(-6)
                    .toUpperCase()}
                </span>
                <span>
                  Updated: {new Date(currentTicket?.updatedAt || Date.now()).toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <div className="support-status-timeline">
              {statusSteps.map((step, index) => {
                const completed = index < safeActiveStep;
                const active = index === safeActiveStep;
                return (
                  <div key={step} className="support-stage-item">
                    <div
                      className={`support-stage-dot ${completed ? "completed" : ""} ${
                        active ? "active" : ""
                      }`}
                    />
                    <div className="support-stage-label">{getStatusLabel(step)}</div>
                    {index < statusSteps.length - 1 && (
                      <div
                        className={`support-stage-line ${completed ? "completed" : ""}`}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="support-actions">
              <button
                type="button"
                className="support-btn-secondary"
                onClick={handleCheckStatus}
                disabled={isChecking}
              >
                {isChecking ? "Refreshing..." : "Refresh Status"}
              </button>
              <button
                type="button"
                className="support-btn-secondary"
                onClick={() => setViewStatus(false)}
              >
                Back to Form
              </button>
              <button
                type="button"
                className="support-btn-primary"
                onClick={() => navigate("/")}
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
