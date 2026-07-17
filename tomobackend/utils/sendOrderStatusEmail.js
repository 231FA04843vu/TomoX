const { sendMail, EMAIL_FROM } = require("./emailTransport");
const CUSTOMER_APP_URL = "https://tomox.netlify.app";

const statusMeta = {
  accepted: {
    title: "Order Accepted",
    summary: "Your restaurant has accepted your order and started preparing it.",
    chip: "ACCEPTED",
    color: "#0284c7",
  },
  out_for_delivery: {
    title: "Out for Delivery",
    summary: "Your order is packed and is currently out for delivery.",
    chip: "OUT FOR DELIVERY",
    color: "#ea580c",
  },
  delivered: {
    title: "Order Delivered",
    summary: "Your order has been delivered successfully.",
    chip: "DELIVERED",
    color: "#16a34a",
  },
};

const formatDate = (date) => {
  return new Date(date).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const sendOrderStatusEmail = async ({
  email,
  name,
  orderId,
  status,
  restaurantName,
  updatedAt,
}) => {
  if (!email) return;

  const normalized = (status || "").toLowerCase();
  const meta = statusMeta[normalized];
  if (!meta) return;

  const orderNumber = orderId.toString().slice(-8).toUpperCase();
  const subject = `${meta.title} #${orderNumber} - TomoX`;

  const text = `
${meta.title} - TomoX

Hi ${name || "Customer"},

${meta.summary}

Order ID: #${orderNumber}
Restaurant: ${restaurantName || "Partner Restaurant"}
Updated at: ${formatDate(updatedAt || new Date())}

Track order in your TomoX account: ${CUSTOMER_APP_URL}
`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${meta.title}</title>
  <style>
    @media only screen and (max-width: 640px) {
      .wrapper { padding: 16px !important; }
      .card { border-radius: 14px !important; }
      .content { padding: 18px !important; }
      .title { font-size: 22px !important; }
      .status-chip { display: inline-block !important; margin-top: 10px !important; }
      .meta-cell { display: block !important; width: 100% !important; padding-bottom: 10px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:#0b0b0b;font-family:Arial,sans-serif;color:#f8fafc;">
  <table width="100%" cellspacing="0" cellpadding="0" style="background:#0b0b0b;">
    <tr>
      <td class="wrapper" style="padding:24px;" align="center">
        <table class="card" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;background:#111;border:1px solid #1f2937;border-radius:18px;overflow:hidden;">
          <tr>
            <td class="content" style="padding:24px;background:linear-gradient(135deg, rgba(249,115,22,0.12), rgba(234,88,12,0.04));border-bottom:1px solid rgba(249,115,22,0.2);">
              <table width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="font-size:22px;font-weight:700;color:#ffb020;">TomoX</div>
                    <div style="font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#f97316;margin-top:4px;">Order Status Update</div>
                  </td>
                  <td align="right" style="vertical-align:top;">
                    <span class="status-chip" style="background:${meta.color};color:#fff;padding:8px 12px;border-radius:999px;font-size:12px;font-weight:700;">${meta.chip}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td class="content" style="padding:24px;">
              <h1 class="title" style="margin:0 0 10px;font-size:26px;color:#f8fafc;font-weight:700;">${meta.title}</h1>
              <p style="margin:0 0 18px;color:#d1d5db;line-height:1.6;font-size:15px;">Hi ${name || "Customer"}, ${meta.summary}</p>

              <table width="100%" cellspacing="0" cellpadding="0" style="background:#0b1220;border:1px solid #1e293b;border-radius:12px;padding:14px;">
                <tr>
                  <td class="meta-cell" style="font-size:13px;color:#94a3b8;padding:8px 6px;">Order ID</td>
                  <td class="meta-cell" style="font-size:14px;color:#f8fafc;padding:8px 6px;text-align:right;font-weight:700;">#${orderNumber}</td>
                </tr>
                <tr>
                  <td class="meta-cell" style="font-size:13px;color:#94a3b8;padding:8px 6px;">Restaurant</td>
                  <td class="meta-cell" style="font-size:14px;color:#f8fafc;padding:8px 6px;text-align:right;">${restaurantName || "Partner Restaurant"}</td>
                </tr>
                <tr>
                  <td class="meta-cell" style="font-size:13px;color:#94a3b8;padding:8px 6px;">Updated</td>
                  <td class="meta-cell" style="font-size:14px;color:#f8fafc;padding:8px 6px;text-align:right;">${formatDate(updatedAt || new Date())}</td>
                </tr>
              </table>

              <p style="margin:18px 0 0;color:#9ca3af;font-size:13px;line-height:1.6;">Track all updates in your TomoX account.</p>
              <p style="margin:14px 0 0;">
                <a href="${CUSTOMER_APP_URL}" style="display:inline-block;background:#f97316;color:#fff;text-decoration:none;padding:10px 16px;border-radius:8px;font-size:13px;font-weight:700;">View in TomoX Customer App</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  try {
    await sendMail({
      from: `"TomoX Orders" <${EMAIL_FROM}>`,
      to: email,
      subject,
      text,
      html,
    });
  } catch (error) {
    console.error("Order status email failed:", error.message || error);
  }
};

module.exports = sendOrderStatusEmail;
