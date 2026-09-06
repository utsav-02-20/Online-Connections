# Online Connections — Backend API Documentation & Next.js Integration Guide

This document provides a comprehensive breakdown of the **Online Connections** backend architecture, database schemas, authentication flow, complete API specifications, error handling, server-side route mappings, and essential guidelines for building the frontend application using **Next.js**.

---

## 📌 Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Environment Configuration](#2-environment-configuration)
3. [Database Schema (User Model)](#3-database-schema-user-model)
4. [Authentication & Authorization Flow](#4-authentication--authorization-flow)
5. [Complete API Reference](#5-complete-api-reference)
   - [1. User Registration](#1-user-registration)
   - [2. User Login](#2-user-login)
   - [3. User Logout](#3-user-logout)
   - [4. Get Authenticated User Profile](#4-get-authenticated-user-profile)
   - [5. Get Public User Profile](#5-get-public-user-profile)
   - [6. Update User Profile](#6-update-user-profile)
   - [7. Search Users](#7-search-users)
   - [8. Add Friend](#8-add-friend)
6. [🚀 Next.js Frontend Integration Guide](#6--nextjs-frontend-integration-guide)
   - [A. Next.js API Proxy Rewrites (Handling CORS & Cookies)](#a-nextjs-api-proxy-rewrites-handling-cors--cookies)
   - [B. Authentication & Token Handling in Next.js](#b-authentication--token-handling-in-nextjs)
   - [C. API Utility Client (Axios / Fetch Setup)](#c-api-utility-client-axios--fetch-setup)
   - [D. Next.js App Router Structure](#d-nextjs-app-router-structure)
7. [Express Server HTML Page Routes](#7-express-server-html-page-routes)
8. [Frontend Input Validation Rules](#8-frontend-input-validation-rules)
9. [Legacy Frontend Assets Reference](#9-legacy-frontend-assets-reference)

---

## 1. Architecture Overview

- **Runtime Environment:** Node.js (ES Module format `"type": "module"`)
- **Web Framework:** Express.js (v5.x)
- **Database:** MongoDB with Mongoose (v9.x)
- **Authentication:** JWT (JSON Web Tokens) with dual token architecture:
  - **Access Token:** Short-lived (15 minutes), passed via HTTP `Authorization` header (`Bearer <token>`).
  - **Refresh Token:** Long-lived (7 days), stored in an HTTP-Only secure cookie (`refreshToken`).
- **Password Hashing:** SHA-256 (`crypto.createHash('sha256')`)
- **Base API Path:** `http://localhost:5000/api/auth`

---

## 2. Environment Configuration

The backend relies on the following environment variables defined in `.env`:

| Parameter | Default Value | Description |
| :--- | :--- | :--- |
| `PORT` | `5000` | Port where the server runs |
| `MONGODB_URI` | `mongodb://localhost:27017` | MongoDB connection string |
| `DB_NAME` | `online_connections_db` | Database name |
| `JWT_SECRET` | `default_jwt_secret_key...` | Secret key for signing JWTs |
| `NODE_ENV` | `development` | Environment mode (`development` / `production`) |

---

## 3. Database Schema (User Model)

**Collection Name:** `users`

```typescript
interface IUser {
  _id: string;                // MongoDB ObjectId
  username: string;           // Required, Unique, Lowercase, Trimmed (3-30 chars, /^[a-zA-Z0-9_]+$/)
  email: string;              // Required, Unique, Lowercase, Trimmed (/^\S+@\S+\.\S+$/)
  password?: string;          // Required, Min 8 chars (Hidden by default in queries: select: false)
  phone: string;              // Optional, default ""
  phoneVerified: boolean;     // Optional, default false
  address: string;            // Optional, default ""
  profilePic: string;         // Optional image URL, default ""
  about: string;              // Optional bio/description, max 500 chars, default ""
  friends: string[];          // Array of friend usernames (stored as lowercase strings), default []
  createdAt: string;          // ISO Timestamp (automatically generated)
  updatedAt: string;          // ISO Timestamp (automatically generated)
}
```

---

## 4. Authentication & Authorization Flow

1. **Registration:**
   - Client sends `POST /api/auth/register` with `username`, `email`, `password`.
   - Backend returns `user` object with `accessToken` (15m expiry) and sets `refreshToken` (7d expiry) in an HTTP-Only cookie.

2. **Login:**
   - Client sends `POST /api/auth/login` with `identifier` (`email` or `username`) and `password`.
   - Backend returns `user` object with `accessToken` (15m expiry).

3. **Protected API Requests:**
   - Client MUST attach the `accessToken` in request headers:
     ```http
     Authorization: Bearer <accessToken>
     ```
   - Client MUST include credentials (`withCredentials: true` in Axios or `credentials: 'include'` in Fetch) to allow the backend to read HTTP-Only cookies.

4. **Logout:**
   - Client sends `POST /api/auth/logout`.
   - Backend clears the `refreshToken` HTTP-Only cookie. Client should clear local state/tokens.

---

## 5. Complete API Reference

> **Base URL:** `http://localhost:5000/api/auth`

---

### 1. User Registration

Registers a new user account.

- **URL:** `/register`
- **Method:** `POST`
- **Access:** Public

#### Request Body
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

#### Response (201 Created)
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "64f1ab23c4567890abcdef12",
    "username": "johndoe",
    "email": "john@example.com",
    "phone": "",
    "phoneVerified": false,
    "address": "",
    "profilePic": "",
    "about": "",
    "friends": [],
    "accessToken": "eyJhbGciOiJIUzI1NiIsIn..."
  }
}
```

#### Error Responses
- `400 Bad Request`: `{"success": false, "message": "Username, email, and password are required"}`
- `409 Conflict`: `{"success": false, "message": "Username or email already exists"}`
- `500 Internal Server Error`: `{"success": false, "message": "Internal server error"}`

---

### 2. User Login

Authenticates user via username or email.

- **URL:** `/login`
- **Method:** `POST`
- **Access:** Public

#### Request Body
```json
{
  "email": "john@example.com", // OR "username": "johndoe"
  "password": "securepassword123"
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "64f1ab23c4567890abcdef12",
    "username": "johndoe",
    "email": "john@example.com",
    "phone": "",
    "phoneVerified": false,
    "address": "",
    "profilePic": "",
    "about": "",
    "friends": [],
    "accessToken": "eyJhbGciOiJIUzI1NiIsIn...",
    "createdAt": "2026-09-06T10:00:00.000Z",
    "updatedAt": "2026-09-06T10:00:00.000Z"
  }
}
```

#### Error Responses
- `400 Bad Request`: `{"success": false, "message": "Username/email and password are required"}`
- `404 Not Found`: `{"success": false, "message": "User not found"}`
- `401 Unauthorized`: `{"success": false, "message": "Invalid credentials"}`
- `500 Internal Server Error`: `{"success": false, "message": "Internal server error"}`

---

### 3. User Logout

Logs out user and clears refresh token cookie.

- **URL:** `/logout`
- **Method:** `POST`
- **Access:** Private (Cookie required)

#### Headers / Cookies
Cookie: `refreshToken=<JWT_TOKEN>`

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Logout successful"
}
```

#### Error Response
- `401 Unauthorized`: `{"success": false, "message": "Already logged out"}` (if cookie missing)

---

### 4. Get Authenticated User Profile

Fetches profile of the currently logged-in user.

- **URL:** `/get-me`
- **Method:** `GET`
- **Access:** Private (JWT Bearer Token Required)

#### Headers
```http
Authorization: Bearer <accessToken>
```

#### Response (200 OK)
```json
{
  "success": true,
  "user": {
    "id": "64f1ab23c4567890abcdef12",
    "username": "johndoe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "phoneVerified": false,
    "address": "123 Main St",
    "profilePic": "https://example.com/avatar.jpg",
    "about": "Hello world!",
    "friends": ["alice", "bob"],
    "createdAt": "2026-09-06T10:00:00.000Z",
    "updatedAt": "2026-09-06T10:30:00.000Z"
  }
}
```

#### Error Responses
- `401 Unauthorized`: `{"success": false, "message": "Unauthorized"}`
- `404 Not Found`: `{"message": "User not found"}`
- `500 Internal Server Error`: `{"success": false, "message": "Internal server error"}`

---

### 5. Get Public User Profile

Fetches public profile of any user by username (does not require authentication).

- **URL:** `/profile/:username`
- **Method:** `GET`
- **Access:** Public

#### Response (200 OK)
```json
{
  "success": true,
  "user": {
    "id": "64f1ab23c4567890abcdef12",
    "username": "johndoe",
    "email": "john@example.com",
    "profilePic": "https://example.com/avatar.jpg",
    "about": "Hello world!",
    "friends": ["alice", "bob"],
    "createdAt": "2026-09-06T10:00:00.000Z"
  }
}
```

#### Error Responses
- `404 Not Found`: `{"success": false, "message": "User not found"}`
- `500 Internal Server Error`: `{"success": false, "message": "Internal server error"}`

---

### 6. Update User Profile

Updates user profile fields (only allowed for the user's own profile).

- **URL:** `/profile/:username`
- **Method:** `PATCH`
- **Access:** Private (JWT Bearer Token Required)

#### Headers
```http
Authorization: Bearer <accessToken>
```

#### Request Body (All fields optional)
```json
{
  "email": "newjohn@example.com",
  "phone": "+1987654321",
  "phoneVerified": true,
  "address": "456 New Ave",
  "profilePic": "https://example.com/newpic.jpg",
  "about": "Updated about text"
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "id": "64f1ab23c4567890abcdef12",
    "username": "johndoe",
    "email": "newjohn@example.com",
    "phone": "+1987654321",
    "phoneVerified": true,
    "address": "456 New Ave",
    "profilePic": "https://example.com/newpic.jpg",
    "about": "Updated about text",
    "friends": ["alice", "bob"],
    "createdAt": "2026-09-06T10:00:00.000Z",
    "updatedAt": "2026-09-06T11:00:00.000Z"
  }
}
```

#### Error Responses
- `401 Unauthorized`: `{"success": false, "message": "Unauthorized"}`
- `403 Forbidden`: `{"success": false, "message": "You can only update your own profile"}`
- `404 Not Found`: `{"success": false, "message": "User not found"}`
- `409 Conflict`: `{"success": false, "message": "Email already in use"}`
- `500 Internal Server Error`: `{"success": false, "message": "Internal server error"}`

---

### 7. Search Users

Searches for registered users by partial, case-insensitive username matching (returns up to 10 results).

- **URL:** `/users/search?username=<query>`
- **Method:** `GET`
- **Access:** Public

#### Query Parameters
- `username` (string): The search query

#### Response (200 OK)
```json
{
  "success": true,
  "users": [
    {
      "id": "64f1ab23c4567890abcdef12",
      "username": "johndoe",
      "profilePic": "https://example.com/avatar.jpg",
      "about": "Hello world!"
    }
  ]
}
```

#### Error Responses
- `500 Internal Server Error`: `{"success": false, "message": "Internal server error"}`

---

### 8. Add Friend

Adds a user to the authenticated user's friends list.

- **URL:** `/friends/:username/:friendUsername`
- **Method:** `POST`
- **Access:** Private (JWT Bearer Token Required)

#### URL Parameters
- `:username`: Username of logged-in user
- `:friendUsername`: Username of friend to add

#### Headers
```http
Authorization: Bearer <accessToken>
```

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Friend added successfully",
  "user": {
    "id": "64f1ab23c4567890abcdef12",
    "username": "johndoe",
    "email": "john@example.com",
    "phone": "",
    "phoneVerified": false,
    "address": "",
    "profilePic": "",
    "about": "",
    "friends": ["alice", "bob", "targetfriend"],
    "createdAt": "2026-09-06T10:00:00.000Z",
    "updatedAt": "2026-09-06T11:05:00.000Z"
  }
}
```

#### Error Responses
- `400 Bad Request`: `{"success": false, "message": "Invalid friend username"}` (e.g. self-friendship or empty)
- `401 Unauthorized`: `{"success": false, "message": "Unauthorized"}`
- `403 Forbidden`: `{"success": false, "message": "You can only add friends to your own account"}`
- `404 Not Found`: `{"success": false, "message": "User not found"}` or `{"success": false, "message": "Friend user not found"}`
- `500 Internal Server Error`: `{"success": false, "message": "Internal server error"}`

---

## 6. 🚀 Next.js Frontend Integration Guide

### A. Next.js API Proxy Rewrites (Handling CORS & Cookies)

To bypass CORS restrictions and allow HTTP-Only cookies to be seamlessly passed between Next.js (running on port `3000`) and Express backend (running on port `5000`), configure rewrites in `next.config.js` (or `next.config.mjs`):

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5000/api/:path*',
      },
    ];
  },
};

export default nextConfig;
```

This routes all `/api/*` calls made by Next.js directly to the Express backend without CORS issues.

---

### B. Authentication & Token Handling in Next.js

1. **Access Token Storage:**
   - Store `accessToken` in memory or React Context / Zustand / Redux state upon successful `login` or `register`.
   - Store user object in AuthContext for global access across Client Components.

2. **Session Persistence on Page Reload:**
   - On app mount, call `GET /api/auth/get-me` from Next.js with `Authorization: Bearer <accessToken>`.

---

### C. API Utility Client (Axios Setup Example)

Create an Axios instance at `src/lib/api.ts` (or `src/lib/api.js`):

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: '/api/auth', // Uses Next.js rewrite proxy
  withCredentials: true, // Passes HTTP-Only refreshToken cookie automatically
});

// Interceptor to attach AccessToken
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;
```

---

### D. Next.js App Router Structure

Recommended Next.js 14/15 App Router directory structure for `frontend/`:

```text
frontend/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx        # Login Form
│   │   │   └── register/page.tsx     # Register Form
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/page.tsx    # User Dashboard & Friends
│   │   │   └── settings/page.tsx     # Profile Settings / Edit
│   │   ├── search/page.tsx           # Search Users Page
│   │   ├── [username]/page.tsx       # Public User Profile
│   │   ├── layout.tsx                # Root Layout with AuthProvider
│   │   └── page.tsx                  # Home Landing Page
│   ├── context/
│   │   └── AuthContext.tsx           # React Context for Auth State
│   ├── lib/
│   │   └── api.ts                    # Axios HTTP Client
│   └── components/                   # Navbar, Sidebar, UserCard, etc.
├── next.config.mjs
├── package.json
└── tsconfig.json
```

---

## 7. Express Server HTML Page Routes

The backend (`src/index.js`) includes static HTML page routes serving files from `backend/Public`:

| Route | Served HTML File | Target View |
| :--- | :--- | :--- |
| `GET /` | `Public/pages/login.html` | Landing / Login Page |
| `GET /login` | `Public/pages/login.html` | Login View |
| `GET /register` | `Public/pages/login.html` | Registration View |
| `GET /:username/page_routes` | `Public/pages/user.html` | User Profile View |
| `GET /:username/my_dashboard` | `Public/pages/dashboard.html` | User Dashboard |
| `GET /:username/friends` | `Public/pages/dashboard.html` | Friends List View |
| `GET /:username/settings` | `Public/pages/dashboard.html` | Profile Settings View |
| `GET /search` | `Public/pages/user.html` | User Search View |
| `*` (Catch-all 404) | `Public/pages/login.html` | Default 404 Fallback |

---

## 8. Frontend Input Validation Rules

Enforce the following client-side validation rules to match backend Mongoose constraints:

| Field | Type / Format | Min Length | Max Length | Regex / Pattern |
| :--- | :--- | :--- | :--- | :--- |
| `username` | String | 3 chars | 30 chars | `/^[a-zA-Z0-9_]+$/` (Alphanumeric + Underscores only) |
| `email` | String | - | - | `/^\S+@\S+\.\S+$/` (Valid email pattern) |
| `password` | String | 8 chars | - | - |
| `about` | String | - | 500 chars | - |
| `profilePic` | String | - | - | Valid URL pattern |

---

## 9. Legacy Frontend Assets Reference

The backend repository contains initial static frontend scripts and HTML pages located under `backend/Public`:
- `Public/pages/login.html` — Login/Register HTML template
- `Public/pages/dashboard.html` — User Dashboard HTML template
- `Public/pages/user.html` — Public Profile HTML template
- `Public/js/login.js`, `Public/js/dashboard.js`, `Public/js/user.js`, `Public/js/user.jsx` — Reference JavaScript/JSX client interaction logic.

---

*Document prepared for building the Next.js Frontend application of Online Connections.*
