import React, { useEffect, useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import PageLoader from "../components/PageLoader";

const API_COMPANY = import.meta.env.VITE_API_COMPANY;

// A custom pulsing dot or bike icon
const createBikeIcon = () => {
  return L.divIcon({
    className: "custom-bike-icon",
    html: `<div style="background-color: #ff8a00; color: white; width: 36px; height: 36px; display: flex; justify-content: center; align-items: center; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); font-size: 16px;">
             <i class="fas fa-motorcycle"></i>
           </div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
};

const createDotIcon = (color) => {
  return L.divIcon({
    className: "custom-dot-icon",
    html: `<div style="background-color: ${color}; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -8],
  });
};

const OrderTracking = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [vendorCoord, setVendorCoord] = useState(null);
  const [customerCoord, setCustomerCoord] = useState(null);
  
  // Simulation state
  const [bikeProgress, setBikeProgress] = useState(0); // 0 to 1
  const [bikeCoord, setBikeCoord] = useState(null);

  const token = useMemo(() => localStorage.getItem("token"), []);

  useEffect(() => {
    if (!token) {
      navigate("/sign-in");
      return;
    }
    
    // Fetch order details
    const fetchOrder = async () => {
      try {
        const response = await fetch(`${API_COMPANY}/api/orders/my/list`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        const currentOrder = data.orders?.find(o => o._id === id);
        
        if (!currentOrder) {
          throw new Error("Order not found");
        }
        
        setOrder(currentOrder);
        
        // Geocode addresses
        const geocode = async (address) => {
          if (!address) return null;
          const query = encodeURIComponent(address);
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`);
            const locData = await res.json();
            if (locData && locData.length > 0) {
              return [parseFloat(locData[0].lat), parseFloat(locData[0].lon)];
            }
          } catch (e) {
            console.error("Geocoding failed for", address);
          }
          return null;
        };

        let vendorAddressStr = "Tenali, Guntur"; 
        try {
          const vRes = await fetch(`${API_COMPANY}/api/restaurants/vendor/${currentOrder.vendorId}`, {
             headers: { Authorization: `Bearer ${token}` },
          });
          const vData = await vRes.json();
          if (vData && vData.location) {
             vendorAddressStr = vData.location;
          }
        } catch(e) {}

        const vCoord = await geocode(vendorAddressStr) || [16.2366, 80.6405];
        const cCoord = await geocode(currentOrder.customerAddress) || [16.2400, 80.6500];

        setVendorCoord(vCoord);
        setCustomerCoord(cCoord);
        setBikeCoord(vCoord);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrder();
  }, [id, token, navigate]);

  // Handle Future Socket Integration
  useEffect(() => {
    // This is where socket integration will happen in the future
  }, [id, token]);

  // Simulation Loop
  useEffect(() => {
    if (!vendorCoord || !customerCoord || !order) return;
    
    const status = (order.status || "").toLowerCase();
    let targetProgress = 0;
    
    if (status === "pending" || status === "accepted") {
      targetProgress = 0.05; 
    } else if (status === "out_for_delivery") {
      // Simulate moving
      const interval = setInterval(() => {
        setBikeProgress((prev) => {
          const next = prev + 0.005; // 0.5% per tick
          return next > 0.95 ? 0.95 : next;
        });
      }, 1000);
      return () => clearInterval(interval);
    } else if (status === "completed" || status === "delivered") {
      targetProgress = 1;
    }
    
    setBikeProgress(targetProgress);
  }, [vendorCoord, customerCoord, order]);

  // Update bike coord based on progress
  useEffect(() => {
    if (!vendorCoord || !customerCoord) return;
    const lat = vendorCoord[0] + (customerCoord[0] - vendorCoord[0]) * bikeProgress;
    const lng = vendorCoord[1] + (customerCoord[1] - vendorCoord[1]) * bikeProgress;
    setBikeCoord([lat, lng]);
  }, [bikeProgress, vendorCoord, customerCoord]);


  if (loading) return <PageLoader />;
  if (error) return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h2>Oops, something went wrong.</h2>
      <p>{error}</p>
      <Link to="/orders" className="cart-primary-action">Back to Orders</Link>
    </div>
  );

  const status = (order.status || "pending").toLowerCase();

  return (
    <div className="tracking-page" style={{ height: "calc(100vh - 64px)", display: "flex", flexDirection: "column" }}>
      {/* Header Info */}
      <div style={{ padding: "24px", background: "white", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", zIndex: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <h2 style={{ margin: 0, fontSize: "24px", color: "#1e293b" }}>Track Order</h2>
          <span style={{ 
            background: status === "out_for_delivery" ? "#fef3c7" : status === "completed" ? "#dcfce7" : "#f1f5f9", 
            color: status === "out_for_delivery" ? "#d97706" : status === "completed" ? "#16a34a" : "#475569", 
            padding: "6px 12px", 
            borderRadius: "20px", 
            fontWeight: "bold",
            fontSize: "14px"
          }}>
            {status.replace(/_/g, " ").toUpperCase()}
          </span>
        </div>
        <p style={{ margin: 0, color: "#64748b", fontSize: "15px" }}>
          Order #{String(order._id).slice(-6).toUpperCase()} • Estimated delivery in {Math.max(5, Math.floor(100 - (bikeProgress * 100)) / 2)} mins
        </p>
      </div>

      {/* Map Container */}
      <div style={{ flex: 1, position: "relative" }}>
        {vendorCoord && customerCoord && (
          <MapContainer 
            center={[(vendorCoord[0] + customerCoord[0]) / 2, (vendorCoord[1] + customerCoord[1]) / 2]} 
            zoom={14} 
            style={{ height: "100%", width: "100%", zIndex: 1 }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />
            
            <Marker position={vendorCoord} icon={createDotIcon("#ef4444")}>
              <Popup>Restaurant</Popup>
            </Marker>
            
            <Marker position={customerCoord} icon={createDotIcon("#3b82f6")}>
              <Popup>Delivery Location</Popup>
            </Marker>
            
            <Polyline positions={[vendorCoord, customerCoord]} pathOptions={{ color: "#94a3b8", weight: 4, dashArray: "10, 10" }} />
            
            {bikeCoord && (
              <Marker position={bikeCoord} icon={createBikeIcon()}>
                <Popup>Delivery Partner is on the way!</Popup>
              </Marker>
            )}
          </MapContainer>
        )}
      </div>
      
      {/* Footer Info */}
      <div style={{ padding: "24px", background: "white", boxShadow: "0 -2px 10px rgba(0,0,0,0.05)", zIndex: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
           <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ width: "48px", height: "48px", background: "#f1f5f9", borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "20px", color: "#64748b" }}>
                <i className="fas fa-motorcycle"></i>
              </div>
              <div>
                <h4 style={{ margin: "0 0 4px 0", color: "#1e293b", fontSize: "16px" }}>Delivery Partner</h4>
                <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>Arriving soon</p>
              </div>
           </div>
           
           <div style={{ display: "flex", gap: "12px" }}>
              <button style={{ width: "40px", height: "40px", borderRadius: "50%", border: "1px solid #e2e8f0", background: "white", color: "#0ea5e9", fontSize: "16px", cursor: "pointer" }}>
                <i className="fas fa-phone-alt"></i>
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
