# TomoApp - Customer Food Delivery Platform

A modern, responsive web application for ordering food from restaurants with real-time order tracking and support features.

## 📋 Project Overview

**TomoApp** is the customer-facing frontend application built with React and Vite. It provides a seamless food ordering experience with features like:

- 🔐 User authentication (Email-based OTP verification)
- 🍔 Browse restaurants and menu items
- 🛒 Shopping cart management
- 📦 Real-time order tracking with Socket.io
- 👤 User profile and address management
- 💬 Support ticket system
- 🔔 Email notifications for order updates

## 🏗️ Project Structure

```
tomoapp/
├── src/
│   ├── pages/          # Page components (Auth, Home, Orders, Account, etc.)
│   ├── components/     # Reusable UI components
│   ├── context/        # React Context for global state
│   ├── hooks/          # Custom React hooks
│   ├── utils/          # Utility functions
│   ├── styles/         # Global styles
│   ├── assets/         # Images and static files
│   ├── App.jsx         # Main App component
│   └── main.jsx        # Entry point
├── public/             # Static files
├── .env.example        # Environment variables template
├── package.json        # Dependencies and scripts
├── vite.config.js      # Vite configuration
└── tailwind.config.js  # Tailwind CSS configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd tomoapp
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   Update `.env` with your backend API URL:
   ```
   VITE_API=http://localhost:5000
   ```

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Production Build

Build for production:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## 🔄 Key Features & User Flow

### 1. **Authentication**
- Sign up with email
- OTP verification (4-digit code sent to email)
- Login with credentials
- Password reset functionality

### 2. **Home & Browsing**
- View all available restaurants
- Filter and search restaurants
- Browse menu items and descriptions

### 3. **Shopping & Checkout**
- Add items to cart
- Manage cart quantities
- Save multiple delivery addresses
- Choose payment method
- Place order

### 4. **Order Tracking**
- Real-time order status updates
- View order history
- Track delivery in progress

### 5. **Support**
- Submit support tickets
- Track ticket status
- Communicate with support team

### 6. **Account Management**
- Update profile information
- Manage delivery addresses
- Email notification preferences
- Avatar selection

## 🔐 Security Features

- JWT-based authentication
- Email verification via OTP
- Secure password hashing
- Protected API endpoints
- CORS configuration

## 📦 Dependencies

Key technologies used:
- **React** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Socket.io-client** - Real-time updates
- **React Router** - Client-side routing
- **Axios/Fetch** - HTTP requests

## 🌐 Deployment

The application is deployed on **Netlify**:
- **Build command:** `npm run build`
- **Publish directory:** `dist`

## 🐛 Troubleshooting

### OTP not received?
- Check your spam/junk folder
- Verify email address is correct
- Wait 2-3 minutes for email delivery

### Slow performance?
- Clear browser cache
- Check internet connection
- Disable browser extensions

### Backend connection issues?
- Verify `.env` has correct API URL
- Check backend server is running

## 📝 Environment Variables

```env
# Backend API URL
VITE_API=http://localhost:5000
```

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

---

**Last Updated:** May 2026
