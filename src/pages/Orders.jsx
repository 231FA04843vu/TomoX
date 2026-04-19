import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import PageLoader from "../components/PageLoader";

const API_COMPANY = import.meta.env.VITE_API_COMPANY;

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const formatOrderDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  return `${date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })} • ${date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
};

const getStatusLabel = (status) => {
  const normalized = (status || "pending").toLowerCase();
  if (normalized === "accepted") return "Accepted";
  if (normalized === "out_for_delivery") return "Out for Delivery";
  if (normalized === "completed" || normalized === "delivered") return "Delivered";
  if (normalized === "rejected") return "Rejected";
  return "Pending";
};

const getOrderCurrentStep = (status) => {
  const normalized = (status || "pending").toLowerCase();
  if (normalized === "out_for_delivery") return 3;
  if (normalized === "completed" || normalized === "delivered") return 4;
  if (normalized === "accepted") return 2;
  if (normalized === "rejected") return 2;
  return 1;
};

function Orders({ user }) {
  const [orders, setOrders] = useState([]);
  const [ordersStatus, setOrdersStatus] = useState(null);
  const [deletingOrderId, setDeletingOrderId] = useState(null);
  const [pendingDeleteOrderId, setPendingDeleteOrderId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const authToken = useMemo(() => localStorage.getItem("token"), []);

  const loadOrders = async () => {
    if (!authToken) {
      setOrders([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setOrdersStatus(null);
    try {
      const response = await fetch(`${API_COMPANY}/api/orders/my/list`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await response.json();

      if (!response.ok) {
        setOrders([]);
        setOrdersStatus({
          type: "error",
          message: data.message || "Unable to load orders.",
        });
      } else {
        setOrders(data.orders || []);
      }
    } catch {
      setOrders([]);
      setOrdersStatus({
        type: "error",
        message: "Unable to load orders right now.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadInvoice = (order) => {
    const invoiceNumber = `INV-${String(order._id).slice(-8).toUpperCase()}`;
    const orderNumber = String(order._id).slice(-6).toUpperCase();
    const issuedAt = formatOrderDateTime(order.createdAt);

    const itemsRows = (order.items || [])
      .map(
        (item) => `
        <tr>
          <td>${item.name}</td>
          <td style="text-align:center;">${item.quantity || 0}</td>
          <td style="text-align:right;">${formatCurrency(item.price || 0)}</td>
          <td style="text-align:right;">${formatCurrency((item.price || 0) * (item.quantity || 0))}</td>
        </tr>`
      )
      .join("");

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Invoice ${invoiceNumber}</title>
  <style>
    body { font-family: Arial, sans-serif; color: #0f172a; padding: 24px; }
    .invoice { max-width: 800px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; }
    .header { background: #fff7ed; padding: 20px 24px; border-bottom: 1px solid #fed7aa; }
    .header h1 { margin: 0; color: #c2410c; font-size: 22px; }
    .meta { padding: 16px 24px; border-bottom: 1px solid #e2e8f0; }
    .meta p { margin: 4px 0; }
    .section { padding: 16px 24px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 10px 8px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
    th { text-align: left; background: #f8fafc; }
    .totals { margin-top: 14px; }
    .totals p { margin: 6px 0; display: flex; justify-content: space-between; }
    .grand { font-weight: 700; color: #c2410c; font-size: 16px; }
  </style>
</head>
<body>
  <div class="invoice">
    <div class="header">
      <h1>TomoX Invoice</h1>
      <p style="margin:6px 0 0;">Invoice No: <strong>${invoiceNumber}</strong></p>
    </div>
    <div class="meta">
      <p>Order No: <strong>#${orderNumber}</strong></p>
      <p>Date: ${issuedAt}</p>
      <p>Customer: ${order.customerName || user?.name || "Customer"}</p>
      <p>Phone: ${order.customerPhone || "-"}</p>
      <p>Address: ${order.customerAddress || "-"}</p>
    </div>
    <div class="section">
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th style="text-align:center;">Qty</th>
            <th style="text-align:right;">Price</th>
            <th style="text-align:right;">Total</th>
          </tr>
        </thead>
        <tbody>${itemsRows}</tbody>
      </table>
      <div class="totals">
        <p><span>Items subtotal</span><span>${formatCurrency(order.itemsSubtotal)}</span></p>
        <p><span>Delivery charges</span><span>${formatCurrency(order.deliveryCharges)}</span></p>
        <p><span>Tip</span><span>${formatCurrency(order.tip)}</span></p>
        <p><span>GST</span><span>${formatCurrency(order.gst)}</span></p>
        <p><span>Discount</span><span>- ${formatCurrency(order.totalDiscount || order.couponDiscount)}</span></p>
        <p class="grand"><span>Grand total</span><span>${formatCurrency(order.grandTotal || order.totalPrice)}</span></p>
      </div>
    </div>
  </div>
  <script>window.print();</script>
</body>
</html>`;

    const win = window.open("", "_blank", "width=980,height=820");
    if (!win) return;
    win.document.write(html);
    win.document.close();
  };

  const handleDeleteOrder = (orderId) => {
    setPendingDeleteOrderId(orderId);
  };

  const confirmDeleteOrder = async () => {
    if (!pendingDeleteOrderId || !authToken) return;

    const orderId = pendingDeleteOrderId;
    setPendingDeleteOrderId(null);
    setDeletingOrderId(orderId);
    setOrdersStatus(null);

    try {
      const response = await fetch(`${API_COMPANY}/api/orders/${orderId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || data.error || "Failed to delete order");

      setOrders((prev) => prev.filter((order) => order._id !== orderId));
      setOrdersStatus({
        type: "success",
        message: "Order deleted successfully.",
      });
    } catch (error) {
      setOrdersStatus({
        type: "error",
        message: error.message || "Failed to delete order",
      });
    } finally {
      setDeletingOrderId(null);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    const handleOrderStatus = (event) => {
      const payload = event.detail;
      if (!payload?.orderId || !payload?.status) return;

      setOrders((prev) =>
        prev.map((order) =>
          order._id === payload.orderId ? { ...order, status: payload.status } : order
        )
      );

      setOrdersStatus({
        type: "success",
        message: `Order #${payload.orderId.slice(-6)} is now ${getStatusLabel(payload.status)}.`,
      });
    };

    window.addEventListener("tomo:order-status", handleOrderStatus);
    return () => window.removeEventListener("tomo:order-status", handleOrderStatus);
  }, []);

  if (!user) {
    return (
      <div className="account-container account-guest">
        <div className="account-hero">
          <div>
            <span className="account-kicker">Orders</span>
            <h2>Sign in to view your orders</h2>
            <p className="account-subtitle">Track live status and download invoices.</p>
            <Link to="/sign-in" className="account-cta">Sign In</Link>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="account-container">
      <div className="account-hero">
        <div>
          <span className="account-kicker">Orders</span>
          <h2>Your orders</h2>
          <p className="account-subtitle">Track every order, download invoice, and manage history.</p>
        </div>
      </div>

      {ordersStatus && (
        <div className={`orders-status-message ${ordersStatus.type}`}>
          {ordersStatus.message}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="orders-empty-state">
          <p>No orders yet. Place your first order to see tracking here.</p>
          <Link to="/" className="orders-start-link">Start ordering</Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => {
            const normalizedStatus = (order.status || "pending").toLowerCase();
            const currentStep = getOrderCurrentStep(normalizedStatus);

            return (
              <article key={order._id} className="order-card">
                <header className="order-card-header">
                  <div>
                    <h4>Order #{String(order._id).slice(-6).toUpperCase()}</h4>
                    <p>{formatOrderDateTime(order.createdAt)}</p>
                  </div>
                  <span className={`order-status-chip ${normalizedStatus}`}>
                    {getStatusLabel(normalizedStatus)}
                  </span>
                </header>

                <div className="order-timeline" role="list" aria-label="Order tracking">
                  {[
                    "Order placed",
                    normalizedStatus === "rejected" ? "Order rejected" : "Confirmed",
                    "Out for delivery",
                    "Delivered",
                  ].map((stepLabel, index) => {
                    const stepNumber = index + 1;
                    const isActive = stepNumber === currentStep;
                    const isCompleted =
                      normalizedStatus === "rejected"
                        ? stepNumber === 1 || stepNumber === 2
                        : stepNumber < currentStep || normalizedStatus === "delivered" || normalizedStatus === "completed";
                    const isHiddenAfterReject = normalizedStatus === "rejected" && stepNumber > 2;

                    if (isHiddenAfterReject) return null;

                    return (
                      <div key={stepLabel} className="order-timeline-step" role="listitem">
                        <span
                          className={`timeline-dot ${
                            isCompleted ? "completed" : isActive ? "active" : ""
                          } ${normalizedStatus === "rejected" && stepNumber === 2 ? "rejected" : ""}`}
                        />
                        <span className="timeline-label">{stepLabel}</span>
                        {stepNumber < (normalizedStatus === "rejected" ? 2 : 4) && (
                          <span
                            className={`timeline-line ${
                              isCompleted ? "completed" : ""
                            } ${normalizedStatus === "rejected" && stepNumber === 1 ? "rejected" : ""}`}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="order-details-grid">
                  <div className="order-detail-block">
                    <h5>Items</h5>
                    <ul>
                      {(order.items || []).map((item, idx) => (
                        <li key={`${order._id}-${item.name}-${idx}`}>
                          <span>{item.name} × {item.quantity}</span>
                          <strong>{formatCurrency((item.price || 0) * (item.quantity || 0))}</strong>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="order-detail-block">
                    <h5>Order Info</h5>
                    <ul>
                      <li>
                        <span>Payment</span>
                        <strong>{(order.paymentMethod || "cod").toUpperCase()}</strong>
                      </li>
                      <li>
                        <span>Address</span>
                        <strong>{order.customerAddress || "-"}</strong>
                      </li>
                      <li>
                        <span>Phone</span>
                        <strong>{order.customerPhone || "-"}</strong>
                      </li>
                    </ul>
                  </div>

                  <div className="order-detail-block billing">
                    <h5>Bill Details</h5>
                    <ul>
                      <li><span>Items subtotal</span><strong>{formatCurrency(order.itemsSubtotal)}</strong></li>
                      <li><span>Delivery charges</span><strong>{formatCurrency(order.deliveryCharges)}</strong></li>
                      <li><span>Distance</span><strong>{Number(order.distance || 0).toFixed(1)} km</strong></li>
                      <li><span>Tip</span><strong>{formatCurrency(order.tip)}</strong></li>
                      <li><span>GST</span><strong>{formatCurrency(order.gst)}</strong></li>
                      <li><span>Coupon</span><strong>{order.couponCode || "-"}</strong></li>
                      <li><span>Discount</span><strong>- {formatCurrency(order.totalDiscount || order.couponDiscount)}</strong></li>
                      <li className="grand-total"><span>Grand total</span><strong>{formatCurrency(order.grandTotal || order.totalPrice)}</strong></li>
                    </ul>
                  </div>
                </div>

                <div className="order-card-actions" style={{ justifyContent: "space-between" }}>
                  <button
                    type="button"
                    className="order-delete-btn"
                    onClick={() => downloadInvoice(order)}
                    style={{ color: "#0369a1", borderColor: "#bae6fd", borderStyle: "solid" }}
                  >
                    <i className="fas fa-file-invoice"></i> Download Invoice
                  </button>

                  <button
                    type="button"
                    className="order-delete-btn"
                    onClick={() => handleDeleteOrder(order._id)}
                    disabled={deletingOrderId === order._id}
                  >
                    {deletingOrderId === order._id ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i> Deleting...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-trash-alt"></i> Delete Order
                      </>
                    )}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {pendingDeleteOrderId && (
        <div className="account-modal-backdrop" role="presentation" onClick={() => setPendingDeleteOrderId(null)}>
          <div className="account-modal order-delete-confirm-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="account-modal-header">
              <div>
                <span className="modal-kicker">Confirm action</span>
                <h3>Delete Order</h3>
              </div>
              <button type="button" className="account-modal-close" onClick={() => setPendingDeleteOrderId(null)}>
                Cancel
              </button>
            </div>
            <div className="account-modal-body">
              <section className="account-panel">
                <div className="order-delete-confirm-content">
                  <div className="delete-icon-wrapper">
                    <i className="fas fa-exclamation-triangle"></i>
                  </div>
                  <h4>Are you sure you want to delete this order?</h4>
                  <p>
                    Order <strong>#{String(pendingDeleteOrderId).slice(-6).toUpperCase()}</strong> will be permanently removed from your order history.
                  </p>
                  <p className="warning-text">This action cannot be undone.</p>
                  <div className="delete-confirm-actions">
                    <button type="button" className="confirm-btn cancel" onClick={() => setPendingDeleteOrderId(null)}>
                      Cancel
                    </button>
                    <button type="button" className="confirm-btn delete" onClick={confirmDeleteOrder}>
                      <i className="fas fa-trash-alt"></i> Delete Order
                    </button>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Orders;
