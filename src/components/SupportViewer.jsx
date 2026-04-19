// src/components/SupportViewer.jsx

import { useEffect, useState } from "react";

const API_COMPANY = import.meta.env.VITE_API_COMPANY || "http://localhost:5000";

export default function SupportViewer() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    fetch(`${API_COMPANY}/api/support`)
      .then((res) => res.json())
      .then((data) => setMessages(data))
      .catch((err) => console.error("Failed to fetch support messages", err));
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 mt-12 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4 text-orange-600">Support Messages</h2>

      {messages.length === 0 ? (
        <p className="text-gray-600">No messages yet.</p>
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg._id}
              className="border border-gray-300 rounded-lg p-4 bg-gray-50"
            >
              <p>
                <strong>Name:</strong> {msg.name}
              </p>
              <p>
                <strong>Email:</strong> {msg.email}
              </p>
              <p>
                <strong>Issue:</strong> {msg.issue}
              </p>
              <p>
                <strong>Message:</strong> {msg.message}
              </p>
              <p className="text-sm text-gray-500">
                {new Date(msg.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
