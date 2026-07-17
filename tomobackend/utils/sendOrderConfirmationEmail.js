const { sendMail, EMAIL_FROM } = require("./emailTransport");
const CUSTOMER_APP_URL = "https://tomox.netlify.app";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);

const formatDate = (date) =>
  new Date(date).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

const sendOrderConfirmationEmail = async (orderData) => {
  const {
    email,
    name,
    orderId,
    restaurantName,
    restaurantLocation,
    items,
    billing,
    address,
    phone,
    paymentMethod,
    orderDate,
  } = orderData;

  if (!email) return;

  const orderNumber = String(orderId).slice(-8).toUpperCase();
  const subject = `Order Confirmed #${orderNumber} - TomoX`;

  const itemsHtml = (items || [])
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #2a2a2a;font-size:14px;color:#f8fafc;">${item.name}</td>
        <td style="padding:10px 0;border-bottom:1px solid #2a2a2a;font-size:13px;color:#94a3b8;text-align:center;">${item.quantity || 0}</td>
        <td style="padding:10px 0;border-bottom:1px solid #2a2a2a;font-size:14px;color:#f8fafc;text-align:right;">${formatCurrency((item.price || 0) * (item.quantity || 0))}</td>
      </tr>`
    )
    .join("");

  const text = `
Order Confirmed - TomoX

Hi ${name || "Customer"},
Your order has been confirmed.

Order ID: #${orderNumber}
Restaurant: ${restaurantName || "Partner Restaurant"}
Order Date: ${formatDate(orderDate)}
Grand Total: ${formatCurrency(billing?.grandTotal)}

Track order: ${CUSTOMER_APP_URL}
`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Order Confirmed</title>
  <style>
    @media only screen and (max-width: 640px) {
      .wrap { padding: 12px !important; }
      .card { border-radius: 12px !important; }
      .content { padding: 16px !important; }
      .title { font-size: 22px !important; }
      .meta-cell { display: block !important; width: 100% !important; text-align: left !important; padding: 6px 0 !important; }
      .chip-cell { text-align: left !important; padding-top: 8px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:#0b0b0b;font-family:Arial,sans-serif;color:#f8fafc;">
  <table width="100%" cellspacing="0" cellpadding="0" style="background:#0b0b0b;">
    <tr>
      <td class="wrap" align="center" style="padding:20px;">
        <table class="card" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#111;border:1px solid #1f2937;border-radius:16px;overflow:hidden;">
          <tr>
            <td class="content" style="padding:20px;background:linear-gradient(135deg, rgba(249,115,22,0.12), rgba(234,88,12,0.04));border-bottom:1px solid rgba(249,115,22,0.2);">
              <table width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="font-size:22px;font-weight:700;color:#ffb020;">TomoX</div>
                    <div style="margin-top:4px;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:#f97316;">Order Confirmation</div>
                  </td>
                  <td class="chip-cell" align="right"><span style="background:#16a34a;color:#fff;padding:7px 12px;border-radius:999px;font-size:12px;font-weight:700;">CONFIRMED</span></td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td class="content" style="padding:20px;">
              <h1 class="title" style="margin:0 0 10px;font-size:26px;color:#f8fafc;">Order Confirmed</h1>
              <p style="margin:0 0 16px;color:#d1d5db;font-size:15px;line-height:1.6;">Hi ${name || "Customer"}, your order has been confirmed.</p>

              <table width="100%" cellspacing="0" cellpadding="0" style="background:#0b1220;border:1px solid #1e293b;border-radius:10px;padding:12px;">
                <tr><td class="meta-cell" style="padding:7px 6px;font-size:13px;color:#94a3b8;">Order ID</td><td class="meta-cell" style="padding:7px 6px;text-align:right;font-size:14px;color:#f8fafc;font-weight:700;">#${orderNumber}</td></tr>
                <tr><td class="meta-cell" style="padding:7px 6px;font-size:13px;color:#94a3b8;">Restaurant</td><td class="meta-cell" style="padding:7px 6px;text-align:right;font-size:14px;color:#f8fafc;">${restaurantName || "Partner Restaurant"}</td></tr>
                <tr><td class="meta-cell" style="padding:7px 6px;font-size:13px;color:#94a3b8;">Location</td><td class="meta-cell" style="padding:7px 6px;text-align:right;font-size:14px;color:#f8fafc;">${restaurantLocation || "-"}</td></tr>
                <tr><td class="meta-cell" style="padding:7px 6px;font-size:13px;color:#94a3b8;">Order Date</td><td class="meta-cell" style="padding:7px 6px;text-align:right;font-size:14px;color:#f8fafc;">${formatDate(orderDate)}</td></tr>
              </table>

              <div style="margin-top:14px;background:#0b0b0b;border:1px solid #1f2937;border-radius:10px;padding:12px;">
                <div style="font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:#94a3b8;margin-bottom:8px;">Items</div>
                <table width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <th style="text-align:left;color:#94a3b8;font-size:12px;padding-bottom:8px;">Item</th>
                    <th style="text-align:center;color:#94a3b8;font-size:12px;padding-bottom:8px;">Qty</th>
                    <th style="text-align:right;color:#94a3b8;font-size:12px;padding-bottom:8px;">Total</th>
                  </tr>
                  ${itemsHtml}
                </table>
              </div>

              <div style="margin-top:14px;background:#0b0b0b;border:1px solid #1f2937;border-radius:10px;padding:12px;">
                <div style="font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:#94a3b8;margin-bottom:8px;">Bill Summary</div>
                <table width="100%" cellspacing="0" cellpadding="0">
                  <tr><td style="padding:6px 0;color:#d1d5db;font-size:14px;">Items subtotal</td><td style="padding:6px 0;text-align:right;color:#f8fafc;font-size:14px;">${formatCurrency(billing?.itemsSubtotal)}</td></tr>
                  <tr><td style="padding:6px 0;color:#d1d5db;font-size:14px;">Delivery charges</td><td style="padding:6px 0;text-align:right;color:#f8fafc;font-size:14px;">${formatCurrency(billing?.deliveryCharges)}</td></tr>
                  <tr><td style="padding:6px 0;color:#d1d5db;font-size:14px;">GST</td><td style="padding:6px 0;text-align:right;color:#f8fafc;font-size:14px;">${formatCurrency(billing?.gst)}</td></tr>
                  <tr><td style="padding:8px 0 0;border-top:1px solid #2a2a2a;color:#ffb020;font-weight:700;font-size:16px;">Grand total</td><td style="padding:8px 0 0;border-top:1px solid #2a2a2a;text-align:right;color:#ffb020;font-weight:700;font-size:16px;">${formatCurrency(billing?.grandTotal)}</td></tr>
                </table>
              </div>

              <p style="margin:14px 0 0;color:#9ca3af;font-size:13px;line-height:1.6;">Delivery address: ${address || "-"}<br/>Phone: ${phone || "-"}<br/>Payment: ${(paymentMethod || "cod").toUpperCase()}</p>
              <p style="margin:14px 0 0;">
                <a href="${CUSTOMER_APP_URL}" style="display:inline-block;background:#f97316;color:#fff;text-decoration:none;padding:10px 16px;border-radius:8px;font-size:13px;font-weight:700;">Track in TomoX Customer App</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:14px 20px;border-top:1px solid #1f2937;color:#9ca3af;font-size:12px;text-align:center;">This is an automated email from TomoX.</td>
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
    console.log(`Order confirmation email sent to ${email} for order #${orderNumber}`);
  } catch (error) {
    console.error("Failed to send order confirmation email:", error.message || error);
  }
};

module.exports = sendOrderConfirmationEmail;
