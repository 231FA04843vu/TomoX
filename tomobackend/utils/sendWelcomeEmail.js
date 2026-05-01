const nodemailer = require("nodemailer");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const CUSTOMER_APP_URL = "https://tomox.netlify.app";

let transporter = null;
if (EMAIL_USER && EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });
}

const sendWelcomeEmail = async (to, name) => {
  if (!transporter) {
    throw new Error("Email transporter not configured");
  }

  const displayName = name || "there";
  const subject = "Welcome to TomoX";
  const text = `
Hi ${displayName},

Welcome to TomoX! Your account is ready.

Get started:
- Explore top-rated restaurants
- Save your favorites
- Track deliveries in real time

Start here: ${CUSTOMER_APP_URL}

Thanks for joining us,
TomoX Team
`;

  const html = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Welcome to TomoX</title>
  </head>
  <body style="margin:0; padding:0; background:#0b0b0b; color:#f8f8f8; font-family: 'Space Grotesk', 'Inter', Arial, sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#0b0b0b; padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px; background:#111; border-radius:20px; overflow:hidden; box-shadow:0 20px 60px rgba(0,0,0,0.45); border:1px solid #1f1f1f;">
            <tr>
              <td style="padding:26px 28px; background:linear-gradient(135deg, rgba(255,176,32,0.2), rgba(252,128,25,0.06)); border-bottom:1px solid rgba(255,176,32,0.2);">
                <div style="font-size:20px; font-weight:700; letter-spacing:0.5px; color:#ffb020;">TomoX</div>
                <div style="margin-top:6px; font-size:13px; letter-spacing:0.18em; text-transform:uppercase; color:#f97316;">Welcome</div>
              </td>
            </tr>
            <tr>
              <td style="padding:28px;">
                <h1 style="margin:0 0 10px; font-size:24px; font-weight:600; color:#f8f8f8;">Hi ${displayName},</h1>
                <p style="margin:0 0 18px; font-size:15px; line-height:1.6; color:#d1d5db;">
                  Welcome to TomoX! Your account is ready. You can now explore restaurants, save favorites, and get real-time delivery updates.
                </p>
                <div style="background:#0b0b0b; border:1px solid #2a2a2a; border-radius:14px; padding:16px 18px;">
                  <p style="margin:0 0 6px; font-size:14px; color:#ffb020; font-weight:600;">Get started</p>
                  <ul style="margin:0; padding-left:18px; color:#d1d5db; font-size:14px; line-height:1.7;">
                    <li>Explore top-rated restaurants</li>
                    <li>Save your favorite meals</li>
                    <li>Track deliveries in real time</li>
                  </ul>
                </div>
                <p style="margin:18px 0 0; font-size:13px; line-height:1.6; color:#9ca3af;">
                  If you did not create this account, please contact our support team.
                </p>
                <p style="margin:14px 0 0;">
                  <a href="${CUSTOMER_APP_URL}" style="display:inline-block;background:#f97316;color:#ffffff;text-decoration:none;padding:10px 16px;border-radius:8px;font-size:13px;font-weight:700;">Open TomoX Customer App</a>
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 28px 26px; border-top:1px solid #1f1f1f; color:#9ca3af; font-size:12px; text-align:center;">
                Thanks for choosing TomoX.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

  await transporter.sendMail({
    from: `"TomoX" <${EMAIL_USER}>`,
    to,
    subject,
    text,
    html,
  });
};

module.exports = sendWelcomeEmail;
