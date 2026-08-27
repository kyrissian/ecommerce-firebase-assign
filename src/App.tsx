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
                <Route
                  path="/manage-products"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <ManageProducts />
                    </ProtectedRoute>
                  }
                />
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
