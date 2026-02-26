import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, authLoading } = useAuth();

  if (authLoading) {
    return <div className="text-center mt-20">Checking authentication...</div>;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
}