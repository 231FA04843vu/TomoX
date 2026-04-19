import { useEffect, useState } from "react";
import { API_URL } from "../config";

export default function TicketViewer() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTickets = async () => {
    try {
      const res = await fetch(`${API_URL}/support`);
      const data = await res.json();
      setTickets(data);
    } catch (err) {
      setError("Failed to fetch tickets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleStatusChange = async (ticketId, newStatus, email) => {
    try {
      const res = await fetch(`${API_URL}/support/${ticketId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus, email }),
      });

      if (res.ok) {
        fetchTickets(); // Refresh list
      } else {
        console.error("Failed to update ticket");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="ticket-viewer">
      <h2>Support Tickets</h2>

      {loading && <p>Loading...</p>}
      {error && <p className="error-text">{error}</p>}

      {!loading && tickets.length === 0 && <p>No tickets found.</p>}

      {!loading && tickets.length > 0 && (
        <table className="ticket-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Order ID</th>
              <th>Message</th>
              <th>Status</th>
              <th>Change Status</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr key={ticket._id}>
                <td>{ticket.name}</td>
                <td>{ticket.email}</td>
                <td>{ticket.orderId}</td>
                <td>{ticket.message}</td>
                <td>{ticket.status}</td>
                <td>
                  {ticket.status !== "resolved" && (
                    <button
                      onClick={() =>
                        handleStatusChange(
                          ticket._id,
                          ticket.status === "raised" ? "pending" : "resolved",
                          ticket.email
                        )
                      }
                    >
                      Mark as {ticket.status === "raised" ? "Pending" : "Resolved"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
