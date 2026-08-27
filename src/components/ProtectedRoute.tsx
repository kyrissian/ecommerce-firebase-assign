import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  /** The role required to view this route, e.g. "admin". */
  requiredRole: string;
}

/**
 * Wraps a route's element and only renders it if the logged-in user's
 * Firestore profile has the required role. Otherwise, redirects them
 * elsewhere -- to login if they're not logged in at all, or to home
 * if they're logged in but lack the right role.
 *
 * Reusable for any future role-gated route, not just /manage-products --
 * usage: <ProtectedRoute requiredRole="admin"><SomePage /></ProtectedRoute>
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const { user, profile, authLoading } = useAuth();

  // Firebase hasn't told us the real auth state yet -- show nothing
  // (or a spinner) rather than guessing and redirecting prematurely.
  // Without this check, a logged-in admin could get briefly, incorrectly
  // redirected before Firebase finishes confirming who they are.
  if (authLoading) {
    return <p>Loading...</p>;
  }

  // Not logged in at all -- redirect to login.
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Logged in, but their role doesn't match what's required -- redirect
  // to home instead of showing an error page, since this is a routine
  // "you don't belong here" case, not a broken-app scenario.
  if (profile?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  // Passed both checks -- render the actual protected page.
  return <>{children}</>;
};

export default ProtectedRoute;
