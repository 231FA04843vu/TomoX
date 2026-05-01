# TomoCompanyAdmin - Admin Management Dashboard

Admin platform for managing the TomoApp ecosystem including vendors, promotions, announcements, and platform analytics.

## 📋 Project Overview

**TomoCompanyAdmin** provides administrative capabilities:

- 📊 Platform analytics and insights
- 🏪 Vendor management and approvals
- 🎟️ Coupon and promotion creation
- 📢 Announcement management
- 🖼️ Banner management
- 👥 User management
- 💰 Revenue and transaction tracking

## 🏗️ Project Structure

```
tomocompanyadmin/
├── src/
│   ├── pages/          # Dashboard, Vendors, Banners, Coupons
│   ├── components/     # Managers, Navbar, Sidebar
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── public/
├── .env.example
├── package.json
└── vite.config.js
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
```

## 📝 Environment Variables

```env
VITE_API=http://localhost:5000
```

## 🔐 Security

- Admin-only authentication
- Role-based access control
- Session management

---

**Deployed on:** Netlify
