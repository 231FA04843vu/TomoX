# TomoVendor - Restaurant/Vendor Management Portal

A React-based dashboard for restaurant vendors to manage their operations, orders, menu items, and performance analytics.

## 📋 Project Overview

**TomoVendor** empowers restaurant partners with:

- 📊 Real-time order dashboard
- 🍽️ Menu management and pricing
- 📈 Analytics and performance metrics
- 👤 Vendor profile management
- 🔐 Order preparation workflow
- 💬 Communication with customers
- ⚙️ Restaurant settings and preferences

## 🏗️ Project Structure

```
tomovendor/
├── src/
│   ├── pages/          # Dashboard, Orders, Menu, Analytics, Profile
│   ├── components/     # Sidebar, Topbar, Toast notifications
│   ├── layouts/        # Portal layout
│   ├── services/       # API integration
│   ├── App.jsx
│   └── main.jsx
├── public/
├── .env
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

## 🎯 Key Features

### Order Management
- View incoming orders in real-time
- Update order status (Preparing → Ready → Dispatched)
- Access customer contact information

### Menu Management
- Add/edit/delete menu items
- Set prices and descriptions
- Upload item images
- Manage item availability

### Analytics
- View order trends
- Track revenue
- Analyze popular items
- Customer satisfaction metrics

### Profile Management
- Restaurant information
- Operating hours
- Contact details
- Bank details for payments

## 🔐 Security

- Vendor JWT authentication
- Protected dashboard routes
- Secure API communication

---

**Deployed on:** Netlify
