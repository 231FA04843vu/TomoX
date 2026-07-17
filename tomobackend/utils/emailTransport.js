const https = require("https");
const nodemailer = require("nodemailer");
const path = require("path");

require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });

const RESEND_API_KEY = (process.env.RESEND_API_KEY || "").trim();
const EMAIL_USER = (process.env.EMAIL_USER || "").trim();
const EMAIL_PASS = (process.env.EMAIL_PASS || "").replace(/\s+/g, "");
const EMAIL_FROM = (process.env.EMAIL_FROM || EMAIL_USER).trim();
const SMTP_HOST = (process.env.SMTP_HOST || "smtp.gmail.com").trim();
const SMTP_PORT = Number(process.env.SMTP_PORT || 465);
const SMTP_SECURE = String(process.env.SMTP_SECURE || SMTP_PORT === 465).toLowerCase() === "true";

let smtpTransporter = null;

const getSmtpTransporter = () => {
  if (smtpTransporter) {
    return smtpTransporter;
  }

  if (!EMAIL_USER || !EMAIL_PASS) {
    return null;
  }

  smtpTransporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });

  return smtpTransporter;
};

const sendWithResend = ({ from, to, subject, text, html }) => {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({ from, to, subject, text, html });

    const request = https.request(
      {
        method: "POST",
        hostname: "api.resend.com",
        path: "/emails",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload),
        },
      },
      (response) => {
        let responseBody = "";

        response.on("data", (chunk) => {
          responseBody += chunk;
        });

        response.on("end", () => {
          if (response.statusCode && response.statusCode >= 200 && response.statusCode < 300) {
            let parsed = {};

            try {
              parsed = responseBody ? JSON.parse(responseBody) : {};
            } catch {
              parsed = {};
            }

            resolve({
              ok: true,
              provider: "resend",
              messageId: parsed.id || null,
              response: parsed,
            });
            return;
          }

          const error = new Error(
            `Resend API request failed${response.statusCode ? ` with status ${response.statusCode}` : ""}`
          );
          error.statusCode = response.statusCode;
          error.response = responseBody;
          reject(error);
        });
      }
    );

    request.on("error", reject);
    request.write(payload);
    request.end();
  });
};

const sendMail = async ({ from = EMAIL_FROM, to, subject, text, html, replyTo }) => {
  if (!to) {
    return { ok: false, error: "Recipient email is missing" };
  }

  if (!subject) {
    return { ok: false, error: "Subject is missing" };
  }

  if (RESEND_API_KEY) {
    return sendWithResend({ from, to, subject, text, html });
  }

  const transporter = getSmtpTransporter();
  if (!transporter) {
    throw new Error("Email transport is not configured. Set RESEND_API_KEY or EMAIL_USER/EMAIL_PASS.");
  }

  const info = await transporter.sendMail({
    from,
    to,
    subject,
    text,
    html,
    replyTo,
  });

  return {
    ok: true,
    provider: "smtp",
    messageId: info.messageId || null,
    response: info.response || null,
  };
};

module.exports = {
  sendMail,
  EMAIL_FROM,
  RESEND_API_KEY,
};