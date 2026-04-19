import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import PageLoader from "../components/PageLoader";
import { normalizeAssetUrl } from "../utils/url";
import "../styles/pageLoader.css";

const API_COMPANY = import.meta.env.VITE_API_COMPANY;
const AVATAR_STORAGE_KEY = "tomo.avatar.v1";

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
  if (normalized === "completed") return "Delivered";
  if (normalized === "delivered") return "Delivered";
  if (normalized === "rejected") return "Rejected";
  return "Pending";
};

const getOrderCurrentStep = (status) => {
  const normalized = (status || "pending").toLowerCase();
  if (normalized === "out_for_delivery") return 3;
  if (normalized === "completed") return 4;
  if (normalized === "delivered") return 4;
  if (normalized === "accepted") return 2;
  if (normalized === "rejected") return 2;
  return 1;
};

function Account({ user, onUserUpdate }) {
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [profileStatus, setProfileStatus] = useState(null);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [customAvatar, setCustomAvatar] = useState(null);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordStatus, setPasswordStatus] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [ordersStatus, setOrdersStatus] = useState(null);
  const [addressForm, setAddressForm] = useState({
    label: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    landmark: "",
    phone: "",
    isDefault: false,
  });
  const [geoStatus, setGeoStatus] = useState(null);
  const [isGeoLoading, setIsGeoLoading] = useState(false);
  const [geoPoint, setGeoPoint] = useState(null);
  const [geoSuggestions, setGeoSuggestions] = useState([]);
  const [postalOptions, setPostalOptions] = useState([]);
  const [postalStatus, setPostalStatus] = useState(null);
  const [isPostalLoading, setIsPostalLoading] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressStatus, setAddressStatus] = useState(null);
  const [activeModal, setActiveModal] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleteStatus, setDeleteStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingOrderId, setDeletingOrderId] = useState(null);
  const [orderDeleteStatus, setOrderDeleteStatus] = useState(null);
  const [pendingDeleteOrderId, setPendingDeleteOrderId] = useState(null);
  const fileInputRef = useRef(null);

  const navigate = useNavigate();

  const authToken = useMemo(() => localStorage.getItem("token"), []);

  const avatarOptions = [
    { id: "man", label: "Man" },
    { id: "boy", label: "Boy" },
    { id: "girl", label: "Girl" },
    { id: "woman", label: "Woman" },
    { id: "aesthetic", label: "Aesthetic" },
    { id: "artist", label: "Artist" },
    { id: "traveler", label: "Traveler" },
    { id: "chef", label: "Chef" },
  ];

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });

      const cachedAvatar = (() => {
        try {
          const raw = localStorage.getItem(AVATAR_STORAGE_KEY);
          return raw ? JSON.parse(raw) : null;
        } catch {
          return null;
        }
      })();

      const preset = user.avatarPreset || cachedAvatar?.avatarPreset || null;
      const avatarUrl = normalizeAssetUrl(
        user.avatarUrl || cachedAvatar?.avatarUrl || null
      );
      setSelectedAvatar(preset);
      setCustomAvatar(avatarUrl);

      if (user.avatarPreset || user.avatarUrl) {
        try {
          localStorage.setItem(
            AVATAR_STORAGE_KEY,
            JSON.stringify({
              avatarPreset: user.avatarPreset || null,
              avatarUrl: user.avatarUrl || null,
            })
          );
        } catch {
          // Ignore storage errors
        }
      }
    }
  }, [user]);

  useEffect(() => {
    if (!authToken) {
      setOrders([]);
      setIsLoading(false);
      return;
    }
    const loadAccountData = async () => {
      setIsLoading(true);
      setOrdersStatus(null);
      try {
        const headers = { Authorization: `Bearer ${authToken}` };
        const [addressResponse, ordersResponse] = await Promise.all([
          fetch(`${API_COMPANY}/api/me/addresses`, { headers }),
          fetch(`${API_COMPANY}/api/orders/my/list`, { headers }),
        ]);

        const [addressData, ordersData] = await Promise.all([
          addressResponse.json(),
          ordersResponse.json(),
        ]);

        if (addressResponse.ok) {
          setAddresses(addressData.addresses || []);
        } else {
          setAddresses([]);
        }

        if (ordersResponse.ok) {
          setOrders(ordersData.orders || []);
        } else {
          setOrders([]);
          setOrdersStatus({
            type: "error",
            message: ordersData.message || "Unable to load orders.",
          });
        }
      } catch {
        setAddresses([]);
        setOrders([]);
        setOrdersStatus({
          type: "error",
          message: "Unable to load orders right now.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadAccountData();
  }, [authToken]);

  useEffect(() => {
    const handleOrderStatus = (event) => {
      const payload = event.detail;
      if (!payload?.orderId || !payload?.status) return;

      setOrders((prev) =>
        prev.map((order) =>
          order._id === payload.orderId
            ? { ...order, status: payload.status }
            : order
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
            <span className="account-kicker">Account</span>
            <h2>Sign in to manage your account</h2>
            <p className="account-subtitle">
              Track orders, save addresses, and get faster support.
            </p>
            <Link to="/sign-in" className="account-cta">
              Sign In
            </Link>
          </div>
          <div className="account-guest-card">
            <h3>Why sign in?</h3>
            <ul>
              <li>Track orders and re-order quickly</li>
              <li>Save delivery addresses</li>
              <li>Get help faster with support tickets</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  const displayName =
    user?.name || user?.fullName || user?.email || "TomoX Customer";

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const persistAvatar = async (payload) => {
    if (!authToken) return;
    try {
      const response = await fetch(`${API_COMPANY}/api/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (response.ok && onUserUpdate) onUserUpdate(data.user);
      if (response.ok) {
        try {
          localStorage.setItem(
            AVATAR_STORAGE_KEY,
            JSON.stringify({
              avatarPreset: data.user?.avatarPreset || null,
              avatarUrl: data.user?.avatarUrl || null,
            })
          );
        } catch {
          // Ignore storage errors
        }
      }
    } catch {
      // Ignore avatar persistence errors
    }
  };

  const handleCustomAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("Image must be under 2MB.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("image", file);
      const response = await fetch(`${API_COMPANY}/api/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Upload failed");

      setCustomAvatar(normalizeAssetUrl(data.url));
      setSelectedAvatar(null);
      setShowAvatarPicker(false);
      persistAvatar({ avatarPreset: null, avatarUrl: data.url });
    } catch {
      alert("Failed to upload avatar. Please try again.");
    }
  };

  const selectAvatar = (avatarId) => {
    setSelectedAvatar(avatarId);
    setCustomAvatar(null);
    setShowAvatarPicker(false);
    persistAvatar({ avatarPreset: avatarId, avatarUrl: null });
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (event) => {
    const { name, value, type, checked } = event.target;
    setAddressForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const applyGeoSuggestion = (suggestion) => {
    if (!suggestion) return;
    setAddressForm((prev) => ({
      ...prev,
      line1: suggestion.line1 || prev.line1,
      line2: suggestion.line2 || prev.line2,
      city: suggestion.city || prev.city,
      state: suggestion.state || prev.state,
      postalCode: suggestion.postalCode || prev.postalCode,
      landmark: suggestion.landmark || prev.landmark,
    }));
  };

  const handlePostalLookup = async () => {
    const postalCode = addressForm.postalCode?.trim();
    if (!postalCode) {
      setPostalStatus({ type: "error", message: "Enter a postal code." });
      return;
    }
    setIsPostalLoading(true);
    setPostalStatus(null);
    setPostalOptions([]);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&countrycodes=in&postalcode=${encodeURIComponent(
          postalCode
        )}&limit=10&accept-language=en`
      );
      const results = await response.json();
      const options = (Array.isArray(results) ? results : [])
        .map((result, index) => {
          const address = result.address || {};
          const city =
            address.village ||
            address.hamlet ||
            address.suburb ||
            address.town ||
            address.city ||
            address.county ||
            "";
          const line1Parts = [address.house_number, address.road].filter(Boolean);
          const line2Value =
            address.neighbourhood ||
            address.suburb ||
            address.city_district ||
            address.county ||
            "";

          return {
            id: `${result.place_id}-${index}`,
            label: city || result.display_name || "Location",
            line1: line1Parts.join(" "),
            line2: line2Value,
            city,
            state: address.state || address.state_district || "",
            postalCode: address.postcode || postalCode,
            landmark: address.amenity || address.shop || "",
          };
        })
        .filter((option) => option.label);

      setPostalOptions(options);
      if (options.length === 0) {
        setPostalStatus({
          type: "error",
          message: "No places found for that postal code.",
        });
      } else {
        setPostalStatus({
          type: "success",
          message: "Select your village from the list.",
        });
      }
    } catch (error) {
      setPostalStatus({
        type: "error",
        message: "Unable to fetch postal code locations.",
      });
    } finally {
      setIsPostalLoading(false);
    }
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus({ type: "error", message: "Geolocation is not supported." });
      return;
    }

    setIsGeoLoading(true);
    setGeoStatus(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&zoom=18&namedetails=1&accept-language=en&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          const address = data.address || {};
          const line1Parts = [address.house_number, address.road].filter(Boolean);
          const locality =
            address.village ||
            address.hamlet ||
            address.suburb ||
            address.town ||
            address.city ||
            address.city_district ||
            address.county ||
            "";
          const line2Value =
            address.neighbourhood ||
            address.suburb ||
            address.city_district ||
            address.county ||
            "";
          const cityCandidates = [
            address.village,
            address.hamlet,
            address.suburb,
            address.town,
            address.city,
            address.city_district,
            address.county,
          ].filter(Boolean);
          const suggestionBase = {
            line1: line1Parts.join(" "),
            line2: line2Value,
            state: address.state || address.state_district || "",
            postalCode: address.postcode || "",
            landmark: address.amenity || address.shop || "",
          };
          const suggestions = cityCandidates.slice(0, 3).map((city, index) => ({
            id: `${city}-${index}`,
            label: `Use ${city}`,
            ...suggestionBase,
            city,
          }));

          if (!suggestions.length) {
            suggestions.push({
              id: "current-location",
              label: "Use current location",
              ...suggestionBase,
              city: locality,
            });
          }

          setAddressForm((prev) => ({
            ...prev,
            label: prev.label || "Current location",
            line1: line1Parts.join(" ") || prev.line1,
            line2: line2Value || prev.line2,
            city: locality || prev.city,
            state: address.state || address.state_district || prev.state,
            postalCode: address.postcode || prev.postalCode,
            landmark: address.amenity || address.shop || prev.landmark,
          }));
          setGeoSuggestions(suggestions);
          setGeoPoint({ lat: latitude, lon: longitude });
          setGeoStatus({ type: "success", message: "Location loaded." });
        } catch (error) {
          setGeoStatus({
            type: "error",
            message: "Unable to fetch address details.",
          });
        } finally {
          setIsGeoLoading(false);
        }
      },
      () => {
        setIsGeoLoading(false);
        setGeoStatus({
          type: "error",
          message: "Location access denied or unavailable.",
        });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    setProfileStatus(null);

    try {
      const response = await fetch(`${API_COMPANY}/api/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(profileForm),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Update failed");
      setProfileStatus({ type: "success", message: "Profile updated" });
      if (onUserUpdate) onUserUpdate(data.user);
    } catch (error) {
      setProfileStatus({
        type: "error",
        message: error.message || "Update failed",
      });
    }
  };

  const savePassword = async (event) => {
    event.preventDefault();
    setPasswordStatus(null);
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordStatus({ type: "error", message: "Passwords do not match" });
      return;
    }

    try {
      const response = await fetch(`${API_COMPANY}/api/me/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Update failed");
      setPasswordStatus({ type: "success", message: "Password updated" });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      setPasswordStatus({
        type: "error",
        message: error.message || "Update failed",
      });
    }
  };

  const resetAddressForm = () => {
    setAddressForm({
      label: "",
      line1: "",
      line2: "",
      city: "",
      state: "",
      postalCode: "",
      landmark: "",
      phone: "",
      isDefault: false,
    });
    setGeoStatus(null);
    setIsGeoLoading(false);
    setGeoPoint(null);
    setGeoSuggestions([]);
    setPostalOptions([]);
    setPostalStatus(null);
    setIsPostalLoading(false);
    setEditingAddressId(null);
  };

  const saveAddress = async (event) => {
    event.preventDefault();
    setAddressStatus(null);

    try {
      const endpoint = editingAddressId
        ? `${API_COMPANY}/api/me/addresses/${editingAddressId}`
        : `${API_COMPANY}/api/me/addresses`;
      const method = editingAddressId ? "PUT" : "POST";
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(addressForm),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Update failed");
      setAddresses(data.addresses || []);
      setAddressStatus({ type: "success", message: "Address saved" });
      resetAddressForm();
    } catch (error) {
      setAddressStatus({
        type: "error",
        message: error.message || "Update failed",
      });
    }
  };

  const editAddress = (address) => {
    setEditingAddressId(address._id);
    setAddressForm({
      label: address.label || "",
      line1: address.line1 || "",
      line2: address.line2 || "",
      city: address.city || "",
      state: address.state || "",
      postalCode: address.postalCode || "",
      landmark: address.landmark || "",
      phone: address.phone || "",
      isDefault: Boolean(address.isDefault),
    });
  };

  const deleteAddress = async (addressId) => {
    setAddressStatus(null);
    try {
      const response = await fetch(
        `${API_COMPANY}/api/me/addresses/${addressId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Delete failed");
      setAddresses(data.addresses || []);
      setAddressStatus({ type: "success", message: "Address removed" });
      if (editingAddressId === addressId) resetAddressForm();
    } catch (error) {
      setAddressStatus({
        type: "error",
        message: error.message || "Delete failed",
      });
    }
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const handleDeleteOrder = (orderId) => {
    setPendingDeleteOrderId(orderId);
  };

  const confirmDeleteOrder = async () => {
    const orderId = pendingDeleteOrderId;
    if (!orderId) return;

    setPendingDeleteOrderId(null);
    setDeletingOrderId(orderId);
    setOrderDeleteStatus(null);

    try {
      const response = await fetch(`${API_COMPANY}/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message || 'Failed to delete order');
      
      setOrders((prev) => prev.filter((order) => order._id !== orderId));
      setOrderDeleteStatus({ type: 'success', message: 'Order deleted successfully' });
      setTimeout(() => setOrderDeleteStatus(null), 3000);
    } catch (error) {
      setOrderDeleteStatus({
        type: 'error',
        message: error.message || 'Failed to delete order',
      });
    } finally {
      setDeletingOrderId(null);
    }
  };

  const cancelDeleteOrder = () => {
    setPendingDeleteOrderId(null);
  };

  const handleDeleteAccount = async (event) => {
    event.preventDefault();
    setDeleteStatus(null);
    try {
      const response = await fetch(`${API_COMPANY}/api/me`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Delete failed");
      localStorage.removeItem("token");
      localStorage.removeItem("tomo.cart.v1");
      if (onUserUpdate) onUserUpdate(null);
      navigate("/");
    } catch (error) {
      setDeleteStatus({
        type: "error",
        message: error.message || "Delete failed",
      });
    }
  };

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="account-container">
      <div className="account-hero">
        <div className="account-hero-main">
          <div className="account-avatar-block">
            <div className="account-avatar">
              {customAvatar ? (
                <img src={normalizeAssetUrl(customAvatar)} alt="" />
              ) : selectedAvatar ? (
                <span
                  className={`avatar-preset avatar-preset--${selectedAvatar}`}
                  aria-hidden="true"
                />
              ) : (
                <span className="avatar-initial">
                  {displayName.slice(0, 1).toUpperCase()}
                </span>
              )}
              <button
                type="button"
                className="avatar-edit-icon"
                onClick={() => setShowAvatarPicker(true)}
                aria-label="Edit profile picture"
              >
                <i className="fas fa-pen"></i>
              </button>
            </div>
          </div>
          <div>
            <span className="account-kicker">My Account</span>
            <h2>Hi, {displayName}</h2>
            <p className="account-subtitle">
              Manage orders, saved details, and support.
            </p>
          </div>
        </div>
        <div className="account-meta">
          <span className="account-chip">Member</span>
          <span className="account-chip strong">Verified</span>
        </div>
      </div>

      <div className="account-grid">
        <Link to="/orders" className="account-tile primary">
          <div className="tile-title">Orders</div>
          <div className="tile-meta">Track current and past orders with timeline</div>
          <div className="tile-note">{orders.length} total</div>
        </Link>
        <button
          type="button"
          className="account-tile"
          onClick={() => setActiveModal("profile")}
        >
          <div className="tile-title">Personal info</div>
          <div className="tile-meta">Name, email, phone</div>
        </button>
        <button
          type="button"
          className="account-tile"
          onClick={() => setActiveModal("password")}
        >
          <div className="tile-title">Password</div>
          <div className="tile-meta">Update your password</div>
        </button>
        <Link to="/cart" className="account-tile">
          <div className="tile-title">Cart</div>
          <div className="tile-meta">Review items before checkout</div>
        </Link>
        <button
          type="button"
          className="account-tile"
          onClick={() => setActiveModal("addresses")}
        >
          <div className="tile-title">Addresses</div>
          <div className="tile-meta">Save delivery locations</div>
        </button>
        <button
          type="button"
          className="account-tile danger"
          onClick={() => setActiveModal("delete")}
        >
          <div className="tile-title">Delete account</div>
          <div className="tile-meta">Permanently remove your data</div>
        </button>
        <div className="account-tile">
          <div className="tile-title">Payments</div>
          <div className="tile-meta">Cards and UPI options</div>
          <div className="tile-note">Coming soon</div>
        </div>
        <Link to="/help" className="account-tile">
          <div className="tile-title">Help Center</div>
          <div className="tile-meta">FAQs and policies</div>
        </Link>
        <Link to="/support" className="account-tile">
          <div className="tile-title">Support Tickets</div>
          <div className="tile-meta">Create or track a ticket</div>
        </Link>
      </div>

      <div className="account-support-row">
        <div className="account-support-card">
          <div>
            <h3>Need help with an order?</h3>
            <p>Open a ticket and our team will get back quickly.</p>
          </div>
          <Link to="/support" className="account-link">
            Contact support
          </Link>
        </div>
      </div>

      {showAvatarPicker && (
        <div 
          className="account-modal-backdrop" 
          role="presentation" 
          onClick={() => setShowAvatarPicker(false)}
        >
          <div
            className="account-modal avatar-picker-modal"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="account-modal-header">
              <div>
                <span className="modal-kicker">Personalize</span>
                <h3>Choose your profile picture</h3>
              </div>
              <button 
                type="button" 
                className="account-modal-close" 
                onClick={() => setShowAvatarPicker(false)}
              >
                Close
              </button>
            </div>

            <div className="account-modal-body">
              <div className="avatar-picker-grid">
                {avatarOptions.map((avatar) => (
                  <button
                    key={avatar.id}
                    type="button"
                    className={`avatar-option ${
                      selectedAvatar === avatar.id ? "selected" : ""
                    }`}
                    onClick={() => selectAvatar(avatar.id)}
                    aria-pressed={selectedAvatar === avatar.id}
                  >
                    <span
                      className={`avatar-preset avatar-preset--${avatar.id}`}
                      aria-hidden="true"
                    />
                    <span className="avatar-option-label">{avatar.label}</span>
                  </button>
                ))}
              </div>

              <div className="avatar-upload-section">
                <div className="upload-divider">
                  <span>or</span>
                </div>
                <label htmlFor="custom-avatar-upload" className="avatar-upload-btn">
                  <i className="fas fa-cloud-upload-alt"></i>
                  Upload your own photo
                </label>
                <input
                  ref={fileInputRef}
                  id="custom-avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleCustomAvatarUpload}
                  className="sr-only"
                />
                <p className="upload-hint">Max 2MB • JPG, PNG, GIF</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeModal && (
        <div className="account-modal-backdrop" role="presentation" onClick={closeModal}>
          <div
            className="account-modal"
            role="dialog"
            aria-modal="true"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="account-modal-header">
              <div>
                <span className="modal-kicker">Account settings</span>
                <h3>
                  {activeModal === "profile" && "Personal information"}
                  {activeModal === "password" && "Password & security"}
                  {activeModal === "addresses" && "Saved addresses"}
                  {activeModal === "orders" && "Order history & tracking"}
                </h3>
              </div>
              <button type="button" className="account-modal-close" onClick={closeModal}>
                Close
              </button>
            </div>

            <div className="account-modal-body">
              {activeModal === "profile" && (
                <section className="account-panel">
                  <div className="panel-header">
                    <h3>Personal information</h3>
                    <span>Keep your details updated</span>
                  </div>
                  <form onSubmit={saveProfile} className="account-form">
                    <div className="form-row">
                      <label>
                        Full name
                        <input
                          type="text"
                          name="name"
                          value={profileForm.name}
                          onChange={handleProfileChange}
                        />
                      </label>
                      <label>
                        Email
                        <input
                          type="email"
                          name="email"
                          value={profileForm.email}
                          onChange={handleProfileChange}
                        />
                      </label>
                    </div>
                    <div className="form-row">
                      <label>
                        Phone
                        <input
                          type="tel"
                          name="phone"
                          value={profileForm.phone}
                          onChange={handleProfileChange}
                        />
                      </label>
                    </div>
                    <div className="form-actions">
                      <button type="submit" className="account-btn">
                        Save changes
                      </button>
                      {profileStatus && (
                        <span className={`form-status ${profileStatus.type}`}>
                          {profileStatus.message}
                        </span>
                      )}
                    </div>
                  </form>
                </section>
              )}

              {activeModal === "password" && (
                <section className="account-panel">
                  <div className="panel-header">
                    <h3>Password & security</h3>
                    <span>Update your password</span>
                  </div>
                  <form onSubmit={savePassword} className="account-form">
                    <div className="form-row">
                      <label>
                        Current password
                        <input
                          type="password"
                          name="currentPassword"
                          value={passwordForm.currentPassword}
                          onChange={handlePasswordChange}
                        />
                      </label>
                      <label>
                        New password
                        <input
                          type="password"
                          name="newPassword"
                          value={passwordForm.newPassword}
                          onChange={handlePasswordChange}
                        />
                      </label>
                      <label>
                        Confirm new password
                        <input
                          type="password"
                          name="confirmPassword"
                          value={passwordForm.confirmPassword}
                          onChange={handlePasswordChange}
                        />
                      </label>
                    </div>
                    <div className="form-actions">
                      <button type="submit" className="account-btn">
                        Update password
                      </button>
                      {passwordStatus && (
                        <span className={`form-status ${passwordStatus.type}`}>
                          {passwordStatus.message}
                        </span>
                      )}
                    </div>
                  </form>
                </section>
              )}

              {activeModal === "orders" && (
                <section className="account-panel">
                  <div className="panel-header">
                    <h3>Order history</h3>
                    <span>Track all your orders with live status</span>
                  </div>

                  {ordersStatus && (
                    <div className={`orders-status-message ${ordersStatus.type}`}>
                      {ordersStatus.message}
                    </div>
                  )}

                  {orderDeleteStatus && (
                    <div className={`orders-status-message ${orderDeleteStatus.type}`}>
                      {orderDeleteStatus.message}
                    </div>
                  )}

                  {orders.length === 0 ? (
                    <div className="orders-empty-state">
                      <p>No orders yet. Place your first order to see tracking here.</p>
                      <Link to="/" className="orders-start-link">
                        Start ordering
                      </Link>
                    </div>
                  ) : (
                    <div className="orders-list">
                      <div className="orders-list-header">
                        <Link to="/orders" className="view-all-orders-link">
                          View all orders page →
                        </Link>
                      </div>
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
                                    : stepNumber < currentStep || normalizedStatus === "delivered";
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

                            <div className="order-card-actions">
                              <Link to="/orders" className="order-view-btn">
                                <i className="fas fa-eye"></i> View in Orders Page
                              </Link>
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
                </section>
              )}

              {activeModal === "addresses" && (
                <section className="account-panel">
                  <div className="panel-header">
                    <h3>Saved addresses</h3>
                    <span>Manage delivery locations</span>
                  </div>
                  <div className="address-grid">
                    {addresses.length > 0 ? (
                      addresses.map((address) => (
                        <div key={address._id} className="address-card">
                          <div className="address-top">
                            <strong>{address.label || "Saved address"}</strong>
                            {address.isDefault && (
                              <span className="address-tag">Default</span>
                            )}
                          </div>
                          <p>
                            {address.line1}
                            {address.line2 ? `, ${address.line2}` : ""}
                          </p>
                          <p>
                            {address.city}
                            {address.state ? `, ${address.state}` : ""}
                            {address.postalCode ? ` ${address.postalCode}` : ""}
                          </p>
                          {address.phone && <p>Phone: {address.phone}</p>}
                          <div className="address-actions">
                            <button type="button" onClick={() => editAddress(address)}>
                              Edit
                            </button>
                            <button
                              type="button"
                              className="danger"
                              onClick={() => deleteAddress(address._id)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="address-empty">No saved addresses yet.</div>
                    )}
                  </div>

                  <form onSubmit={saveAddress} className="account-form address-form">
                    <div className="form-row">
                      <label>
                        Label
                        <input
                          type="text"
                          name="label"
                          placeholder="Home, Work, etc."
                          value={addressForm.label}
                          onChange={handleAddressChange}
                        />
                      </label>
                      <label>
                        Phone
                        <input
                          type="tel"
                          name="phone"
                          value={addressForm.phone}
                          onChange={handleAddressChange}
                        />
                      </label>
                    </div>
                    <div className="form-row">
                      <label className="full">
                        Address line 1
                        <input
                          type="text"
                          name="line1"
                          value={addressForm.line1}
                          onChange={handleAddressChange}
                          required
                        />
                      </label>
                    </div>
                    <div className="form-row">
                      <label className="full">
                        Address line 2
                        <input
                          type="text"
                          name="line2"
                          value={addressForm.line2}
                          onChange={handleAddressChange}
                        />
                      </label>
                    </div>
                    <div className="form-row">
                      <label>
                        City
                        <input
                          type="text"
                          name="city"
                          value={addressForm.city}
                          onChange={handleAddressChange}
                          required
                        />
                      </label>
                      <label>
                        State
                        <input
                          type="text"
                          name="state"
                          value={addressForm.state}
                          onChange={handleAddressChange}
                        />
                      </label>
                    </div>
                    <div className="form-row">
                      <label>
                        Postal code
                        <input
                          type="text"
                          name="postalCode"
                          value={addressForm.postalCode}
                          onChange={handleAddressChange}
                        />
                      </label>
                      <label>
                        Landmark
                        <input
                          type="text"
                          name="landmark"
                          value={addressForm.landmark}
                          onChange={handleAddressChange}
                        />
                      </label>
                    </div>
                    <div className="form-row">
                      <button
                        type="button"
                        className="account-btn ghost"
                        onClick={handlePostalLookup}
                        disabled={isPostalLoading}
                      >
                        {isPostalLoading ? "Searching..." : "Find by postal code"}
                      </button>
                      {postalStatus && (
                        <span className={`form-status ${postalStatus.type}`}>
                          {postalStatus.message}
                        </span>
                      )}
                    </div>
                    {postalOptions.length > 0 && (
                      <div className="postal-options">
                        {postalOptions.map((option) => (
                          <button
                            key={option.id}
                            type="button"
                            className="postal-option"
                            onClick={() => applyGeoSuggestion(option)}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    )}
                    <label className="checkbox-row">
                      <input
                        type="checkbox"
                        name="isDefault"
                        checked={addressForm.isDefault}
                        onChange={handleAddressChange}
                      />
                      Set as default
                    </label>
                    {(geoSuggestions.length > 0 || geoPoint) && (
                      <div className="geo-panel">
                        {geoSuggestions.length > 0 && (
                          <div className="geo-suggestions">
                            {geoSuggestions.map((suggestion) => (
                              <button
                                key={suggestion.id}
                                type="button"
                                className="geo-suggestion"
                                onClick={() => applyGeoSuggestion(suggestion)}
                              >
                                {suggestion.label}
                              </button>
                            ))}
                          </div>
                        )}
                        {geoPoint && (
                          <div className="geo-map">
                            <iframe
                              title="Current location"
                              src={`https://www.openstreetmap.org/export/embed.html?bbox=${
                                geoPoint.lon - 0.01
                              }%2C${geoPoint.lat - 0.01}%2C${
                                geoPoint.lon + 0.01
                              }%2C${geoPoint.lat + 0.01}&layer=mapnik&marker=${
                                geoPoint.lat
                              }%2C${geoPoint.lon}`}
                            />
                            <a
                              className="geo-link"
                              href={`https://www.openstreetmap.org/?mlat=${geoPoint.lat}&mlon=${geoPoint.lon}#map=17/${geoPoint.lat}/${geoPoint.lon}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Open map to adjust pin
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="form-actions">
                      <button
                        type="button"
                        className="account-btn ghost"
                        onClick={handleUseLocation}
                        disabled={isGeoLoading}
                      >
                        {isGeoLoading ? "Locating..." : "Use current location"}
                      </button>
                      <button type="submit" className="account-btn">
                        {editingAddressId ? "Update address" : "Add address"}
                      </button>
                      {editingAddressId && (
                        <button
                          type="button"
                          className="account-btn ghost"
                          onClick={resetAddressForm}
                        >
                          Cancel
                        </button>
                      )}
                      {geoStatus && (
                        <span className={`form-status ${geoStatus.type}`}>
                          {geoStatus.message}
                        </span>
                      )}
                      {addressStatus && (
                        <span className={`form-status ${addressStatus.type}`}>
                          {addressStatus.message}
                        </span>
                      )}
                    </div>
                  </form>
                </section>
              )}

              {activeModal === "delete" && (
                <section className="account-panel">
                  <div className="panel-header">
                    <h3>Delete account</h3>
                    <span>Permanent action</span>
                  </div>
                  <div className="danger-panel">
                    <p>
                      Deleting your account will remove your profile, saved
                      addresses, and order history. This action cannot be
                      undone.
                    </p>
                    <form onSubmit={handleDeleteAccount} className="account-form">
                      <label>
                        Type your email to confirm
                        <input
                          type="email"
                          value={deleteConfirm}
                          onChange={(event) => setDeleteConfirm(event.target.value)}
                          placeholder={user.email}
                          required
                        />
                      </label>
                      <div className="form-actions">
                        <button
                          type="submit"
                          className="account-btn danger"
                          disabled={deleteConfirm.trim() !== user.email}
                        >
                          Delete my account
                        </button>
                        {deleteStatus && (
                          <span className={`form-status ${deleteStatus.type}`}>
                            {deleteStatus.message}
                          </span>
                        )}
                      </div>
                    </form>
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      )}

      {pendingDeleteOrderId && (
        <div className="account-modal-backdrop" role="presentation" onClick={cancelDeleteOrder}>
          <div
            className="account-modal order-delete-confirm-modal"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="account-modal-header">
              <div>
                <span className="modal-kicker">Confirm action</span>
                <h3>Delete Order</h3>
              </div>
              <button type="button" className="account-modal-close" onClick={cancelDeleteOrder}>
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
                  <p className="warning-text">
                    This action cannot be undone.
                  </p>
                  <div className="delete-confirm-actions">
                    <button
                      type="button"
                      className="confirm-btn cancel"
                      onClick={cancelDeleteOrder}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="confirm-btn delete"
                      onClick={confirmDeleteOrder}
                    >
                      <i className="fas fa-trash-alt"></i> Yes, Delete Order
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

export default Account;
