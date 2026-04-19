# Performance Optimization Checklist & Best Practices

## Quick Start Guide

### For Developers
This document provides a checklist of optimization techniques applied to TomoApp and guidelines for maintaining and enhancing performance.

---

## Optimization Summary

### What Was Done ✅

#### 1. React Component Optimizations
- ✅ `App.jsx` - Lazy loading routes, memoized search calculations, debounced search
- ✅ `Header.jsx` - React.memo, useCallback for handlers
- ✅ `RestaurantCard.jsx` - React.memo, useCallback, lazy image loading
- ✅ `SearchResultsModal.jsx` - React.memo, useCallback
- ✅ `BannerSlider.jsx` - React.memo, useCallback for slide changes
- ✅ `CategoryShortcuts.jsx` - React.memo, useCallback for category clicks
- ✅ `Footer.jsx` - React.memo (static content)

#### 2. Build Optimization (Vite)
- ✅ Code minification with Terser
- ✅ Intelligent chunk splitting (vendor, socket, ui)
- ✅ CSS code splitting per route
- ✅ ES-Next target for modern browsers
- ✅ Source maps disabled in production

#### 3. CSS Performance
- ✅ Reduced animation times (0.35s → 0.2s)
- ✅ CSS containment (layout, strict, paint, content)
- ✅ Will-change hints on animations
- ✅ Font smoothing for better rendering
- ✅ Container queries ready

#### 4. Browser & Network
- ✅ Image lazy loading
- ✅ Parallel API requests
- ✅ Request timeout handling
- ✅ Error boundaries for failed images

---

## Maintenance Checklist

### Before Adding New Features ✅
- [ ] Wrap new top-level components with `React.memo()`
- [ ] Use `useCallback` for event handlers passed as props
- [ ] Use `useMemo` for expensive computed values
- [ ] Check if new routes should be lazy-loaded
- [ ] Add `loading="lazy"` to images
- [ ] Test Performance in Chrome DevTools Lighthouse
- [ ] Monitor bundle size impact

### Image & Asset Handling ✅
- [ ] Always add `alt` text to images
- [ ] Add `loading="lazy"` attribute to off-screen images
- [ ] Implement error handler for image failures
- [ ] Consider image format (WebP for modern browsers)
- [ ] Compress images before adding to repo

### Component Best Practices ✅
```javascript
// ✅ DO: Use memo for components with frequent parent rerenders
const MyComponent = memo(function MyComponent({ prop1, prop2 }) {
  const handleClick = useCallback(() => {
    // handler logic
  }, [dependencies]);

  const memoValue = useMemo(() => {
    // expensive calculation
  }, [dependencies]);

  return <div onClick={handleClick}>{memoValue}</div>;
});

// ❌ DON'T: Create handlers inline
function BadComponent({ onUpdate }) {
  return <button onClick={() => onUpdate()}>Click</button>; // Creates new function each render
}
```

### SearchBar & Filter Optimization ✅
```javascript
// ✅ DO: Debounce search input
const debouncedValue = useDebounce(searchQuery, 200);

// ❌ DON'T: Filter on every keystroke
const results = items.filter(item => 
  item.name.includes(searchQuery) // Runs on every keystroke!
);
```

---

## Performance Monitoring Checklist

### Weekly Performance Review
- [ ] Run Lighthouse audit on homepage
- [ ] Check Core Web Vitals in Chrome DevTools
- [ ] Monitor Time to Interactive (TTI)
- [ ] Check bundle size with `npm run build`
- [ ] Test slow network 3G in DevTools

### Monthly Deep Dive
- [ ] Analyze Performance profile in DevTools
- [ ] Check for memory leaks with DevTools
- [ ] Review React DevTools Profiler for slow renders
- [ ] Check image loading waterfall
- [ ] Verify all chunks are properly split

### Key Metrics to Track
| Metric | Target | Current |
|--------|--------|---------|
| First Contentful Paint (FCP) | < 2s | TBD |
| Largest Contentful Paint (LCP) | < 2.5s | TBD |
| Cumulative Layout Shift (CLS) | < 0.1 | TBD |
| Time to Interactive (TTI) | < 3.5s | TBD |
| Bundle Size | < 300KB gzip | TBD |
| Lighthouse Score | > 85 | TBD |

---

## Common Performance Issues & Solutions

