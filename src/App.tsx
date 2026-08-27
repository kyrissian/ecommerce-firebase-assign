import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import "bootstrap/dist/css/bootstrap.min.css";
import { ProductProvider } from "./context/ProductContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import Cart from "./pages/Cart";
import Logout from "./pages/Logout";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Navbar from "./components/Navbar/Navbar";
import ManageProducts from "./pages/ManageProducts";
import ProtectedRoute from "./components/ProtectedRoute";
import OrderHistory from "./pages/OrderHistory";

/**
 * Root component. Sets up global providers and all app routes.
 *
 * Provider nesting order matters here, since inner providers can use
 * hooks from outer ones:
 * - QueryClientProvider wraps everything, since both product and order
 *   data fetching (via React Query) are used throughout the app.
 * - AuthProvider must sit above CartProvider, because CartContext calls
 *   useAuth() internally (to scope each user's cart to their own uid
 *   in sessionStorage) -- if the nesting were reversed, that hook call
 *   would fail since there'd be no AuthContext above it yet.
 * - ProductProvider doesn't depend on Auth or Cart, so its exact
 *   position relative to them isn't critical, but it's kept as the
 *   outermost app-specific provider for consistency.
 */
function App() {
  const client = new QueryClient();
  return (
    <QueryClientProvider client={client}>
      <ProductProvider>
        <AuthProvider>
          <CartProvider>
            <BrowserRouter>
              <Navbar />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/logout" element={<Logout />} />
                <Route path="/cart" element={<Cart />} />

                {/* Admin-only: ProtectedRoute redirects anyone whose
                    Firestore profile role isn't "admin" back to home. */}
                <Route
                  path="/manage-products"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <ManageProducts />
                    </ProtectedRoute>
                  }
                />

                {/* Not wrapped in ProtectedRoute -- OrderHistory handles
                    its own "must be logged in" check internally, since
                    any logged-in user (not just admins) can view their
                    own order history. */}
                <Route path="/orders" element={<OrderHistory />} />
              </Routes>
            </BrowserRouter>
          </CartProvider>
        </AuthProvider>
      </ProductProvider>
    </QueryClientProvider>
  );
}

export default App;
