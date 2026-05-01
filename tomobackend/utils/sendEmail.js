const nodemailer = require("nodemailer");
require("dotenv").config();

// Use environment variables for credentials to avoid checking secrets into source control.
const EMAIL_USER = (process.env.EMAIL_USER || "").trim();
const EMAIL_PASS = (process.env.EMAIL_PASS || "").trim();
const EMAIL_FROM = (process.env.EMAIL_FROM || EMAIL_USER).trim();
const SMTP_HOST = (process.env.SMTP_HOST || "smtp.gmail.com").trim();
const SMTP_PORT = Number(process.env.SMTP_PORT || 465);
const SMTP_SECURE = String(process.env.SMTP_SECURE || SMTP_PORT === 465).toLowerCase() === "true";
const CUSTOMER_APP_URL = "https://tomox.netlify.app";

let transporter = null;
if (EMAIL_USER && EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    connectionTimeout: 20000,
    greetingTimeout: 20000,
    socketTimeout: 30000,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS
    }
  });

  // verify connection configuration
  transporter.verify().then(() => {
    console.log("Mail transporter is configured and ready");
  }).catch((err) => {
    console.error("Mail transporter verification failed:", err && err.message ? err.message : err);
  });
} else {
  console.warn("Email credentials not provided. Set EMAIL_USER and EMAIL_PASS in environment.");
}

/**
 * Sends a formatted support email to the customer
 * @param {string} to - recipient email
 * @param {Object} ticket - support ticket object { _id, name, orderId, status }
 */
const sendEmail = async (to, ticket) => {
  if (!to) {
    return { ok: false, error: "Recipient email is missing" };
  }

  if (!ticket || !ticket._id || !ticket.name || !ticket.status) {
    console.error("Invalid ticket object provided to sendEmail");
    return { ok: false, error: "Invalid ticket object" };
  }

  const ticketIdShort = ticket._id.toString().slice(-6);
  const statusLabel = String(ticket.status).toUpperCase();
  const subject = `TomoX Support Ticket Update [#${ticketIdShort}]`;

  const text = `
Dear ${ticket.name},

We are updating you regarding your support request.

📨 Ticket ID: ${ticket._id}
👤 Name: ${ticket.name}
🛒 Order ID: ${ticket.orderId || "Not provided"}
📌 Current Status: ${statusLabel}

We appreciate your patience. Our support team is here to assist you every step of the way.

Track your orders and support updates: ${CUSTOMER_APP_URL}

Thank you,  
TomoX Support Team
`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Support Ticket Update</title>
</head>
<body style="margin:0;padding:0;background:#0b0b0b;font-family:Arial,sans-serif;color:#f8fafc;">
  <table width="100%" cellspacing="0" cellpadding="0" style="background:#0b0b0b;">
    <tr>
      <td align="center" style="padding:20px;">
        <table width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#111;border:1px solid #1f2937;border-radius:16px;overflow:hidden;">
          <tr>
            <td style="padding:20px;background:linear-gradient(135deg, rgba(249,115,22,0.12), rgba(234,88,12,0.04));border-bottom:1px solid rgba(249,115,22,0.2);">
              <div style="font-size:22px;font-weight:700;color:#ffb020;">TomoX</div>
              <div style="margin-top:4px;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:#f97316;">Support Ticket Update</div>
            </td>
          </tr>
          <tr>
            <td style="padding:22px;">
              <h1 style="margin:0 0 10px;font-size:24px;color:#f8fafc;">Hi ${ticket.name},</h1>
              <p style="margin:0 0 14px;color:#d1d5db;font-size:15px;line-height:1.6;">We are updating you regarding your support request.</p>

              <table width="100%" cellspacing="0" cellpadding="0" style="background:#0b1220;border:1px solid #1e293b;border-radius:10px;padding:12px;">
                <tr><td style="padding:7px 6px;font-size:13px;color:#94a3b8;">Ticket ID</td><td style="padding:7px 6px;text-align:right;font-size:14px;color:#f8fafc;font-weight:700;">#${ticketIdShort}</td></tr>
                <tr><td style="padding:7px 6px;font-size:13px;color:#94a3b8;">Order ID</td><td style="padding:7px 6px;text-align:right;font-size:14px;color:#f8fafc;">${ticket.orderId || "Not provided"}</td></tr>
                <tr><td style="padding:7px 6px;font-size:13px;color:#94a3b8;">Current status</td><td style="padding:7px 6px;text-align:right;font-size:14px;color:#16a34a;font-weight:700;">${statusLabel}</td></tr>
              </table>

              <p style="margin:14px 0 0;color:#9ca3af;font-size:13px;line-height:1.6;">Our support team is here to assist you every step of the way.</p>
              <p style="margin:16px 0 0;">
                <a href="${CUSTOMER_APP_URL}" style="display:inline-block;background:#f97316;color:#fff;text-decoration:none;padding:10px 16px;border-radius:8px;font-weight:700;font-size:13px;">Open TomoX Customer App</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:14px 20px;border-top:1px solid #1f2937;color:#9ca3af;font-size:12px;text-align:center;">Need help? Visit ${CUSTOMER_APP_URL}</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  if (!transporter) {
    const message = "Cannot send email: transporter is not configured (missing EMAIL_USER/EMAIL_PASS)";
    console.error(message);
    return { ok: false, error: message };
  }

  const mailOptions = {
    from: `"TomoX Support" <${EMAIL_FROM}>`,
    to,
    subject,
    text,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}. Message ID: ${info.messageId}`);
    return { ok: true, messageId: info.messageId };
  } catch (error) {
    console.error("Email sending failed:", error && error.message ? error.message : error);
    // Add richer diagnostic fields when available
    if (error && typeof error === 'object') {
      if (error.code) console.error('Error code:', error.code);
      if (error.responseCode) console.error('Response code:', error.responseCode);
      if (error.response) console.error('Response:', error.response);
    }

    if (error && error.code === 'EAUTH') {
      console.error('\nPossible causes for EAUTH (Invalid login):');
      console.error('- EMAIL_USER or EMAIL_PASS is incorrect in environment variables');
      console.error('- If using Gmail, generate an App Password (account must have 2FA) and use that in EMAIL_PASS');
      console.error('- Check for accidental spaces or quotes around values in Render Environment settings');
      console.error('- Check Google account security activity (sign-in blocked)');
    }

    return {
      ok: false,
      error: error && error.message ? error.message : "Unknown email error",
      code: error && error.code ? error.code : undefined,
      responseCode: error && error.responseCode ? error.responseCode : undefined
    };
  }
};

module.exports = sendEmail;
module.exports._transporter = transporter; // exported for quick checks in tests or scripts