### Issue 1: Component Re-renders Excessively
**Symptoms**: Jank when scrolling, slow interactions
**Solution**:
```javascript
// Wrap with memo
const Card = memo(function Card({ data }) {
  return <div>{data.name}</div>;
});
```

### Issue 2: Search is Laggy
**Symptoms**: App freezes while typing in search
**Solution**:
```javascript
// Use debounce
const debouncedSearchQuery = useDebounce(searchQuery, 200);
```

### Issue 3: Long List is Slow to Render
**Symptoms**: Page freeze when rendering 100+ items
**Solution**:
```javascript
// Use CSS containment on parent
.restaurant-section {
  contain: layout;
}

// Or implement virtual scrolling for truly large lists
// (Future optimization)
```

### Issue 4: Animations Cause Jank
**Symptoms**: Choppy animations, especially on scroll
**Solution**:
```css
/* Add will-change to animated elements */
.animated-element {
  will-change: transform;
  transition: transform 0.2s ease;
}

/* Use CSS containment */
contain: layout style paint;
```

### Issue 5: Large Bundle Size
**Symptoms**: Slow initial page load
**Solution**: 
- Already implemented lazy loading for routes
- Already implemented code chunking
- Monitor bundle with `npm run build`

---

## Testing Performance Improvements

### Before & After Testing
```bash
# Build production version
npm run build

# Check bundle size
ls -lh dist/assets/

# Run lighthouse locally
# Chrome DevTools → Lighthouse tab → Analyze page load
```

### React DevTools Profiler
1. Install React DevTools Chrome extension
2. Open DevTools → Profiler tab
3. Record interactions
4. Identify slow components (yellow/red bars)
5. Wrap with memo or memoize internal expensive ops

### Chrome DevTools Performance Tab
1. Open DevTools → Performance tab
2. Record interactions
3. Look for long tasks (> 50ms)
4. Check FCP, LCP, CLS metrics
5. Verify CSS containment helps with paint time

---

## Future Optimization Opportunities

### Priority 1 (High Impact)
- [ ] Implement virtual scrolling for restaurant lists
- [ ] Add pagination to search results (limit to 20 items)
- [ ] Compress all images to WebP format
- [ ] Implement service worker for offline support
- [ ] Add cache headers on CDN

### Priority 2 (Medium Impact)
- [ ] Replace Swiper with lighter carousel library
- [ ] Implement intersection observer for lazy loaded sections
- [ ] Add request caching with React Query or SWR
- [ ] Separate critical CSS (inline)
- [ ] Implement progressive image loading

### Priority 3 (Polish)
- [ ] Add performance monitoring (Sentry/DataDog)
- [ ] Implement error boundary performance tracking
- [ ] Add Google Analytics performance events
- [ ] Create internal performance dashboard

---

## Common Commands

```bash
# Run dev server
npm run dev

# Build for production
npm run build

# Check bundle size
npm run build -- --visualizer

# Run linter
npm run lint

# Preview production build
npm run preview

# Analyze bundle
npx esbuild-visualizer dist/assets/*.js
```

---

## Resources

### Performance Tools
- [Chrome DevTools Performance Tab](https://developer.chrome.com/docs/devtools/performance/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [React DevTools Profiler](https://react.dev/reference/react/Profiler)
- [Web.dev Metrics](https://web.dev/metrics/)

### Learning Resources
- [React Performance Optimization](https://react.dev/reference/react/memo)
- [CSS Containment](https://developer.mozilla.org/en-US/docs/Web/CSS/contain)
- [Vite Optimization Guide](https://vitejs.dev/guide/build.html)

---

## Quick Reference

### Optimization Functions to Use
```javascript
// Memoize component
import { memo } from 'react';
const MyComponent = memo(Component);

// Memoize function
import { useCallback } from 'react';
const handleClick = useCallback(() => {}, [deps]);

// Memoize value
import { useMemo } from 'react';
const value = useMemo(() => expensive(), [deps]);

// Debounce input
import { useEffect, useState } from 'react';
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};
```

---

## Questions or Issues?

If performance regressions occur:
1. Check Git diff for recent changes
2. Run Lighthouse audit to identify issue
3. Use DevTools Profiler to find bottleneck
4. Revert changes and test
5. Re-implement more carefully with proper memoization

---

**Last Updated**: February 19, 2026
**Performance Baseline**: See PERFORMANCE_OPTIMIZATIONS.md for metrics
