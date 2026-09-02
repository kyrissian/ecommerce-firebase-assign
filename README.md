# The Daily Haul

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white&style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white&style=flat-square)
![Vite](https://img.shields.io/badge/Vite-B73BFE?logo=vite&logoColor=white&style=flat-square)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?logo=firebase&logoColor=black&style=flat-square)
![Firestore](https://img.shields.io/badge/Firestore-039BE5?logo=firebase&logoColor=white&style=flat-square)
![React Router](https://img.shields.io/badge/React_Router-CA4245?logo=reactrouter&logoColor=white&style=flat-square)
![TanStack Query](https://img.shields.io/badge/TanStack_Query-FF4154?logo=reactquery&logoColor=white&style=flat-square)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white&style=flat-square)

A full-stack e-commerce web app built with React, TypeScript, and Firebase (Authentication + Firestore). Originally built on FakeStoreAPI, then fully migrated to Firebase for product management, user accounts, and order history.

**Repo:** https://github.com/kyrissian/ecommerce-firebase-assign

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Firebase Setup](#firebase-setup)
- [Project Structure](#project-structure)
- [Architecture Notes](#architecture-notes)
- [Security](#security)
- [Known Limitations & Design Decisions](#known-limitations--design-decisions)
- [Future Enhancements](#future-enhancements)

---

## Features

### Authentication & User Management

- Register, log in, and log out with Firebase Authentication (email/password)
- Every registration automatically creates a matching Firestore `users` document (role, name, email)
- Role-based access: every new account defaults to `"customer"`; `"admin"` accounts are promoted manually via the Firebase console
- **Role-aware post-login redirect** — admins land on the Manage Products dashboard, customers land on the storefront, with a race-condition-safe check against Firestore (not just cached client state) at the exact moment of login
- Editable profile: display name, address, and phone number, all synced between Firebase Auth and Firestore so the two never drift out of sync
- Change password (with required re-authentication, per Firebase's security requirements) and delete account, with clear messaging if a recent login is required first
- Phone number format validation (`xxx-xxx-xxxx`)

### Product Catalog

- Full product catalog stored in and served from Firestore (migrated off FakeStoreAPI)
- Browsable without logging in
- **Live search** by product title
- **Category filtering**
- **Sorting** by price (low↔high) and rating (low↔high)
- **URL-based filtering & deep linking** — search term, category, and sort order are all stored in the URL's query string (`?search=jacket&category=men's+clothing&sort=price-desc`), so any filtered/sorted view can be bookmarked or shared as a direct link
- Responsive product grid that reflows column count based on available screen width
- Dedicated product detail page (`/products/:id`) with full description and larger imagery, separate from the scannable grid view

### Cart & Checkout

- Add to cart from the product grid or detail page
- Quantity controls and item removal
- **Offline/session cart persistence** — cart contents are saved to `sessionStorage`, scoped per logged-in user (or a shared guest cart), so a page refresh doesn't lose what's in the cart
- Guests can browse and build a cart freely; checkout itself requires login (redirects to `/login` with a toast explaining why)
- Dedicated checkout page, separate from the cart review step, with an order summary and a shipping details form
- Shipping address/phone can be pulled from the user's saved profile and optionally saved back to it after checkout — **dual-storage sync** between Firestore and the app's in-memory auth state, so a saved change is reflected immediately without requiring a page reload or re-login
- Order confirmation screen with the new order's ID

### Order Management

- Every placed order is saved to Firestore with the full list of items (snapshotted at time of purchase, not linked live to current product data), total price, shipping info, and the placing user's ID
- Order History page listing all of a user's past orders, sorted newest-first
- **Expandable order details** — click an order to see item thumbnails, quantities, and per-item pricing without leaving the page or opening a separate view

### Admin Tools (Manage Products)

- Role-gated route (`/manage-products`), enforced both in the UI (`ProtectedRoute`) and at the database level (Firestore Security Rules)
- Full product CRUD: create, edit, and delete products directly against Firestore
- Search and category filtering within the admin product list
- Required-field and format validation on the product form (all fields required, price must be greater than 0, image URL must be a well-formed `http`/`https` link)
- Confirmation prompt before deleting a product

### Polish & UX

- **Light/dark theme toggle**, defaulting to the visitor's OS-level preference on first visit and remembered afterward via `localStorage`
- **Toast notifications** for cart actions (add/remove), successful checkout, and login, using `react-toastify`
- Custom 404 page for unmatched routes
- Sticky navbar with a scroll-to-top button that appears once scrolled
- Fully responsive layout, tested down to narrow mobile widths
- Custom SVG logo and brand identity ("The Daily Haul")

---

## Tech Stack

| Layer                  | Technology                                                                                                                                                                            |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frontend framework     | React 19 + TypeScript                                                                                                                                                                 |
| Build tool             | Vite                                                                                                                                                                                  |
| Routing                | React Router v6                                                                                                                                                                       |
| Server state / caching | TanStack Query (React Query) — used for all product/category/order data fetching, with automatic cache invalidation after mutations so admin changes reflect across the app instantly |
| Client state           | React Context + `useReducer` (cart, product list, auth)                                                                                                                               |
| Backend                | Firebase Authentication + Cloud Firestore                                                                                                                                             |
| Styling                | Plain CSS with a shared CSS custom-property design system (`theme.css`) for consistent theming, including dark mode                                                                   |
| Notifications          | react-toastify                                                                                                                                                                        |
| Rating display         | @smastrom/react-rating                                                                                                                                                                |

---

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm
- A Firebase project with Authentication (Email/Password) and Firestore enabled

### Installation

```bash
git clone https://github.com/kyrissian/ecommerce-firebase-assign.git
cd ecommerce-firebase-assign
npm install
```

### Environment Variables

Create a `.env` file in the project root with your Firebase project's config:

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

These values are available in the Firebase console under Project Settings → General → Your apps.

### Run locally

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Firebase Setup

1. **Authentication** — enable the Email/Password sign-in method.
2. **Firestore** — create a database in production or test mode; three collections are used:
   - `products` — product catalog
   - `users` — one document per registered user, keyed by their Firebase Auth `uid`
   - `orders` — one document per placed order
3. **Security Rules** — publish the rules found in `firestore.rules` (or paste directly into the Firestore Rules tab in the console). These are the actual enforcement layer — see [Security](#security) below.
4. **Creating an admin account** — register normally through the app, then manually edit that user's Firestore document (`users/{uid}`) and change its `role` field from `"customer"` to `"admin"`.

---

## Project Structure

```
src/
  api/            # All Firestore read/write functions (products, orders)
  components/     # Reusable UI (Navbar, ProductCard, ThemeToggle, ProtectedRoute, Logo)
  context/        # React Context providers + hooks (Auth, Cart, Product)
  hooks/          # useTheme (dark mode)
  pages/          # Route-level components (Home, Cart, Checkout, Profile, ManageProducts, etc.)
  styles/         # Shared inline style objects (auth forms) + theme.css design tokens
  types/          # Shared TypeScript types (Product, Order, CartItem, etc.)
  utils/          # Shared helpers (validators, price calculations)
```

---

## Architecture Notes

- **Provider nesting** in `App.tsx` is deliberate: `AuthProvider` sits above `CartProvider` because the cart context calls `useAuth()` internally to scope each user's cart to their own `uid`.
- **React Query + Context split**: product data fetching (network requests, caching, loading/error states) is handled entirely by React Query; the fetched results are then synced into a lightweight Context/reducer so other parts of the app can read the same product list without re-fetching.
- **URL as state**: search, sort, and category filters on the storefront live in the URL's query string via `useSearchParams`, not local component state — this is what makes filtered views shareable and gives back/forward browser navigation the behavior users expect.
- **Denormalized order data**: each order stores a full snapshot of its items (title, price, image, quantity) rather than references to live product documents, so a customer's order history always reflects what they actually paid — even if a product's price or details change later.

---

## Security

Role-based access control is enforced in two layers:

1. **UI layer** — `ProtectedRoute` redirects non-admin users away from `/manage-products`.
2. **Database layer (the real security boundary)** — Firestore Security Rules independently verify, on Google's servers, that:
   - Anyone can read products; only accounts with `role: "admin"` in their Firestore document can create, edit, or delete them.
   - A user can read and update their own `users` document, but **cannot modify their own `role` field** — preventing self-promotion to admin by writing directly to Firestore and bypassing the app's UI entirely.
   - A user can create orders only for themselves, and can only read orders where they are the owner. Orders cannot be updated or deleted once placed.

These rules were manually verified by attempting a direct, UI-bypassing Firestore write from the browser console while logged in as a non-admin account, confirming the request was rejected with "Missing or insufficient permissions" — not just blocked by front-end logic.

---

## Known Limitations & Design Decisions

A few deliberate tradeoffs, made with reasoning rather than by accident:

- **Product images are linked, not hosted.** Image URLs for the original seeded catalog still point to FakeStoreAPI's CDN rather than Firebase Storage. All product _data_ — including the image field itself — lives fully in Firestore, satisfying the migration requirement; only the binary image files remain externally hosted. A production version of this app would upload images to Firebase Storage for full independence.
- **Order history is sorted client-side**, not via a Firestore `orderBy` query. Combining our existing `where(userId == ...)` filter with `orderBy` would require creating a composite index in the Firebase console. Given the small number of orders per user, sorting the already-fetched list in JavaScript avoids that extra setup step with no meaningful performance cost at this scale.
- **Deleting an account only removes the Firebase Auth login.** The matching Firestore `users` document is intentionally retained (blocked from deletion by Security Rules) — a common practice in production systems for legal/audit record-keeping even after account closure.
- **Cart persistence is session-scoped by design.** Using `sessionStorage` (rather than `localStorage`) means a cart is intentionally tied to a single browser tab/session, not preserved indefinitely across devices or browser restarts.

---

## Future Enhancements

Out of scope for this assignment, but worth noting as a "next steps" list:

- Migrate all product images to Firebase Storage for full hosting independence
- Product reviews and user-submitted ratings (currently seeded/mock rating data)
- Search across product descriptions, not just titles
- Wishlist / saved-for-later items
- Real payment processing integration
- Shipping cost calculation
- Categories as their own Firestore collection, rather than derived from product data
- Admin analytics dashboard (sales totals, inventory trends)
- Inventory/stock-level tracking
- Order status tracking, cancellations, and refunds
- Email confirmations for orders and account changes
- Pagination for the product catalog and admin list, should the catalog grow into the thousands
- Firestore composite index + server-side `orderBy` for order history, if order volume per user grows significantly
