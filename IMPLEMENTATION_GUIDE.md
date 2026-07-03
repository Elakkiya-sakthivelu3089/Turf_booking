# Complete Role-Based Turf Booking System Setup

## Quick Start

### Backend Setup (Server)

1. **Install dependencies:**
```bash
cd server
npm install
```

2. **Configure environment (.env):**
```
PORT=5000
DATABASE_URL=mysql://user:password@localhost:3306/game_booking
JWT_SECRET=your_secret_key_here_change_in_production
NODE_ENV=development
```

3. **Run database migrations:**
```bash
npx prisma migrate dev
```

4. **Seed admin user:**
```bash
npm run seed
```

5. **Start server:**
```bash
npm run dev
```

Server runs on: `http://localhost:5000`

### Frontend Setup (Client)

1. **Install dependencies:**
```bash
cd client
npm install
```

2. **Configure environment (.env):**
```
VITE_API_BASE_URL=http://localhost:5000/api
```

3. **Update App.jsx:**
Replace your current `App.jsx` with the example from `App.jsx.example`

4. **Start dev server:**
```bash
npm run dev
```

Client runs on: `http://localhost:5173`

---

## System Architecture

### Database Schema (Prisma)

Your `schema.prisma` should include:

```prisma
model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  password  String
  role      String   // "ADMIN", "HEAD", "EMPLOYEE"
  bookings  Booking[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Game {
  id            String   @id @default(cuid())
  name          String
  description   String?
  pricePerHour  Float
  bookings      Booking[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Booking {
  id          String   @id @default(cuid())
  userId      String
  gameId      String
  user        User     @relation(fields: [userId], references: [id])
  game        Game     @relation(fields: [gameId], references: [id])
  startTime   DateTime
  endTime     DateTime
  status      String   // "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"
  totalAmount Float
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([userId, id]) // Helps with one-at-a-time booking rule
}
```

### API Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user (Head/Employee)
- `POST /api/auth/login` - Login for any role

#### Bookings
- `POST /api/bookings` - Create booking (Authenticated)
- `GET /api/bookings` - Get bookings (filtered by role)
- `GET /api/bookings/available` - Get available slots
- `PUT /api/bookings/:id` - Update booking status (Admin/Head)
- `DELETE /api/bookings/:id` - Cancel booking

#### Admin Only
- `GET /api/admin/users` - List all users
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/bookings` - View all bookings

---

## Frontend Structure

### Pages Created

1. **Landing.jsx** (`/`)
   - Shows role selection
   - Displays login options for each role
   - Shows welcome message if logged in

2. **Auth.jsx** (`/admin/auth`)
   - Admin login page
   - Admin registration (typically disabled)

3. **HeadAuth.jsx** (`/head/auth`)
   - Head login and registration
   - Role-specific messaging

4. **EmployeeAuth.jsx** (`/employee/auth`)
   - Employee login and registration
   - Role-specific messaging

### Context & State

**AuthContext** provides:
```javascript
{
  user: { id, name, email, role },
  isAuthenticated: boolean,
  loading: boolean,
  error: string,
  login: (email, password) => Promise,
  register: (name, email, password, role) => Promise,
  logout: () => void
}
```

### Route Protection

```javascript
// Admin only
<Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

// Head only
<Route path="/head/dashboard" element={<HeadRoute><HeadDashboard /></HeadRoute>} />

// Employee only
<Route path="/employee/dashboard" element={<EmployeeRoute><EmployeeDashboard /></EmployeeRoute>} />

// Public (non-authenticated)
<Route path="/head/auth" element={<PublicRoute><HeadAuth /></PublicRoute>} />
```

---

## User Flows

### Admin Flow
1. Login with `admin@turfbooking.com` / `admin123`
2. Access `/admin/dashboard`
3. Full system access

### Head Flow
1. Go to `/head/auth`
2. Register or login
3. Access `/head/dashboard`
4. Can:
   - Book slots (one at a time)
   - View bookings
   - Access reports

### Employee Flow
1. Go to `/employee/auth`
2. Register or login
3. Access `/employee/dashboard`
4. Can:
   - Book slots (one at a time)
   - View their own bookings
   - View available slots

---

## Booking System Rules

### One-at-a-Time Booking
```javascript
// Before creating booking, check:
const activeBooking = await checkActiveBooking(userId);

