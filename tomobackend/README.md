# TomoBackend - Food Delivery Platform API

A robust Node.js/Express backend API for the TomoApp food delivery platform with real-time order tracking, user management, and support systems.

## 📋 Project Overview

**TomoBackend** is the backend server powering the TomoApp ecosystem. It provides RESTful APIs for:

- 🔐 User authentication and authorization (JWT + OTP)
- 👨‍🍳 Restaurant and menu management
- 📦 Order processing and real-time tracking
- 🛒 Cart and checkout operations
- 💬 Support ticket system
- 🏪 Vendor management and approval workflow
- 👨‍💼 Admin dashboard and analytics
- 🔔 Email notifications

## 🏗️ Architecture

### Project Structure

```
tomobackend/
├── controllers/          # Business logic for each feature
│   ├── userAuthController.js      # User signup, login, OTP
│   ├── restaurantController.js    # Restaurant operations
│   ├── orderController.js         # Order management
│   ├── supportController.js       # Support tickets
│   ├── vendorController.js        # Vendor management
│   └── dashboardController.js     # Admin dashboard
├── models/               # Mongoose schemas
│   ├── User.js
│   ├── Restaurant.js
│   ├── Order.js
│   ├── Vendor.js
│   ├── SupportMessage.js
│   └── ...
├── routes/               # API endpoint definitions
│   ├── authRoutes.js
│   ├── restaurantRoutes.js
│   ├── orderRoutes.js
│   ├── supportRoutes.js
│   └── ...
├── middleware/           # Authentication, validation, file uploads
│   ├── authUser.js      # User JWT verification
│   ├── authVendor.js    # Vendor JWT verification
│   └── upload.js        # Multer file upload
├── utils/                # Helper functions
│   ├── sendEmail.js     # Email notifications via Gmail SMTP
│   └── ...
├── config/
│   └── db.js            # MongoDB connection
├── server.js            # Express app initialization
├── package.json         # Dependencies
├── .env.example         # Environment template
└── nodemon.json         # Auto-reload configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16+)
- MongoDB (local or Atlas)
- npm or yarn
- Gmail account (for email notifications)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd tomobackend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```

   Update `.env` with your credentials:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://your-mongodb-url
   JWT_SECRET=your-jwt-secret-key
   EMAIL_USER=your-gmail@gmail.com
   EMAIL_PASS=your-gmail-app-password
   ```

### Development

Start the development server with auto-reload:
```bash
npm run dev
```

The API will be available at `http://localhost:5000`

### Production

Start the production server:
```bash
npm start
```

## 🔄 API Architecture & Data Flow

### Authentication Flow

1. **User Signup**
   - POST `/api/signup/otp` → Send OTP to email
   - POST `/api/signup` → Verify OTP & create account
   - Response: JWT token + user data

2. **User Login**
   - POST `/api/login` → Verify credentials
   - Response: JWT token

3. **Password Reset**
   - POST `/api/forgot-password/otp` → Send reset OTP
   - POST `/api/reset-password` → Verify OTP & update password

### Key API Endpoints

#### Users
- `POST /api/signup/otp` - Request signup OTP
- `POST /api/signup` - Complete signup
- `POST /api/login` - User login
- `GET /api/profile` - Get user profile
- `PATCH /api/profile` - Update profile
- `GET /api/addresses` - Get saved addresses

#### Restaurants
- `GET /api/restaurants` - List all restaurants
- `GET /api/restaurants/:id` - Get restaurant details
- `GET /api/restaurants/:id/menu` - Get menu items

#### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - User's order history
- `GET /api/orders/:id` - Order details
- `GET /api/orders/:id/status` - Real-time order status

#### Support
- `POST /api/support` - Create support ticket
- `GET /api/support` - Get user's tickets
- `GET /api/support/:id` - Ticket details

#### Vendor (Dashboard)
- `GET /api/vendor/dashboard` - Vendor analytics
- `GET /api/vendor/orders` - Vendor's orders
- `POST /api/vendor/menu` - Update menu items

#### Admin
- `GET /api/admin/dashboard` - Platform analytics
- `GET /api/admin/vendors` - Manage vendors
- `POST /api/admin/vendors/:id/approve` - Approve vendor

## 🔐 Security Features

- **JWT Authentication** - Secure token-based auth
- **OTP Verification** - Email-based two-factor authentication
- **Password Hashing** - bcrypt for secure password storage
- **Middleware Protection** - Protected routes with role-based access
- **CORS Configuration** - Frontend origin validation
- **MongoDB Validation** - Schema-level data validation
- **File Upload Security** - Multer configuration with file type/size limits

## 📧 Email System

**Email Provider:** Gmail SMTP

Emails are sent for:
- OTP verification codes
- Order confirmation & updates
- Support ticket notifications
- Password reset links

**Note:** Gmail requires an **App Password** (not regular password) for SMTP authentication.

## 🗄️ Database Models

### User Model
- Email, password, profile info
- Notification preferences
- Delivery addresses
- Cart items
- Order history

### Restaurant Model
- Name, location, contact
- Menu items with prices
- Ratings and reviews
- Operating hours

### Order Model
- User reference
- Items, quantities, pricing
- Delivery address
- Order status (Pending → Confirmed → Preparing → Dispatched → Delivered)
- Payment info

### Support Model
- User & ticket info
- Status (Open → In Progress → Resolved)
- Messages and attachments

### Vendor Model
- Contact & bank details
- Restaurant association
- Approval status
- Performance metrics

## 🔄 Real-Time Features (Socket.io)

- Live order status updates
- Support ticket notifications
- User activity broadcasts
- Admin alerts

## 📦 Dependencies

Key packages:
- **Express** - Web framework
- **Mongoose** - MongoDB ODM
- **JWT** - Token authentication
- **bcryptjs** - Password hashing
- **Nodemailer** - Email sending
- **Socket.io** - Real-time communication
- **Multer** - File upload handling
- **CORS** - Cross-origin requests

## 🌐 Deployment

Currently deployed on **Render**:
- **Environment:** Node.js
- **Build command:** `npm install`
- **Start command:** `npm start`
- **Environment variables:** Configured in Render dashboard

**Important:** Ensure MongoDB connection string and email credentials are set in Render environment variables.

## 🐛 Troubleshooting

### Database Connection Issues
- Verify MongoDB connection string in `.env`
- Check MongoDB Atlas IP whitelist
- Ensure network access is allowed

### Email Not Sending
- Verify Gmail app password (not regular password)
- Check Gmail account has "Less secure app access" enabled
- Check email logs in Render

### CORS Errors
- Verify frontend URL is in `corsOptions`
- Check that credentials are set correctly

### JWT Errors
- Verify `JWT_SECRET` is set correctly
- Check token expiration
- Ensure headers include `Authorization: Bearer <token>`

## 📝 Environment Variables

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname

# JWT
JWT_SECRET=your-super-secret-key-change-in-production

# Email (Gmail SMTP)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Admin Email
ADMIN_EMAIL=admin@tomoapp.com
```

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test with Postman or similar
4. Submit a pull request

## 📄 License

This project is proprietary and confidential.

## 📞 Support

For API issues and bug reports, please contact the development team.

---

**Last Updated:** May 2026
**API Version:** 1.0
