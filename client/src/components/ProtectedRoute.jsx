import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Guards a route. Pass `role="admin"` to also require a specific role —
 * a logged-in student hitting an admin-only route gets bounced to their
 * own home instead of seeing a blank/broken page.
 */
export default function ProtectedRoute({ role }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-obsidian">
        <p className="font-mono text-sm text-muted tracking-wide">Checking your session…</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (role && user.role !== role) {
    return <Navigate to={user.role === "admin" ? "/admin" : "/lessons"} replace />;
  }

  return <Outlet />;
}
