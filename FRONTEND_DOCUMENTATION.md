# Online Connections — Next.js Frontend Documentation & Architecture Guide

This document provides a comprehensive breakdown of the **Online Connections** frontend application built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, and **Tailwind CSS v4**.

---

## 📌 Table of Contents

1. [Frontend Structure Status & Roadmap (HAVE vs. WANT)](#1-frontend-structure-status--roadmap-have-vs-want)
2. [Architecture & Directory Overview](#2-architecture--directory-overview)
3. [Environment Configuration](#3-environment-configuration)
4. [App Router Pages & Route Map](#4-app-router-pages--route-map)
5. [Authentication State & API Utility Client](#5-authentication-state--api-utility-client)
6. [Reusable UI Component Library](#6-reusable-ui-component-library)
7. [Privacy & Security Rules](#7-privacy--security-rules)
8. [Getting Started & Development Guide](#8-getting-started--development-guide)

---

## 1. Frontend Structure Status & Roadmap (HAVE vs. WANT)

### 📦 HAVE (Current Implementation - Sorted by Priority)

1. **P0 - Next.js 16 (App Router) & React 19 Core Setup**
   - Next.js 16 with Turbopack compilation and TypeScript support (`tsconfig.json`).
   - Tailwind CSS v4 styling system with Light Mode (Day Mode) color defaults (`app/globals.css`).

2. **P0 - Global Authentication State & Session Context**
   - React Context (`context/AuthContext.tsx`) managing `user`, `token`, `login`, `register`, `logout`, `updateProfile`, and `addFriend`.
   - Automatic `localStorage` access token persistence and user re-fetch (`GET /api/auth/get-me`).

3. **P0 - API Utility Client (`lib/api.ts`)**
   - Type-safe `apiRequest<T>` wrapper around native `fetch`.
   - Handles `http://localhost:5000/api/auth` endpoint requests with `Authorization: Bearer <token>` and `credentials: "include"`.

4. **P0 - Authentication & Session Pages**
   - Login page (`app/login/page.tsx`) with split-screen layout, floating input labels, show/hide password toggle, and loading state.
   - Registration page (`app/register/page.tsx`) with live password strength indicator, password confirmation match check, and terms agreement.

5. **P0 - Personal & Public Profile Management**
   - Logged-in profile route (`app/u/[identifier]/page.tsx`) displaying stats, bio, verified phone badge, and friends list.
   - Public profile route (`app/profile/[username]/page.tsx`) for public member viewing.
   - Profile editor (`app/profile/edit/page.tsx`) allowing updates to Email, Phone, Address, Bio (with 500-char counter), and Profile Picture.

6. **P1 - Social Connection & Search Features**
   - User search interface (`app/search/page.tsx`) with live query execution, shimmer skeleton loaders, empty state cards, and **+ Add Friend** buttons.
   - Mutual friend connection handling (User A and User B both update friend arrays upon connection).

7. **P1 - Media Capture & Profile Picture Management**
   - **Upload File Mode**: File input picker with client-side canvas image resizing (max 300x300 JPEG).
   - **Click Photo Mode**: Live webcam video feed (`navigator.mediaDevices.getUserMedia`) with instant frame capture.
   - **URL Mode**: Image URL entry with avatar preview.

8. **P1 - Privacy & Data Protection Controls**
   - Private contact fields (**Phone Number** and **Address**) and Email are strictly hidden when viewing friends or other members.
   - Private details are rendered **only** on your own personal profile (`isSelf`).

9. **P1 - Production UI/UX Component Library (`components/ui/`)**
   - `Button`: Primary, secondary, outline, ghost, and danger variants with spinners.
   - `Input`: Styled inputs with left/right icons and password eye toggles.
   - `Card`: Rounded elevated surface cards (`rounded-2xl`).
   - `Avatar`: Circular avatar with image error fallbacks and initials ring.
   - `Badge`: Status badges (`success`, `warning`, `info`, `neutral`).
   - `Skeleton`: Shimmer loading cards.
   - `EmptyState`: Clean empty state illustration cards.
   - `Toast`: Sliding feedback notifications.

10. **P2 - Sticky Navigation Header (`components/Navbar.tsx`)**
    - Brand logo (`OC Online Connections`), direct **Find Users** search button, profile pill dropdown, and responsive mobile drawer.

---

### 🎯 WANT (Missing Features & Future Improvements - Sorted by Priority)

1. **P0 - Server-Side Middleware / Route Guards (`middleware.ts`)**
   - **Reason:** Automatically redirect unauthenticated users away from private routes (`/profile/edit`, `/u/...`) on the server before page rendering.

2. **P0 - Automatic Token Refresh Interceptor**
   - **Reason:** Catch `401 Unauthorized` responses caused by expired 15-minute access tokens and automatically hit `POST /api/auth/refresh` using the HTTP-Only cookie.

3. **P1 - Real-Time WebSockets / SSE Notifications**
   - **Reason:** Provide live toast notifications when another user accepts or sends a friend connection.

4. **P1 - Dark / Light Theme Toggle Switcher**
   - **Reason:** Allow users to manually toggle between Day (Light) and Night (Dark) mode interfaces.

5. **P2 - End-to-End UI Testing Suite (Playwright / Cypress)**
   - **Reason:** Automated E2E testing for sign-up, login, profile editing, camera photo capture, and search workflows.

---

## 2. Architecture & Directory Overview

```
frontend/
├── app/                        # Next.js App Router Routes & Views
│   ├── globals.css             # Tailwind v4 imports, CSS variables & keyframe animations
│   ├── layout.tsx              # Root Layout (AuthProvider + Navbar + Footer wrapper)
│   ├── page.tsx                # Home / Dashboard Page (Hero, Stats Grid, Friends List)
│   ├── login/
│   │   └── page.tsx            # Split-screen Login View
│   ├── register/
│   │   └── page.tsx            # Registration View with Password Strength Meter
│   ├── search/
│   │   └── page.tsx            # Member Search with Live Results & Skeletons
│   ├── profile/
│   │   ├── [username]/
│   │   │   └── page.tsx        # Public Profile View
│   │   └── edit/
│   │       └── page.tsx        # Profile Settings (Avatar Upload/Camera + Form)
│   └── u/
│       └── [identifier]/
│           └── page.tsx        # Dedicated Logged-In User Profile View
│
├── components/
│   ├── Navbar.tsx              # Sticky Header Navigation with Search Button & Mobile Drawer
│   └── ui/                     # Reusable Design System Component Library
│       ├── Avatar.tsx          # Circular Avatar Image with Fallback Initials
│       ├── Badge.tsx           # Status & Category Badges
│       ├── Button.tsx          # Multi-variant Button with Loading Spinners
│       ├── Card.tsx            # Surface Container Cards
│       ├── EmptyState.tsx      # Clean Empty State Illustrative Card
│       ├── Input.tsx           # Form Input with Floating Labels & Password Toggle
│       ├── Skeleton.tsx        # Shimmer Loading Placeholder
│       └── Toast.tsx           # Sliding Notification Banners
│
├── context/
│   └── AuthContext.tsx         # Global Authentication Context & LocalStorage Session
├── lib/
│   └── api.ts                  # Type-Safe REST API Fetch Helper (`apiRequest`)
├── public/                     # Static Assets (Logos, SVGs, Favicon)
├── next.config.ts              # Next.js Configuration
└── package.json                # Project Dependencies & Scripts
```

---

## 3. Environment Configuration

The frontend application uses environment variables defined in `.env.local`:

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | `http://localhost:5000/api/auth` | Express Backend REST API Base Endpoint |

---

## 4. App Router Pages & Route Map

| Route Path | Access Level | Description |
| :--- | :--- | :--- |
| `/` | Public / Authenticated | **Dashboard & Landing Page**: Hero banner, network statistics, and recent friends grid. |
| `/login` | Public | **Sign In**: Split-screen form supporting email/username login. |
| `/register` | Public | **Sign Up**: Account creation form with live password strength score. |
| `/search` | Public / Authenticated | **Find Connections**: Search members by username with live cards and friend actions. |
| `/u/[identifier]` | Authenticated / Public | **User Profile**: Dedicated profile view for logged-in users with private details. |
| `/profile/[username]` | Public | **Public Profile**: View public bio, joined date, avatar, and mutual friends. |
| `/profile/edit` | Private (Auth Required) | **Settings**: Two-column profile editor with file upload & camera photo capture. |

---

## 5. Authentication State & API Utility Client

### `lib/api.ts`
The application communicates with the backend via `apiRequest<T>()`:
```typescript
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {},
  token?: string | null
): Promise<T>
```
- **Headers**: Automatically injects `"Content-Type": "application/json"` and `Authorization: Bearer <token>`.
- **Credentials**: Passes `credentials: "include"` to support backend HTTP-Only cookies.

### `context/AuthContext.tsx`
Exposes the `useAuth()` hook providing global access to:
- `user`: Currently authenticated `User` object (or `null`).
- `token`: Short-lived JWT access token string stored in `localStorage`.
- `login(identifier, password)`: Authenticates user and persists token.
- `register(username, email, password)`: Creates new account and logs user in.
- `logout()`: Clears session state and `localStorage`.
- `updateProfile(data)`: Sends `PATCH /api/auth/profile/:username` and updates local state.
- `addFriend(friendUsername)`: Sends `POST /api/auth/friends/:username/:friendUsername` and updates friends list.

---

## 6. Reusable UI Component Library

All visual components are located in `components/ui/` to enforce UI consistency:

```tsx
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Toast } from "@/components/ui/Toast";

// Example Usage
<Card hoverEffect>
  <div className="flex items-center gap-3">
    <Avatar src={user.profilePic} username={user.username} size="md" />
    <div>
      <h3 className="font-bold text-slate-900">@{user.username}</h3>
      <Badge variant="success">Verified</Badge>
    </div>
  </div>
  <Button variant="primary" size="sm" className="mt-4">
    View Profile
  </Button>
</Card>
```

---

## 7. Privacy & Security Rules

1. **Private Contact Information Protection**:
   - Phone Numbers and Physical Addresses are **never** rendered on public or friend profiles.
   - Contact details are displayed **only** when a user views their own personal profile (`isSelf === true`).

2. **JWT Storage**:
   - Access tokens are stored in memory and synchronized with `localStorage` (`accessToken`).
   - Refresh tokens are handled by the browser via HTTP-Only secure cookies.

3. **Client-Side Image Optimization**:
   - Uploaded files and camera snapshots are resized client-side via HTML5 Canvas (max 300x300) before transmission to keep MongoDB documents lightweight.

---

## 8. Getting Started & Development Guide

### Prerequisites
- Node.js 18.x or 20.x installed.
- Express backend running on `http://localhost:5000`.

### Setup Instructions

```bash
# 1. Navigate to the frontend directory
cd C:\Users\kumar\OneDrive\Desktop\Online-Connections\frontend

# 2. Install dependencies
npm install

# 3. Start the Next.js development server
npm run dev

# 4. Open in browser
# http://localhost:3000
```

### Build & Verification Commands

```bash
# Compile optimized production build
npm run build

# Run ESLint validation
npm run lint
```
