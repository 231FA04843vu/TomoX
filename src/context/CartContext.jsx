import React, { createContext, useContext, useEffect, useReducer, useState, useMemo } from 'react';

const API_COMPANY = import.meta.env.VITE_API_COMPANY;
const CART_STORAGE_KEY = 'tomo.cart.v1';

// ✅ Create Context
const CartContext = createContext();

// ✅ Initial State
const initialState = {
  items: [],
};

const getItemKey = (item) => {
  // Check itemId first (our custom ID), then fall back to _id or id
  const key = item?.itemId || item?._id || item?.id;
  if (!key) {
    console.warn("Item missing ID (itemId, _id, or id):", item);
  }
  return key ? String(key) : null;
};

const normalizeCartItems = (items) => {
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => {
      const itemId = getItemKey(item);
      if (!itemId) return null;
      const quantity = Number(item?.quantity || 1);
      return {
        ...item,
        itemId,
        quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 1,
      };
    })
    .filter(Boolean);
};

// ✅ Reducer
const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const item = action.payload;
      const itemKey = getItemKey(item);
      if (!itemKey) return state;
      const existing = state.items.find((i) => getItemKey(i) === itemKey);
      if (existing) {
        // If item exists, increment quantity
        return {
          ...state,
          items: state.items.map((i) =>
            getItemKey(i) === itemKey
              ? { ...i, quantity: i.quantity + 1, itemId: itemKey }
              : i
          ),
        };
      }
      // If new item, add with quantity 1
      return {
        ...state,
        items: [...state.items, { ...item, itemId: itemKey, quantity: 1 }],
      };
    }
    case 'INCREMENT':
      return {
        ...state,
        items: state.items.map((i) =>
          getItemKey(i) === action.payload
            ? { ...i, quantity: i.quantity + 1, itemId: getItemKey(i) }
            : i
        ),
      };
    case 'DECREMENT':
      return {
        ...state,
        items: state.items.map((i) =>
          getItemKey(i) === action.payload
            ? {
                ...i,
                quantity: Math.max(1, i.quantity - 1),
                itemId: getItemKey(i),
              }
            : i
        ),
      };
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter((i) => getItemKey(i) !== action.payload),
      };
    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
      };
    case 'SET_CART':
      return {
        ...state,
        items: normalizeCartItems(action.payload),
      };
    default:
      return state;
  }
};

const loadLocalCart = () => {
  try {
    // Only load cart if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      // Clear stale cart data if no active session
      localStorage.removeItem(CART_STORAGE_KEY);
      return [];
    }
    
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return normalizeCartItems(parsed);
  } catch {
    return [];
  }
};

// ✅ Provider Component
export const CartProvider = ({ children }) => {
  const [cart, dispatch] = useReducer(
    cartReducer,
    initialState,
    (state) => ({ ...state, items: loadLocalCart() })
  );
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(normalizeCartItems(cart.items)));
    } catch {
      // Ignore storage errors
    }
  }, [cart.items]);

  useEffect(() => {
    if (!hydrated) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    // Only sync on mount/hydration to fetch server cart
    const fetchServerCart = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout
        
        const response = await fetch(`${API_COMPANY}/api/me/cart`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        const data = await response.json();
        const serverItems = Array.isArray(data.items) ? data.items : [];

        // Only update if local cart is empty and server has items
        if (cart.items.length === 0 && serverItems.length > 0) {
          dispatch({ type: 'SET_CART', payload: serverItems });
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Cart fetch error:', err);
        }
      }
    };

    fetchServerCart();
  }, [hydrated]); // Only run on hydration, not on cart changes

  // Separate effect to sync cart changes to server - OPTIMIZED with longer debounce
  useEffect(() => {
    if (!hydrated) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    // Debounce with 2 seconds to prevent excessive API calls
    const debounceTimeoutId = setTimeout(async () => {
      try {
        const controller = new AbortController();
        const abortTimeoutId = setTimeout(() => controller.abort(), 5000);
        
        const updateResponse = await fetch(`${API_COMPANY}/api/me/cart`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ items: normalizeCartItems(cart.items) }),
          signal: controller.signal,
        });
        
        clearTimeout(abortTimeoutId);
        
        if (!updateResponse.ok) {
          const errorData = await updateResponse.json();
          console.error('Cart update failed:', errorData);
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Cart sync error:', err);
        }
      }
    }, 2000); // Increased to 2 seconds to reduce API calls and improve performance

    return () => clearTimeout(debounceTimeoutId);
  }, [cart.items, hydrated]);

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key !== CART_STORAGE_KEY) return;
      if (!event.newValue) {
        dispatch({ type: 'SET_CART', payload: [] });
        return;
      }
      try {
        const items = JSON.parse(event.newValue);
        dispatch({ type: 'SET_CART', payload: items });
      } catch {
        // Ignore parse errors
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  useEffect(() => {
    const handleCartEvent = (event) => {
      if (Array.isArray(event.detail)) {
        dispatch({ type: 'SET_CART', payload: event.detail });
      }
    };
    window.addEventListener('tomo:cart', handleCartEvent);
    return () => window.removeEventListener('tomo:cart', handleCartEvent);
  }, []);

  // OPTIMIZED: Throttled cart refresh - only refresh on auth changes, not on every focus
  useEffect(() => {
    let lastRefreshTime = 0;
    const REFRESH_COOLDOWN = 30000; // 30 seconds minimum between refreshes
    
    const refreshCart = () => {
      const now = Date.now();
      // Throttle: Skip if refreshed recently
      if (now - lastRefreshTime < REFRESH_COOLDOWN) return;
      
      const token = localStorage.getItem('token');
      if (!token) return;
      
      lastRefreshTime = now;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      fetch(`${API_COMPANY}/api/me/cart`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      })
        .then((res) => res.json())
        .then((data) => {
          clearTimeout(timeoutId);
          if (Array.isArray(data.items)) {
            dispatch({ type: 'SET_CART', payload: data.items });
          }
        })
        .catch((err) => {
          clearTimeout(timeoutId);
          if (err.name !== 'AbortError') {
            console.error('Cart refresh error:', err);
          }
        });
    };

    // Only refresh on auth changes, not on focus/visibility (reduces polling)
    const handleAuth = () => refreshCart();

    window.addEventListener('tomo:auth', handleAuth);

    return () => {
      window.removeEventListener('tomo:auth', handleAuth);
    };
  }, []);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({ cart, dispatch }), [cart, dispatch]);

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

// ✅ Custom Hook (Declare AFTER context)
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
