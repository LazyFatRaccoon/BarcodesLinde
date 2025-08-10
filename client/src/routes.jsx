import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./context/authContext";

export const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="p-6">Loading…</div>;
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};
