# 🏟️ Turf Booking System - Quick Reference

## System Overview

**Three User Roles:**
- 🔑 **Admin** - Full system access (1 account seeded)
- 👥 **Head** - Booking + Reports (Register from `/head/auth`)
- 👤 **Employee** - Bookings only (Register from `/employee/auth`)

**Key Feature:**
- ✅ One active booking per user at a time
- ✅ No overlapping time slots for same game
- ✅ Role-based access control
- ✅ Secure JWT authentication

---

## 🚀 Getting Started (5 minutes)

### Backend
```bash
cd server
npm install
# Create .env (copy from .env.example)
npm run seed        # Creates admin user
npm run dev         # Starts on localhost:5000
```

### Frontend
```bash
cd client
npm install
# Create .env (copy from .env.example)
npm run dev         # Starts on localhost:5173
```

### Test Credentials
- **Admin Email:** admin@turfbooking.com
- **Admin Password:** admin123

---

## 📍 Navigation Map

### Landing Page
```
http://localhost:5173
├── Admin Login → /admin/auth
├── Head Login/Register → /head/auth
└── Employee Login/Register → /employee/auth
```

### Login vs Register
- **Admin**: Login only (admin created via seed)
- **Head**: Can register at `/head/auth`
- **Employee**: Can register at `/employee/auth`

### After Login
- Admin → `/admin/dashboard` (create this)
- Head → `/head/dashboard` (create this)
- Employee → `/employee/dashboard` (create this)

---

## 🔐 Authentication Flow

1. User registers/logs in at role-specific page
2. Server validates credentials
3. JWT token issued (24 hours validity)
4. Token stored in localStorage
5. Sent with every API request in header: `Authorization: Bearer <token>`
6. Server verifies token + role on protected routes

---

## 💾 Key Files Created

### Backend
```
✅ authController.js       - Login/Register with roles
✅ authValidation.js       - Input validation (Joi)
✅ auth.js (middleware)    - JWT verification
✅ role.js (middleware)    - Role authorization
✅ bookingServices.js      - Booking logic + rules
✅ bookingValidation.js    - Booking input validation
✅ seed.js                 - Admin user creation
```

### Frontend
```
✅ Landing.jsx             - Role selection home
✅ Auth.jsx                - Admin login
✅ HeadAuth.jsx            - Head login/register
✅ EmployeeAuth.jsx        - Employee login/register
✅ AuthContext.jsx         - Global auth state
✅ authService.js          - API calls
✅ ProtectedRoute.jsx      - Route guards (role-based)
✅ Auth.css                - Auth form styling
✅ Landing.css             - Landing page styling
```

---

## 🛣️ Setting Up App.jsx

Copy from `App.jsx.example` and include:

```javascript
import { AuthProvider } from "./context/AuthContext";
import { AdminRoute, HeadRoute, EmployeeRoute, PublicRoute } from "./components/ProtectedRoute";
import Landing from "./pages/Landing";
import AdminAuth from "./pages/Auth";
import HeadAuth from "./pages/HeadAuth";
import EmployeeAuth from "./pages/EmployeeAuth";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          
          {/* Role-specific auth routes */}
          <Route path="/admin/auth" element={<PublicRoute><AdminAuth /></PublicRoute>} />
          <Route path="/head/auth" element={<PublicRoute><HeadAuth /></PublicRoute>} />
          <Route path="/employee/auth" element={<PublicRoute><EmployeeAuth /></PublicRoute>} />
          
          {/* Add dashboards here when created */}
          {/* <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} /> */}
          {/* <Route path="/head/dashboard" element={<HeadRoute><HeadDashboard /></HeadRoute>} /> */}
          {/* <Route path="/employee/dashboard" element={<EmployeeRoute><EmployeeDashboard /></EmployeeRoute>} /> */}
        </Routes>
      </AuthProvider>
    </Router>
  );
}
```

---

## 📋 Booking Rules

### One Active Booking
- User cannot create booking if already has PENDING or CONFIRMED booking
- Must cancel existing booking first

### No Overlapping Slots
- Can't book 9:00-10:00 if someone already has 9:30-10:30
- Each game slot unique to time range

### Time Zone
- Store all times in UTC in database
- Convert to user's timezone in frontend (if needed)

---

## 🔗 API Endpoints Reference

### Auth
```
POST   /api/auth/register    {name, email, password, role}
POST   /api/auth/login       {email, password}
```

### Bookings (to implement)
```
POST   /api/bookings                    {gameId, startTime, endTime}
GET    /api/bookings                    (filtered by role)
GET    /api/bookings/available          {gameId, date}
PUT    /api/bookings/:id                {status}
DELETE /api/bookings/:id
```

### Admin Only (to implement)
```
GET    /api/admin/users
GET    /api/admin/bookings
DELETE /api/admin/users/:id
```

---

## ✅ Verification Checklist

After setup, test:

- [ ] Can access http://localhost:5173
- [ ] See landing page with 3 role options
- [ ] Admin login works
- [ ] Head can register
- [ ] Employee can register
- [ ] After login, see role badge
- [ ] Can logout (returns to landing)
- [ ] Accessing wrong role dashboard redirects to home
- [ ] Token persists after page refresh
- [ ] Network tab shows `Authorization: Bearer <token>` header

---

## 🚨 Common Issues

| Issue | Solution |
|-------|----------|
| CORS error | Check `cors()` in server/app.js |
| Login fails | Verify credentials & database connected |
| No admin user | Run `npm run seed` in server directory |
| Token expires | User needs to login again |
| Role redirect loop | Check localStorage has correct role |
| Database error | Ensure .env DATABASE_URL is correct |

---

## 📚 Documentation Files

1. **IMPLEMENTATION_GUIDE.md** - Complete setup instructions
2. **ROLE_BASED_AUTH.md** - Role system details
3. **AUTH_SETUP.md** - Original auth setup

---

## 🎯 To Do Next

Create these files for complete system:

1. **Dashboards** (3 files)
   ```
   AdminDashboard.jsx
   HeadDashboard.jsx
   EmployeeDashboard.jsx
   ```

2. **Booking Features** (3 files)
   ```
   bookingController.js
   bookingRoutes.js
   BookingForm.jsx
   ```

3. **Game Management** (2 files)
   ```
   gameController.js
   gameRoutes.js
   ```

---

## 💡 Pro Tips

1. **Use React Dev Tools**
   - Inspect AuthContext to verify user state
   - Check localStorage for token

2. **Use Browser Network Tab**
   - Verify Authorization header present
   - Check response status codes

3. **Use Postman**
   - Test API endpoints directly
   - Debug backend issues

4. **Console Logging**
   - Frontend: `console.log(user)` in components
   - Backend: `console.log()` in controllers

---

## 🔒 Security Note

This is a development setup. For production:
- ✅ Change JWT_SECRET to strong random value
- ✅ Use HTTPS
- ✅ Set CORS to specific domains
- ✅ Implement rate limiting
- ✅ Add request validation
- ✅ Enable HTTPS redirects

---

**Happy coding! 🚀**
