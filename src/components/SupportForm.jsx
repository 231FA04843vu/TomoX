import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_COMPANY = import.meta.env.VITE_API_COMPANY || "http://localhost:5000";

export default function SupportForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    orderId: "",
    message: ""
  });

  const [status, setStatus] = useState(null);
  const [viewStatus, setViewStatus] = useState(false);
  const [ticketStage, setTicketStage] = useState("raised");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const supportData = {
      name: formData.name,
      email: formData.email,
      orderId: formData.orderId || "No order ID",
      message: formData.message
    };

    try {
      const res = await fetch(`${API_COMPANY}/api/support`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(supportData)
      });

      const result = await res.json();

      if (res.ok) {
        setStatus("success");
        setFormData({ name: "", email: "", orderId: "", message: "" });

        // Optional: show alert or success popup
      }
    } catch (err) {
      console.error("Submit failed", err);
      setStatus("error");
    }
  };

  const handleCheckStatus = () => {
    setViewStatus(true);
    setTicketStage("pending"); // Simulated stage
  };

  const handleClose = () => {
    setViewStatus(false);
    navigate("/");
  };

  return (
    <div className="support-form-container bg-white p-6 rounded-xl shadow-md max-w-xl mx-auto mt-12">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Raise a Support Issue</h2>

      {!viewStatus ? (
        <>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              name="name"
              type="text"
              placeholder="Your Name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg p-3 text-sm"
            />
            <input
              name="email"
              type="email"
              placeholder="Your Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg p-3 text-sm"
            />
            <input
              name="orderId"
              type="text"
              placeholder="Order ID (optional)"
              value={formData.orderId}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-3 text-sm"
            />
            <textarea
              name="message"
              placeholder="Describe your issue"
              value={formData.message}
              onChange={handleChange}
              required
              rows={4}
              className="w-full border border-gray-300 rounded-lg p-3 text-sm"
            />
            <button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium transition"
            >
              Submit
            </button>
          </form>

          {status === "success" && (
            <p className="text-green-600 font-medium mt-4">
              Support message submitted successfully.
            </p>
          )}
          {status === "error" && (
            <p className="text-red-600 font-medium mt-4">
              Something went wrong. Please try again.
            </p>
          )}

          <div className="mt-6 text-center">
            <button
              onClick={handleCheckStatus}
              className="text-orange-600 underline font-medium hover:text-orange-700"
            >
              Check Ticket Status
            </button>
          </div>
        </>
      ) : (
        <>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Ticket Status</h3>
          <div className="tracking-line flex items-center justify-between gap-4 mb-6">
            <div className={`step flex-1 text-center py-2 px-4 rounded-lg ${["raised", "pending", "resolved"].includes(ticketStage) ? "bg-orange-400 text-white" : "bg-gray-200"}`}>
              Issue Raised
            </div>
            <div className={`step flex-1 text-center py-2 px-4 rounded-lg ${["pending", "resolved"].includes(ticketStage) ? "bg-orange-400 text-white" : "bg-gray-200"}`}>
              Issue Pending
            </div>
            <div className={`step flex-1 text-center py-2 px-4 rounded-lg ${ticketStage === "resolved" ? "bg-orange-400 text-white" : "bg-gray-200"}`}>
              Issue Resolved
            </div>
          </div>
          <button
            onClick={handleClose}
            className="mt-4 bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition"
          >
            Close
          </button>
        </>
      )}
    </div>
  );
}
