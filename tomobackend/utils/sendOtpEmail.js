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

const sendOtpEmail = async (to, otp) => {
  if (!transporter) {
    throw new Error("Email transporter not configured");
  }

  const subject = "Your TomoX verification code";
  const text = `
Your TomoX verification code is ${otp}.

This code will expire in 10 minutes. If you did not request this, please ignore this email.

Customer app: ${CUSTOMER_APP_URL}

Thanks,
TomoX Team
`;

  const otpChars = String(otp).padStart(4, "0").slice(-4).split("");
  const otpBoxes = otpChars
    .map(
      (digit) => `
        <td style="background:#0b0b0b; border:1px solid #2a2a2a; border-radius:12px; width:52px; height:56px; text-align:center; font-size:26px; font-weight:700; color:#ffb020;">
          ${digit}
        </td>`
    )
    .join("");

  const html = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>TomoX Verification Code</title>
  </head>
  <body style="margin:0; padding:0; background:#0b0b0b; color:#f8f8f8; font-family: 'Space Grotesk', 'Inter', Arial, sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#0b0b0b; padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px; background:#111; border-radius:20px; overflow:hidden; box-shadow:0 20px 60px rgba(0,0,0,0.45); border:1px solid #1f1f1f;">
            <tr>
              <td style="padding:26px 28px; background:linear-gradient(135deg, rgba(255,176,32,0.18), rgba(252,128,25,0.06)); border-bottom:1px solid rgba(255,176,32,0.2);">
                <div style="font-size:20px; font-weight:700; letter-spacing:0.5px; color:#ffb020;">TomoX</div>
                <div style="margin-top:6px; font-size:13px; letter-spacing:0.18em; text-transform:uppercase; color:#f97316;">Verification</div>
              </td>
            </tr>
            <tr>
              <td style="padding:28px;">
                <h1 style="margin:0 0 10px; font-size:24px; font-weight:600; color:#f8f8f8;">Your one-time code</h1>
                <p style="margin:0 0 20px; font-size:15px; line-height:1.6; color:#d1d5db;">
                  Use the code below to finish signing in to TomoX. This code is valid for 10 minutes.
                </p>
                <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto; border-collapse:separate; border-spacing:10px;">
                  <tr>
                    ${otpBoxes}
                  </tr>
                </table>
                <p style="margin:20px 0 0; font-size:13px; line-height:1.6; color:#9ca3af;">
                  If you did not request this code, you can safely ignore this email.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 28px 26px; border-top:1px solid #1f1f1f; color:#9ca3af; font-size:12px; text-align:center;">
                <a href="${CUSTOMER_APP_URL}" style="color:#ffb020;text-decoration:none;font-weight:600;">Open TomoX Customer App</a><br/>
                Need help? Reply to this email and our team will get back to you.
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

module.exports = sendOtpEmail;
