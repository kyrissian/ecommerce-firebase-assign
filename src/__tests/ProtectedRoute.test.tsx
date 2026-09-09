import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import type { AuthContextType } from "../context/authContextInstance";

let mockAuthValue: Partial<AuthContextType>;

jest.mock("../context/useAuth", () => ({
  useAuth: () => mockAuthValue,
}));

const renderProtectedRoute = () =>
  render(
    <MemoryRouter initialEntries={["/manage-products"]}>
      <Routes>
        <Route
          path="/manage-products"
          element={
            <ProtectedRoute requiredRole="admin">
              <div>Admin Dashboard</div>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/" element={<div>Home Page</div>} />
      </Routes>
    </MemoryRouter>,
  );

describe("ProtectedRoute", () => {
  test("shows a loading state while auth is still resolving", () => {
    mockAuthValue = { user: null, profile: null, authLoading: true };
    renderProtectedRoute();

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  test("redirects to /login when there is no logged-in user", () => {
    mockAuthValue = { user: null, profile: null, authLoading: false };
    renderProtectedRoute();

    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });

  test("redirects to / when the user's role doesn't match the required role", () => {
    mockAuthValue = {
      user: { uid: "123" } as AuthContextType["user"],
      profile: { role: "customer" },
      authLoading: false,
    };
    renderProtectedRoute();

    expect(screen.getByText("Home Page")).toBeInTheDocument();
  });

  test("renders the protected content when the role matches", () => {
    mockAuthValue = {
      user: { uid: "123" } as AuthContextType["user"],
      profile: { role: "admin" },
      authLoading: false,
    };
    renderProtectedRoute();

    expect(screen.getByText("Admin Dashboard")).toBeInTheDocument();
  });
});
