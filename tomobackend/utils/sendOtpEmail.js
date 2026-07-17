const nodemailer = require("nodemailer");
const { sendMail, EMAIL_FROM } = require("./emailTransport");
const OTP_EMAIL_TIMEOUT_MS = 20000;

const sendOtpEmail = async (to, otp) => {
  const currentTransporter = getTransporter();
  const text = `\nYour TomoX verification code is ${otp}.\n\nThis code will expire in 10 minutes. If you did not request this, please ignore this email.\n\nCustomer app: ${CUSTOMER_APP_URL}\n\nThanks,\nTomoX Team\n`;

  const otpChars = String(otp).padStart(4, "0").slice(-4).split("");
  const otpBoxes = otpChars
    .map(
      (digit) => `\n        <td style="background:#0b0b0b; border:1px solid #2a2a2a; border-radius:12px; width:52px; height:56px; text-align:center; font-size:26px; font-weight:700; color:#ffb020;">\n          ${digit}\n        </td>`
    )
    .join("");

  const html = `\n<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>TomoX Verification Code</title>\n  </head>\n  <body style="margin:0; padding:0; background:#0b0b0b; color:#f8f8f8; font-family: 'Space Grotesk', 'Inter', Arial, sans-serif;">\n    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#0b0b0b; padding:32px 16px;">\n      <tr>\n        <td align="center">\n          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px; background:#111; border-radius:20px; overflow:hidden; box-shadow:0 20px 60px rgba(0,0,0,0.45); border:1px solid #1f1f1f;">\n            <tr>\n              <td style="padding:26px 28px; background:linear-gradient(135deg, rgba(255,176,32,0.18), rgba(252,128,25,0.06)); border-bottom:1px solid rgba(255,176,32,0.2);">\n                <div style="font-size:20px; font-weight:700; letter-spacing:0.5px; color:#ffb020;">TomoX</div>\n                <div style="margin-top:6px; font-size:13px; letter-spacing:0.18em; text-transform:uppercase; color:#f97316;">Verification</div>\n              </td>\n            </tr>\n            <tr>\n              <td style="padding:28px;">\n                <h1 style="margin:0 0 10px; font-size:24px; font-weight:600; color:#f8f8f8;">Your one-time code</h1>\n                <p style="margin:0 0 20px; font-size:15px; line-height:1.6; color:#d1d5db;">\n                  Use the code below to finish signing in to TomoX. This code is valid for 10 minutes.\n                </p>\n                <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto; border-collapse:separate; border-spacing:10px;">\n                  <tr>\n                    ${otpBoxes}\n                  </tr>\n                </table>\n                <p style="margin:20px 0 0; font-size:13px; line-height:1.6; color:#9ca3af;">\n                  If you did not request this code, you can safely ignore this email.\n                </p>\n              </td>\n            </tr>\n            <tr>\n              <td style="padding:18px 28px 26px; border-top:1px solid #1f1f1f; color:#9ca3af; font-size:12px; text-align:center;">\n                <a href="${CUSTOMER_APP_URL}" style="color:#ffb020;text-decoration:none;font-weight:600;">Open TomoX Customer App</a><br/>\n                Need help? Reply to this email and our team will get back to you.\n              </td>\n            </tr>\n          </table>\n        </td>\n      </tr>\n    </table>\n  </body>\n</html>\n`;

  await sendMail({
    from: `"TomoX" <${EMAIL_FROM}>`,
    to,
    subject,
    text,
    html,
  });
};

module.exports = sendOtpEmail;
