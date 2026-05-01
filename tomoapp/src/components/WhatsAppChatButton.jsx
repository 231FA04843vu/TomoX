import React, { memo } from "react";

const DEFAULT_MESSAGE = "Hi TomoX team, I need help with my order.";
const DEFAULT_PHONE = "15557755331";

function normalizePhone(value) {
  return String(value || "")
    .replace(/[^\d]/g, "")
    .trim();
}

const WhatsAppChatButton = memo(function WhatsAppChatButton() {
  const isEnabled = (import.meta.env.VITE_WHATSAPP_ENABLED || "true") !== "false";
  const phone = normalizePhone(import.meta.env.VITE_WHATSAPP_PHONE || DEFAULT_PHONE);
  const message = import.meta.env.VITE_WHATSAPP_MESSAGE || DEFAULT_MESSAGE;

  if (!isEnabled || !phone) return null;

  const chatUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  return (
    <a
      className="whatsapp-chat-fab"
      href={chatUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      title="Chat on WhatsApp"
    >
      <span className="whatsapp-chat-fab__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="24" height="24" role="img" focusable="false">
          <path
            fill="currentColor"
            d="M20.52 3.48A11.86 11.86 0 0 0 12.05 0C5.55 0 .27 5.29.27 11.79c0 2.08.54 4.12 1.56 5.92L0 24l6.48-1.7a11.8 11.8 0 0 0 5.57 1.41h.01c6.49 0 11.78-5.29 11.79-11.79 0-3.15-1.22-6.12-3.33-8.44Zm-8.46 18.26h-.01a9.76 9.76 0 0 1-4.98-1.37l-.36-.21-3.84 1.01 1.03-3.74-.24-.38a9.83 9.83 0 0 1-1.5-5.22c0-5.43 4.43-9.86 9.88-9.86 2.64 0 5.12 1.03 6.98 2.9a9.8 9.8 0 0 1 2.88 6.97c0 5.44-4.43 9.87-9.86 9.88Zm5.41-7.4c-.3-.15-1.78-.88-2.06-.98-.27-.1-.47-.15-.67.15-.2.3-.76.98-.94 1.19-.17.2-.35.23-.64.08-.3-.15-1.25-.46-2.38-1.47a8.95 8.95 0 0 1-1.65-2.03c-.17-.3-.02-.45.13-.6.13-.13.29-.35.44-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.6-.92-2.2-.24-.58-.48-.5-.67-.5h-.57c-.2 0-.52.08-.8.37-.27.3-1.04 1.02-1.04 2.5s1.07 2.9 1.22 3.1c.15.2 2.1 3.2 5.1 4.49.71.3 1.27.48 1.7.61.72.23 1.37.2 1.88.12.58-.09 1.78-.73 2.03-1.45.25-.71.25-1.32.17-1.45-.08-.13-.28-.2-.58-.35Z"
          />
        </svg>
      </span>
      <span className="whatsapp-chat-fab__label">Chat on WhatsApp</span>
    </a>
  );
});

export default WhatsAppChatButton;
