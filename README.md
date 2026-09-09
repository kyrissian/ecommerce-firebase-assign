# The Daily Haul

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white&style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white&style=flat-square)
![Vite](https://img.shields.io/badge/Vite-B73BFE?logo=vite&logoColor=white&style=flat-square)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?logo=firebase&logoColor=black&style=flat-square)
![Firestore](https://img.shields.io/badge/Firestore-039BE5?logo=firebase&logoColor=white&style=flat-square)
![React Router](https://img.shields.io/badge/React_Router-CA4245?logo=reactrouter&logoColor=white&style=flat-square)
![TanStack Query](https://img.shields.io/badge/TanStack_Query-FF4154?logo=reactquery&logoColor=white&style=flat-square)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white&style=flat-square)

A full-stack e-commerce web app built with React, TypeScript, and Firebase (Authentication + Firestore). Originally built on FakeStoreAPI, then fully migrated to Firebase for product management, user accounts, and order history, and later extended with a complete CI/CD pipeline to Vercel via GitHub Actions.

**Repo:** https://github.com/kyrissian/ecommerce-firebase-assign
**Live App:** https://ecommerce-firebase-assign.vercel.app

---

## Table of Contents

- [Changelog](#changelog)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Firebase Setup](#firebase-setup)
- [CI/CD Pipeline](#cicd-pipeline)
- [Project Structure](#project-structure)
- [Architecture Notes](#architecture-notes)
- [Security](#security)
- [Known Limitations & Design Decisions](#known-limitations--design-decisions)
- [Future Enhancements](#future-enhancements)

---

## Changelog

### 2026-09-09: CI/CD + Reliability Update

- Added a full GitHub Actions CI/CD workflow in `.github/workflows/main.yml`.
- CI now runs deterministic installs (`npm ci`), Jest tests in CI mode, and a full production build.
- CD now deploys to Vercel only after CI succeeds, and only for pushes to `main`.
- Added Vercel secret validation and token fallback support (`VERCEL_TOKEN` preferred, `VERCEL_eCommerce_02` fallback).
- Expanded test coverage with auth-focused edge-case tests for loading states, Firebase error handling, and cleanup behavior.
- Added AuthContext subscription cleanup verification to reduce memory leak risk.
- Introduced route-level lazy loading and vendor chunk splitting to improve initial load performance.

### 2026-09-09: Firebase Migration Completion

- Completed migration from FakeStoreAPI to Firestore for product CRUD.
- Implemented Firebase Authentication register/login/logout flows.
- Added Firestore-backed user profile create/read/update patterns.
- Implemented order creation and order history retrieval from Firestore.
- Added role-gated admin product management route.

---

## Features

### Authentication & User Management

- Register, log in, and log out with Firebase Authentication (email/password)
- Every registration automatically creates a matching Firestore `users` document (role, name, email)
- Role-based access: every new account defaults to `"customer"`; `"admin"` accounts are promoted manually via the Firebase console
- **Role-aware post-login redirect** — admins land on the Manage Products dashboard, customers land on the storefront, with a race-condition-safe check against Firestore (not just cached client state) at the exact moment of login
- Editable profile: display name, address, and phone number, all synced between Firebase Auth and Firestore so the two never drift out of sync
- Change password (with required re-authentication, per Firebase's security requirements)
- Delete account with explicit confirmation, recent-login handling, and best-effort Firestore profile cleanup after successful Auth deletion
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
- Route-level lazy loading with `React.lazy` + `Suspense` so non-home pages load on demand

---

## Tech Stack

| Layer                  | Technology                                                                                                                                                                            |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frontend framework     | React 19 + TypeScript                                                                                                                                                                 |
| Build tool             | Vite                                                                                                                                                                                  |
| Routing                | React Router                                                                                                                                                                          |
| Server state / caching | TanStack Query (React Query) — used for all product/category/order data fetching, with automatic cache invalidation after mutations so admin changes reflect across the app instantly |
| Client state           | React Context + `useReducer` (cart, product list, auth)                                                                                                                               |
| Backend                | Firebase Authentication + Cloud Firestore                                                                                                                                             |
| Styling                | Plain CSS with a shared CSS custom-property design system (`theme.css`) for consistent theming, including dark mode                                                                   |
| Notifications          | react-toastify                                                                                                                                                                        |
| Rating display         | @smastrom/react-rating                                                                                                                                                                |
| CI/CD                  | GitHub Actions (CI test/build gate + CD deploy) + Vercel CLI                                                                                                                          |
| Testing                | Jest, ts-jest, React Testing Library                                                                                                                                                  |

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
3. **Security Rules** — publish your rules in the Firestore Rules tab in the Firebase console. These are the actual enforcement layer — see [Security](#security) below.
4. **Creating an admin account** — register normally through the app, then manually edit that user's Firestore document (`users/{uid}`) and change its `role` field from `"customer"` to `"admin"`.

---

## CI/CD Pipeline

This project uses GitHub Actions for continuous integration and deployment, defined in `.github/workflows/main.yml`.

### Continuous Integration (CI)

Runs on:

- Pushes to `main`
- Pull requests targeting `main`

CI steps:

1. **Install dependencies** — `npm ci` for deterministic installs from `package-lock.json`.
2. **Run tests** — `npm test -- --ci --runInBand`.
3. **Build** — `npm run build` (`tsc -b && vite build`).

If tests fail, the workflow fails and deployment is blocked.

### Continuous Deployment (CD)

Deploy runs only when:

- CI has passed
- Event is a push to `main` (no deploys from pull requests)

CD steps:

1. **Install Vercel CLI**
2. **Validate required secrets** (fails fast with clear guidance)
3. **Pull Vercel environment metadata** — `vercel pull`
4. **Build Vercel artifacts** — `vercel build --prod`
5. **Deploy prebuilt artifacts** — `vercel deploy --prebuilt --prod`

Required GitHub Secrets:

- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- Token: `VERCEL_TOKEN` (preferred) or legacy `VERCEL_eCommerce_02` (fallback)

Vercel's own automatic Git-based deployments are intentionally disabled for this project, so GitHub Actions and its test gate are the only path to production.

### Performance Build Notes

- Route-level splitting is implemented in `src/App.tsx` using dynamic imports.
- Additional vendor chunking is configured in `vite.config.ts` (React, Firebase core/auth/firestore, query, and UI buckets).
- `chunkSizeWarningLimit` is set to 550 kB to reduce near-threshold warning noise after chunk splitting.

### Testing

- **Unit tests**: `ProductCard` (rendering + "Add to Cart" click behavior) and `Cart` (empty state + quantity update behavior), each with `useCart` mocked for isolation.
- **Integration test**: renders the real `CartProvider`, `ProductCard`, and `Cart` together (no mocks) to verify that adding a product from the catalog actually updates the cart state end-to-end.
- **Auth edge-case tests**:
  - `Login` shows friendly Firebase error text on auth failure.
  - `Login` disables submit and shows loading copy while auth request is pending.
  - `Register` shows a specific recovery message if Auth succeeds but Firestore profile setup fails.
  - `AuthProvider` resolves `authLoading` and emits a user-facing toast when profile fetch fails.
  - `AuthProvider` unsubscribes from `onAuthStateChanged` on unmount to protect against memory leaks.

Current suite status: 7 test suites, 16 tests.

Run the suite locally with:

```bash
npm test
```

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
  __tests__/      # Jest unit and integration tests
  __mocks__/      # Manual mocks (e.g. firebaseConfig) used during tests
```

---

## Architecture Notes

- **Provider nesting** in `App.tsx` is deliberate: `AuthProvider` sits above `CartProvider` because the cart context calls `useAuth()` internally to scope each user's cart to their own `uid`.
- **React Query + Context split**: product data fetching (network requests, caching, loading/error states) is handled entirely by React Query; the fetched results are then synced into a lightweight Context/reducer so other parts of the app can read the same product list without re-fetching.
- **URL as state**: search, sort, and category filters on the storefront live in the URL's query string via `useSearchParams`, not local component state — this is what makes filtered views shareable and gives back/forward browser navigation the behavior users expect.
- **Denormalized order data**: each order stores a full snapshot of its items (title, price, image, quantity) rather than references to live product documents, so a customer's order history always reflects what they actually paid — even if a product's price or details change later.
- **Auth/profile race protection**: `AuthContext` guards async profile reads so stale auth callbacks cannot overwrite newer state.
- **Profile/checkout form synchronization**: profile-derived form defaults update safely when async user/profile data arrives, while preserving user edits.

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
- **Account deletion is two-step and best-effort for data consistency.** The app deletes the Auth account first, then attempts Firestore profile cleanup. If profile cleanup fails, login credentials are still removed and the cleanup failure is logged.
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
