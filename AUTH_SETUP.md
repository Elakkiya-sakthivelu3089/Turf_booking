# Authentication Setup Guide

## Overview
This project implements a complete JWT-based authentication system with login and registration functionality.

## Backend Setup

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Environment Variables
Create a `.env` file in the server directory:
```
PORT=5000
DATABASE_URL=mysql://user:password@localhost:3306/game_booking
JWT_SECRET=your_secret_jwt_key_change_in_production
NODE_ENV=development
```

### 3. API Endpoints

#### Register
- **POST** `/api/auth/register`
- **Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```
- **Response:**
```json
{
  "message": "Registration successful",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "EMPLOYEE"
  }
}
```

#### Login
- **POST** `/api/auth/login`
- **Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
- **Response:**
```json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "EMPLOYEE"
  }
}
```

### 4. Using Auth Middleware
Protect routes by importing the auth middleware:
```javascript
const authMiddleware = require("./src/middleware/auth");

router.get("/protected-route", authMiddleware, controller);
```

## Frontend Setup

### 1. Install Dependencies
```bash
cd client
npm install
```

### 2. Environment Variables
Create a `.env` file in the client directory:
```
VITE_API_BASE_URL=http://localhost:5000/api
```

### 3. Setup in App.jsx
```javascript
import { AuthProvider } from "./context/AuthContext";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ProtectedRoute, PublicRoute } from "./components/ProtectedRoute";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route
            path="/auth"
            element={
              <PublicRoute>
                <Auth />
              </PublicRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
```

### 4. Using Auth in Components
```javascript
import { useAuth } from "../context/AuthContext";

export default function MyComponent() {
  const { user, login, logout, isAuthenticated } = useAuth();

  return (
    <div>
      {isAuthenticated && <p>Welcome, {user.name}!</p>}
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

## API Authentication
When making authenticated API requests, include the token in the Authorization header:
```javascript
const token = authService.getToken();
const response = await fetch("/api/protected-endpoint", {
  headers: {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
  }
});
```

## Security Notes
- Always use HTTPS in production
- Store JWT_SECRET securely (use environment variables)
- Never expose tokens in URLs
- Set appropriate token expiration times (currently 1 day)
- Use CORS properly in production
- Validate all inputs on both client and server

## Troubleshooting

### "Access token is missing"
Make sure to include the Authorization header with the Bearer token.

### "Invalid token"
The token may have expired or been tampered with. Ask the user to log in again.

### CORS errors
Check the CORS configuration in `server/app.js`.

### Validation errors
Check the error details in the response to see which fields failed validation.
