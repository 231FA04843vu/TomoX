import React, { useCallback, useEffect, useState, useMemo, lazy, Suspense } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";

import Header from "./components/Header";
import Footer from "./components/Footer";
import BannerSlider from "./components/BannerSlider";
import CategoryShortcuts from "./components/CategoryShortcuts";
import RestaurantCard from "./components/RestaurantCard";
import RestaurantMenu from "./components/RestaurantMenu";
import SupportForm from "./components/SupportForm";
import SupportViewer from "./components/SupportViewer";
import SearchResultsModal from "./components/SearchResultsModal";
import PageLoader from "./components/PageLoader";
import Cart from "./pages/Cart";
import Help from "./pages/Help";
import Account from "./pages/Account";
import Offers from "./pages/Offers";
import { normalizeAssetUrl } from "./utils/url";

// Lazy load less critical routes with prefetching hints
const Checkout = lazy(() => import(/* webpackPrefetch: true */ "./pages/Checkout"));
const Auth = lazy(() => import("./pages/Auth"));
const Orders = lazy(() => import("./pages/Orders"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));

import "./index.css";

const API_COMPANY = import.meta.env.VITE_API_COMPANY;
const USER_STORAGE_KEY = "tomo.user.v1";

// Debounce hook for search
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

const normalizeRestaurantPayload = (restaurant) => ({
  ...restaurant,
  logo: normalizeAssetUrl(restaurant?.logo),
  menu: Array.isArray(restaurant?.menu)
    ? restaurant.menu.map((item) => ({
        ...item,
        image: normalizeAssetUrl(item?.image),
      }))
    : restaurant?.menu,
});

