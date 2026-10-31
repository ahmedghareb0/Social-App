import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import Loading from "../Components/Loading";

export default function Authlayout() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <Loading label="Restoring your session..." />;
  if (isAuthenticated) return <Navigate to="/" replace />;

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <Outlet />
      </div>
    </div>
  );
}
