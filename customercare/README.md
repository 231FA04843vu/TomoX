# CustomerCare - Support & Account Management Portal

A dedicated React application for customer support ticket management and account services in the TomoApp platform.

## 📋 Project Overview

**CustomerCare** is a specialized frontend application for:

- 🎫 Support ticket creation and tracking
- 📧 Ticket status updates and communication
- 👤 Account information management
- 🔐 Agent/staff dashboard login
- 💬 Real-time message updates
- 📊 Support ticket analytics

## 🏗️ Project Structure

```
customercare/
├── src/
│   ├── pages/          # Dashboard, Ticket Viewer, Login
│   ├── components/     # Sidebar, Layout, LoginForm
│   ├── assets/         # Branding images
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── public/
├── api/
│   └── supportAPI.js   # Backend API integration
├── utils/
│   └── sendEmail.js    # Email utilities (if needed)
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

Create `.env` from `.env.example`:
```env
VITE_API=http://localhost:5000
```

## 🔐 Security

- Protected routes (agent authentication required)
- JWT token verification
- Secure API communication

---

**Deployed on:** Netlify
