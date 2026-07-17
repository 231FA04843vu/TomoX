const { sendMail, EMAIL_FROM } = require("./emailTransport");
const CUSTOMER_APP_URL = "https://tomox.netlify.app";

const sendAccountDeletionEmail = async (to, name) => {
  const subject = "Your TomoX account has been deleted";
  const displayName = name || "Customer";
  const html = `
  <div style="font-family: 'Segoe UI', Arial, sans-serif; background:#fff7ed; padding:24px;">
    <div style="max-width:620px; margin:0 auto; background:#ffffff; border-radius:16px; border:1px solid #fde68a; overflow:hidden;">
      <div style="background: linear-gradient(135deg, #fc8019, #fb641b); padding:18px 24px; color:#ffffff;">
        <h1 style="margin:0; font-size:22px;">TomoX</h1>
        <p style="margin:6px 0 0; font-size:14px; opacity:0.9;">Account update</p>
      </div>
      <div style="padding:24px; color:#1f2937;">
        <h2 style="margin:0 0 10px; font-size:20px;">Hi ${displayName},</h2>
        <p style="margin:0 0 12px; line-height:1.6;">Your TomoX account has been deleted as requested. We are sorry to see you go.</p>
        <p style="margin:0 0 12px; line-height:1.6;">If this was not you, please contact our support team immediately.</p>
        <div style="background:#fff7ed; border:1px solid #fed7aa; padding:14px; border-radius:12px; margin-top:16px;">
          <p style="margin:0; font-size:14px; color:#9a3412;">Need help? Visit <a href="${CUSTOMER_APP_URL}" style="color:#9a3412;font-weight:700;">TomoX Customer App</a>.</p>
        </div>
        <p style="margin:18px 0 0; font-size:13px; color:#6b7280;">Thanks for being with TomoX.</p>
      </div>
    </div>
  </div>
  `;

  await sendMail({
    from: `"TomoX" <${EMAIL_FROM}>`,
    to,
    subject,
    html,
  });
};

module.exports = sendAccountDeletionEmail;
