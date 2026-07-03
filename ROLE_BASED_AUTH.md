# Role-Based Authentication System

## System Overview

This turf booking system implements three user roles with different access levels:

### Roles

1. **Admin** - Full system access
   - Manage users
   - View all bookings
   - Manage games and slots
   - System configuration

2. **Head** - Limited management access
   - View and manage bookings
   - View reports
   - Book slots (one at a time)

3. **Employee** - Standard user access
   - Book game slots
   - View their own bookings
   - One active booking at a time

## Backend Setup

### 1. Initial Admin User

An admin user is seeded into the database with:
- **Email:** admin@turfbooking.com
- **Password:** admin123

Create the admin:
```bash
cd server
npm run seed
```

### 2. API Endpoints

#### Authentication Routes

**POST** `/api/auth/register`
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "EMPLOYEE"  // or "HEAD" or "ADMIN"
}
```

**POST** `/api/auth/login`
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### 3. Protected Route Middleware

Use the `auth` and `authorize` middleware to protect routes:

```javascript
const authMiddleware = require("./src/middleware/auth");
const authorize = require("./src/middleware/role");

// Route accessible only to ADMIN
router.get(
  "/admin-only",
  authMiddleware,
  authorize("ADMIN"),
  controller
);

// Route accessible to both ADMIN and HEAD
router.get(
  "/management",
  authMiddleware,
  authorize("ADMIN", "HEAD"),
  controller
);
```

### 4. Role Validation

Valid roles in the system:
- `ADMIN`
- `HEAD`
- `EMPLOYEE`

Only these roles are accepted during registration.

## Frontend Setup

### 1. Landing Page

The landing page (`/`) displays three login/registration options:
- **Admin Login** → `/admin/auth`
- **Head Login/Register** → `/head/auth`
- **Employee Login/Register** → `/employee/auth`

Users are redirected to the landing page after logout.

### 2. Role-Based Routes

Update your `App.jsx` with role-specific routes:

```javascript
import {
  AdminRoute,
  HeadRoute,
  EmployeeRoute,
  PublicRoute,
} from "./components/ProtectedRoute";

// Admin dashboard - only accessible to admins
<Route
  path="/admin/dashboard"
  element={
    <AdminRoute>
      <AdminDashboard />
    </AdminRoute>
  }
/>

// Head dashboard - only accessible to heads
<Route
  path="/head/dashboard"
  element={
    <HeadRoute>
      <HeadDashboard />
    </HeadRoute>
  }
/>

// Employee dashboard - only accessible to employees
<Route
  path="/employee/dashboard"
  element={
    <EmployeeRoute>
      <EmployeeDashboard />
    </EmployeeRoute>
  }
/>
```

### 3. Using Auth in Components

```javascript
import { useAuth } from "../context/AuthContext";

export default function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) return <p>Please login</p>;

  // Role-based rendering
  if (user.role === "ADMIN") {
    return <AdminPanel />;
  } else if (user.role === "HEAD") {
    return <HeadPanel />;
  } else {
    return <EmployeePanel />;
  }
}
```

### 4. Making Authenticated Requests

```javascript
import { authService } from "../services/authService";

const token = authService.getToken();

const response = await fetch("/api/protected-endpoint", {
  headers: {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json",
  },
});
```

## Booking System Rules

### Key Rules:
- **One Active Booking**: Each user can only have one active booking at a time
- **Any Game**: Users can book any game available
- **Different Times**: Users can only book different time slots (no overlapping bookings)
- **Role Restrictions**:
  - Admin: Can manage all bookings
  - Head: Can book slots (one at a time) and view reports
  - Employee: Can book slots (one at a time) and view only their bookings

### Booking Status Workflow:
- `PENDING` → `CONFIRMED` → `COMPLETED`
- `CANCELLED` - Can be set at any time

## Testing Authentication

### Admin Login
```
Email: admin@turfbooking.com
Password: admin123
```

### Test Head Registration
1. Go to `/head/auth`
2. Click "Register"
3. Fill in details with role validation

### Test Employee Registration
1. Go to `/employee/auth`
2. Click "Register"
3. Fill in details with role validation

### Test Role-Based Access
- Login with different roles
- Try accessing protected routes
- System should redirect unauthorized users

## Security Considerations

1. **JWT Tokens**
   - Tokens expire in 24 hours
   - Store tokens in localStorage (frontend)
   - Send tokens in Authorization header: `Bearer <token>`

2. **Password Security**
   - Passwords hashed with bcryptjs (salt rounds: 10)
   - Minimum 6 characters required
   - Never store plain passwords

3. **CORS**
   - Configured in server/app.js
   - Update for production domains

4. **Role Verification**
   - Server always verifies user role
   - Frontend provides UI/UX guidance
   - Never trust client-side role checks alone

## Troubleshooting

### "Invalid role"
- Ensure role is one of: `ADMIN`, `HEAD`, `EMPLOYEE`
- Check registration request body

### "Access token is missing"
- Include `Authorization: Bearer <token>` header
- Token may have expired - ask user to login again

### Role-based redirect not working
- Verify user role matches route requirements
- Check browser localStorage for correct user data
- Clear browser cache and try again

### Seed admin fails
- Ensure `.env` file is configured
- Check database connection
- Run: `npm run seed` in server directory

## File Structure

```
server/
├── src/
│   ├── controllers/
│   │   └── authController.js (login/register with roles)
│   ├── middleware/
│   │   ├── auth.js (JWT verification)
│   │   └── role.js (role authorization)
│   ├── validators/
│   │   └── authValidation.js (input validation with role)
│   └── routes/
│       └── authRoutes.js (auth endpoints)
└── prisma/
    └── seed.js (admin user seeding)

client/
├── src/
│   ├── pages/
│   │   ├── Landing.jsx (role selection)
│   │   ├── Auth.jsx (admin login)
│   │   ├── HeadAuth.jsx (head login/register)
│   │   └── EmployeeAuth.jsx (employee login/register)
│   ├── context/
│   │   └── AuthContext.jsx (global auth state)
│   ├── services/
│   │   └── authService.js (API calls)
│   ├── components/
│   │   └── ProtectedRoute.jsx (role-based route guards)
│   └── styles/
│       ├── Auth.css
│       └── Landing.css
```

## Next Steps

1. **Create Dashboards**
   - AdminDashboard.jsx
   - HeadDashboard.jsx
   - EmployeeDashboard.jsx

2. **Implement Booking Endpoints**
   - POST /api/bookings (create booking)
   - GET /api/bookings (view bookings - role-based)
   - PUT /api/bookings/:id (update booking)
   - DELETE /api/bookings/:id (cancel booking)

3. **Add Slot Management**
   - Define time slots
   - Check availability
   - Prevent overlapping bookings

4. **Role-Specific Features**
   - Admin: User management, system stats
   - Head: Booking reports, team management
   - Employee: Personal booking history