// Status: PENDING or CONFIRMED = active
// User cannot create new booking if active booking exists
```

### Slot Availability
```javascript
// Check for conflicting bookings:
- Game must match
- Status must be CONFIRMED
- Time ranges must not overlap

// Time check:
// Existing: 9:00 AM - 10:00 AM
// New booking: 9:30 AM - 10:30 AM
// Result: CONFLICT - Not allowed
```

### Status Flow
```
PENDING -----> CONFIRMED -----> COMPLETED
  (Initial)     (Admin/Head)     (Auto/Manual)
       |
       ├-----------> CANCELLED (Anytime)
```

---

## Testing Checklist

- [ ] Admin login works with credentials
- [ ] Head can register from `/head/auth`
- [ ] Employee can register from `/employee/auth`
- [ ] Users redirected to correct dashboard
- [ ] Cannot access other role's dashboard
- [ ] Booking one slot prevents booking another
- [ ] Overlapping time slots rejected
- [ ] User can view their bookings
- [ ] Logout returns to landing page
- [ ] Token stored and sent with requests
- [ ] Expired token handled gracefully

---

## File Reference

### Backend Files
- `server/src/controllers/authController.js` - Login/Register logic
- `server/src/middleware/auth.js` - JWT verification
- `server/src/middleware/role.js` - Role authorization
- `server/src/validators/authValidation.js` - Input validation
- `server/src/services/bookingServices.js` - Booking logic
- `server/prisma/seed.js` - Admin user seed

### Frontend Files
- `client/src/pages/Landing.jsx` - Home page
- `client/src/pages/Auth.jsx` - Admin login
- `client/src/pages/HeadAuth.jsx` - Head login/register
- `client/src/pages/EmployeeAuth.jsx` - Employee login/register
- `client/src/context/AuthContext.jsx` - Global auth state
- `client/src/services/authService.js` - Auth API calls
- `client/src/components/ProtectedRoute.jsx` - Route guards
- `client/src/App.jsx.example` - Route setup example

---

## Next Steps

1. **Create Dashboards**
   - AdminDashboard.jsx
   - HeadDashboard.jsx
   - EmployeeDashboard.jsx

2. **Implement Booking Endpoints**
   - bookingController.js
   - bookingRoutes.js

3. **Add Game Management**
   - gameController.js
   - gameRoutes.js

4. **Create Booking UI**
   - Slot booking form
   - Available slots calendar
   - Booking history

5. **Deploy**
   - Set production DATABASE_URL
   - Set strong JWT_SECRET
   - Enable HTTPS
   - Configure CORS for production domain

---

## Troubleshooting

### "Admin user already exists"
- This is normal on subsequent seed runs
- To reset: Delete admin user from database and run seed again

### Token errors on requests
- Check Authorization header format: `Bearer <token>`
- Verify token not expired
- Try login again

### CORS errors
- Ensure client URL matches CORS config
- Check server is running on correct port

### Booking validation fails
- Check startTime < endTime
- Verify gameId exists
- Ensure time format is ISO 8601

### Role mismatch
- Verify role matches route requirements
- Check localStorage for correct user data
- Clear browser cache

---

## Security Reminders

1. **Production Checklist**
   - [ ] Change JWT_SECRET
   - [ ] Use HTTPS only
   - [ ] Set appropriate CORS origins
   - [ ] Use environment variables for secrets
   - [ ] Implement rate limiting
   - [ ] Add request logging
   - [ ] Set up database backups
   - [ ] Enable database encryption

2. **Never in Production**
   - Default admin password in code
   - JWT_SECRET in git history
   - Debug logging enabled
   - Development CORS settings
