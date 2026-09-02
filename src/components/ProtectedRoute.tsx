import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const { user, profile, authLoading } = useAuth();

  if (authLoading) {
    return <p>Loading...</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (profile?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