function App() {
  const [restaurants, setRestaurants] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [banners, setBanners] = useState([]);
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 200); // Debounce search with 200ms delay
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  const readCachedUser = () => {
    try {
      const raw = localStorage.getItem(USER_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  const persistUser = useCallback((nextUser) => {
    try {
      if (nextUser) {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
      } else {
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  const refreshUser = useCallback(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout
    
    fetch(`${API_COMPANY}/api/me`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data) => {
        clearTimeout(timeoutId);
        if (data.user) {
          setUser(data.user);
          persistUser(data.user);
        }
      })
      .catch((err) => {
        clearTimeout(timeoutId);
        if (err.name !== 'AbortError') {
          console.error('Failed to refresh user:', err);
        }
      });
  }, [persistUser]);



  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);

      const dataPromise = Promise.all([
        fetch(`${API_COMPANY}/api/restaurants`).then((res) => res.json()),
        fetch(`${API_COMPANY}/api/coupons/active`).then((res) => res.json()),
        fetch(`${API_COMPANY}/api/banners`).then((res) => res.json()),
      ]);

      try {
        const data = await dataPromise;

        const [restaurantsData, couponsData, bannersData] = data;
        setRestaurants(
          Array.isArray(restaurantsData)
            ? restaurantsData.map(normalizeRestaurantPayload)
            : []
        );
        setCoupons(Array.isArray(couponsData) ? couponsData : []);
        setBanners(Array.isArray(bannersData) ? bannersData : []);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const cached = readCachedUser();
    if (cached) setUser(cached);
    refreshUser();
  }, [refreshUser]);



  // OPTIMIZED: Throttled user refresh to prevent excessive API calls
  useEffect(() => {
    let lastRefreshTime = 0;
    const REFRESH_COOLDOWN = 60000; // 60 seconds minimum between refreshes
    
    const handleFocus = () => {
      const now = Date.now();
      if (now - lastRefreshTime < REFRESH_COOLDOWN) return;
      lastRefreshTime = now;
      refreshUser();
    };
    
    const handleVisibility = () => {
      if (document.visibilityState !== "visible") return;
      const now = Date.now();
      if (now - lastRefreshTime < REFRESH_COOLDOWN) return;
      lastRefreshTime = now;
      refreshUser();
    };
    
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [refreshUser]);

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key !== USER_STORAGE_KEY) return;
      if (!event.newValue) {
        setUser(null);
        return;
      }
      try {
        const nextUser = JSON.parse(event.newValue);
        setUser(nextUser);
      } catch {
        // Ignore parse errors
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => {
    persistUser(user);
    window.dispatchEvent(new CustomEvent("tomo:auth", { detail: { user } }));
  }, [persistUser, user]);

  // OPTIMIZED: Lazy load socket.io only when user is logged in
  useEffect(() => {
    if (!user?._id) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    // Lazy load socket.io to reduce initial bundle size
    let socket;
    import("socket.io-client").then(({ io }) => {
      socket = io(API_COMPANY, {
        auth: { token },
      });

      socket.on("user:update", (payload) => {
        if (payload?.user) {
          setUser(payload.user);
          persistUser(payload.user);
        }
      });

      socket.on("cart:update", (payload) => {
        if (Array.isArray(payload?.items)) {
          window.dispatchEvent(
            new CustomEvent("tomo:cart", { detail: payload.items })
          );
        }
      });

      socket.on("order-status-updated", (payload) => {
        if (payload?.orderId && payload?.status) {
          window.dispatchEvent(
            new CustomEvent("tomo:order-status", { detail: payload })
          );
        }
      });
    });

    return () => {
      if (socket) socket.disconnect();
    };
  }, [persistUser, user?._id]);

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname]);

  useEffect(() => {
    if (location.pathname !== "/" && searchQuery) {
      setSearchQuery("");
    }
  }, [location.pathname, searchQuery]);

  // Memoized search meta extraction
  const parsePriceLimit = useCallback((query) => {
    if (!query) return null;
    const limitMatch = query.match(
      /(under|below|less than|<=|<)\s*₹?\s*(\d+)/
    );
    if (limitMatch) return Number(limitMatch[2]);

    if (/cheap|budget|low cost|low-price|low price/.test(query)) {
      return 200;
    }

    return null;
  }, []);

  const buildSearchMeta = useCallback((query) => {
    const hasNonVeg = /non[-\s]?veg|chicken|mutton|fish|prawn|egg|beef|pork/.test(
      query
    );
    const hasVeg = !hasNonVeg && /\bveg\b|vegetarian|paneer|aloo|mushroom|dal/.test(query);
    const hasSnacks = /snack|snacks|starter|chaat|roll|wrap/.test(query);
    const hasLunch = /lunch|meal|thali|combo/.test(query);
    const hasBreakfast = /breakfast|idli|dosa|poha|upma|paratha/.test(query);
    const hasDinner = /dinner/.test(query);
    const hasDessert = /dessert|sweet|ice\s?cream|cake|brownie/.test(query);
    const hasBeverage = /drink|juice|shake|coffee|tea/.test(query);

    return {
      hasNonVeg,
      hasVeg,
      hasSnacks,
      hasLunch,
      hasBreakfast,
      hasDinner,
      hasDessert,
      hasBeverage,
      maxPrice: parsePriceLimit(query),
    };
  }, [parsePriceLimit]);

  // Memoized search processing
  const { normalizedQuery, searchMeta, queryTokens } = useMemo(() => {
    const normalized = debouncedSearchQuery.trim().toLowerCase();
    const tokens = normalized.split(/\s+/).filter(Boolean);
    const meta = buildSearchMeta(normalized);
    return { normalizedQuery: normalized, searchMeta: meta, queryTokens: tokens };
  }, [debouncedSearchQuery, buildSearchMeta]);

  const isSearching = location.pathname === "/" && normalizedQuery.length > 0;
  const isHomePage = location.pathname === "/";
  const showPageBackButton =
    location.pathname !== "/" && location.pathname !== "/sign-in";

  const keywordMatch = useCallback((text) =>
    queryTokens.length === 0
      ? false
      : queryTokens.some((token) => text.includes(token)),
    [queryTokens]
  );

  const nonVegKeywords = useMemo(() => [
    "chicken",
    "mutton",
    "fish",
    "prawn",
    "egg",
    "beef",
    "pork",
    "kebab",
    "kfc",
  ], []);

  const vegKeywords = useMemo(() => [
    "veg",
    "vegetarian",
    "paneer",
    "aloo",
    "mushroom",
    "dal",
    "palak",
  ], []);

  const categoryKeywords = useMemo(() => ({
    snacks: [
      "snack",
      "snacks",
      "starter",
      "chaat",
      "roll",
      "wrap",
      "burger",
      "burgers",
      "pizza",
      "pizzas",
      "kfc",
    ],
    lunch: ["lunch", "meal", "thali", "combo"],
    breakfast: ["breakfast", "idli", "dosa", "poha", "upma", "paratha"],
    dinner: ["dinner"],
    dessert: ["dessert", "sweet", "ice cream", "cake", "brownie"],
    beverage: ["drink", "juice", "shake", "coffee", "tea"],
  }), []);

  const matchesCategoryKeywords = useCallback((text, keywords) =>
    keywords.some((keyword) => text.includes(keyword)),
    []
  );

  const matchItem = useCallback((item, restaurant) => {
    const itemText = `${item?.name || ""} ${item?.description || ""} ${
      restaurant?.name || ""
    } ${Array.isArray(restaurant?.cuisine) ? restaurant.cuisine.join(" ") : ""}`
      .toLowerCase()
      .trim();

    const matchesTokens = keywordMatch(itemText);

    let matchesCategory = false;
    if (searchMeta.hasNonVeg) {
      matchesCategory = matchesCategoryKeywords(itemText, nonVegKeywords);
    }
    if (searchMeta.hasVeg) {
      const hasNonVegTag = matchesCategoryKeywords(itemText, nonVegKeywords);
      const hasVegTag = matchesCategoryKeywords(itemText, vegKeywords);
      matchesCategory = matchesCategory || (hasVegTag || !hasNonVegTag);
    }
    if (searchMeta.hasSnacks) {
      matchesCategory =
        matchesCategory ||
        matchesCategoryKeywords(itemText, categoryKeywords.snacks);
    }
    if (searchMeta.hasLunch) {
      matchesCategory =
        matchesCategory || matchesCategoryKeywords(itemText, categoryKeywords.lunch);
    }
    if (searchMeta.hasBreakfast) {
      matchesCategory =
        matchesCategory ||
        matchesCategoryKeywords(itemText, categoryKeywords.breakfast);
    }
    if (searchMeta.hasDinner) {
      matchesCategory =
        matchesCategory || matchesCategoryKeywords(itemText, categoryKeywords.dinner);
    }
    if (searchMeta.hasDessert) {
      matchesCategory =
        matchesCategory ||
        matchesCategoryKeywords(itemText, categoryKeywords.dessert);
    }
    if (searchMeta.hasBeverage) {
      matchesCategory =
        matchesCategory ||
        matchesCategoryKeywords(itemText, categoryKeywords.beverage);
    }

    const hasCategoryFilter =
      searchMeta.hasNonVeg ||
      searchMeta.hasVeg ||
      searchMeta.hasSnacks ||
      searchMeta.hasLunch ||
      searchMeta.hasBreakfast ||
      searchMeta.hasDinner ||
      searchMeta.hasDessert ||
      searchMeta.hasBeverage;

    const priceMatch = searchMeta.maxPrice
      ? Number(item?.price || 0) <= searchMeta.maxPrice
      : true;

    const matchesFilter = hasCategoryFilter
      ? matchesCategory
      : Boolean(searchMeta.maxPrice);

    return (matchesTokens || matchesFilter) && priceMatch;
  }, [searchMeta, keywordMatch, matchesCategoryKeywords, nonVegKeywords, vegKeywords, categoryKeywords]);

  // Memoized filtering results
  const { filteredRestaurants, matchingItems } = useMemo(() => {
    if (!isHomePage) {
      return { filteredRestaurants: restaurants, matchingItems: [] };
    }

    const items = [];
    const itemKeys = new Set();

    const filtered = normalizedQuery
      ? restaurants.filter((res) => {
          const cuisineText = Array.isArray(res?.cuisine)
            ? res.cuisine.join(" ")
            : String(res?.cuisine || "");
          const combined = `${res?.name || ""} ${cuisineText} ${res?.location || ""}`
            .toLowerCase()
            .trim();

          const matchesTokens = keywordMatch(combined);
          let itemMatch = false;

          if (Array.isArray(res?.menu)) {
            res.menu.forEach((item) => {
              if (!item) return;
              if (matchItem(item, res)) {
                itemMatch = true;
                const key = `${res?._id || res?.name}-${item?.id || item?._id || item?.name}`;
                if (!itemKeys.has(key)) {
                  itemKeys.add(key);
                  items.push({
                    ...item,
                    restaurantName: res?.name,
                    restaurantId: res?._id,
                  });
                }
              }
            });
          }

          const cuisineMatch = keywordMatch(cuisineText.toLowerCase());
          return matchesTokens || cuisineMatch || itemMatch;
        })
      : restaurants;

    return { filteredRestaurants: filtered, matchingItems: items };
  }, [restaurants, normalizedQuery, keywordMatch, matchItem, isHomePage]);

  const buildSuggestions = useCallback((list, query) => {
    const items = [];
    const seen = new Set();

    const pushItem = (label, type) => {
      const key = `${type}:${label}`;
      if (!label || seen.has(key)) return;
      seen.add(key);
      items.push({ label, type });
    };

    if (query) {
      list.forEach((res) => {
        const name = String(res?.name || "");
        const cuisine = Array.isArray(res?.cuisine)
          ? res.cuisine.join(" ")
          : String(res?.cuisine || "");
        const locationText = String(res?.location || "");

        if (name.toLowerCase().includes(query)) pushItem(name, "Restaurant");
        if (cuisine.toLowerCase().includes(query)) pushItem(cuisine, "Cuisine");
        if (locationText.toLowerCase().includes(query))
          pushItem(locationText, "Area");

        if (Array.isArray(res?.menu)) {
          res.menu.forEach((item) => {
            if (!item) return;
            const itemName = String(item?.name || "");
            if (itemName.toLowerCase().includes(query)) {
              pushItem(itemName, "Item");
            }
          });
        }
      });
    }

    [
      "Veg",
      "Non-Veg",
      "Snacks",
      "Pizzas",
      "Burgers",
      "KFC Foods",
      "Lunch",
      "Breakfast",
      "Dinner",
      "Dessert",
      "Beverages",
      "Low cost",
      "Under 200",
    ].forEach((label) => pushItem(label, "Category"));

    if (items.length < 8) {
      const cuisines = list
        .map((res) =>
          Array.isArray(res?.cuisine)
            ? res.cuisine.join(" ")
            : String(res?.cuisine || "").trim()
        )
        .filter(Boolean);
      const locations = list
        .map((res) => String(res?.location || "").trim())
        .filter(Boolean);

      cuisines.slice(0, 4).forEach((cuisine) => pushItem(cuisine, "Cuisine"));
      locations.slice(0, 4).forEach((area) => pushItem(area, "Area"));
    }

    return items.slice(0, 8);
  }, []);

  const buildOffers = useCallback((couponList) => {
    return couponList.slice(0, 6).map((coupon, index) => {
      const isPercent = coupon.discountType === "percentage";
      const value = Number(coupon.discountValue || 0);
      const discountText = isPercent ? `${value}% OFF` : `₹${value} OFF`;
      const minOrderText = Number(coupon.minOrderAmount || 0) > 0
        ? ` • Min ₹${Number(coupon.minOrderAmount)}`
        : "";

      return {
        id: coupon._id || `coupon-${index}`,
        title: `${coupon.code} • ${discountText}`,
        subtitle: coupon.description || `Apply code ${coupon.code}${minOrderText}`,
        imageUrl: null,
      };
    });
  }, []);

  const suggestions = useMemo(
    () => (isSearching ? buildSuggestions(restaurants, normalizedQuery) : []),
    [isSearching, restaurants, normalizedQuery, buildSuggestions]
  );
  const offers = useMemo(
    () => (isSearching ? buildOffers(coupons) : []),
    [isSearching, coupons, buildOffers]
  );
  const homeSliderItems = useMemo(() => {
    if (Array.isArray(banners) && banners.length > 0) {
      return banners;
    }
    return coupons;
  }, [banners, coupons]);

  return (
    <div className="app-container">
      {/* Coupon Announcement Banner */}
      {coupons.length > 0 && location.pathname === "/" && (
        <div className="stunning-announcement-banner">
          <div className="announcement-shine"></div>
          <div className="announcement-ticker">
            <div className="announcement-track">
              {coupons.map((coupon, index) => {
                const discount = coupon.discountType === "percentage"
                  ? `${coupon.discountValue}% OFF`
                  : `₹${coupon.discountValue} OFF`;

                return (
                  <div key={coupon._id || index} className="announcement-item">
                    <div className="announcement-custom-icon icon-sale">
                      <span className="icon-inner"></span>
                    </div>
                    <span className="announcement-title">{coupon.code}</span>
                    <span className="announcement-separator">•</span>
                    <span className="announcement-message">
                      {coupon.description || discount}
                    </span>
                  </div>
                );
              })}
              {coupons.map((coupon, index) => {
                const discount = coupon.discountType === "percentage"
                  ? `${coupon.discountValue}% OFF`
                  : `₹${coupon.discountValue} OFF`;

                return (
                  <div key={`dup-${coupon._id || index}`} className="announcement-item">
                    <div className="announcement-custom-icon icon-sale">
                      <span className="icon-inner"></span>
                    </div>
                    <span className="announcement-title">{coupon.code}</span>
                    <span className="announcement-separator">•</span>
                    <span className="announcement-message">
                      {coupon.description || discount}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {isHomePage && (
        <Header
          user={user}
          onLogout={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("tomo.cart.v1");
            setUser(null);
          }}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      )}

      {showPageBackButton && (
        <div className="page-top-effect">
          <button
            type="button"
            className="back-button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            Back
          </button>
        </div>
      )}

      <SearchResultsModal
        isOpen={isSearching}
        query={searchQuery.trim()}
        suggestions={suggestions}
        restaurants={filteredRestaurants}
        items={matchingItems}
        offers={offers}
        onClose={() => setSearchQuery("")}
        onSuggestionClick={(value) => setSearchQuery(value)}
      />

      <Routes>
        <Route
          path="/"
          element={
            <>
              {isLoading ? (
                <PageLoader />
              ) : !isSearching ? (
                <>
                  <CategoryShortcuts />
                  <BannerSlider offers={homeSliderItems} />
                  <div className="restaurant-section">
                    {filteredRestaurants.map((res) => (
                      <RestaurantCard
                        key={res._id}
                        restaurant={res}
                        user={user}
                      />
                    ))}
                    {filteredRestaurants.length === 0 && (
                      <div className="restaurant-empty">
                        No restaurants match your search.
                      </div>
                    )}
                  </div>
                </>
              ) : null}
            </>
          }
        />
        <Route
          path="/restaurant/:id"
          element={<RestaurantMenu user={user} />}
        />
        {user && (
          <>
            <Route
              path="/cart"
              element={<Cart user={user} />}
            />
            <Route
              path="/checkout"
              element={
                <Suspense fallback={<PageLoader />}>
                  <Checkout user={user} />
                </Suspense>
              }
            />
          </>
        )}
        <Route
          path="/help"
          element={<Help user={user} />}
        />
        <Route
          path="/offers"
          element={<Offers />}
        />
        <Route
          path="/account"
          element={<Account user={user} onUserUpdate={setUser} />}
        />
        <Route
          path="/orders"
          element={
            <Suspense fallback={<PageLoader />}>
              <Orders user={user} />
            </Suspense>
          }
        />
        <Route
          path="/terms"
          element={
            <Suspense fallback={<PageLoader />}>
              <Terms />
            </Suspense>
          }
        />
        <Route
          path="/privacy"
          element={
            <Suspense fallback={<PageLoader />}>
              <Privacy />
            </Suspense>
          }
        />
        <Route path="/support" element={<SupportForm />} />
        <Route path="/company/support" element={<SupportViewer />} />
        <Route
          path="/sign-in"
          element={
            <Suspense fallback={<PageLoader />}>
              <Auth onAuth={setUser} />
            </Suspense>
          }
        />
        <Route
          path="*"
          element={
            <div style={{ padding: "100px", textAlign: "center" }}>
              <h1>404 - Page Not Found</h1>
              <p>The page you are looking for does not exist.</p>
            </div>
          }
        />
      </Routes>

      <Footer />
    </div>
  );
}

export default App;
