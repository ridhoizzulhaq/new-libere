import { usePrivy } from "@privy-io/react-auth";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const { ready, authenticated } = usePrivy();

  if (!ready) {
    return <div>loading...</div>;
  }

  if (!authenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (authenticated) {
    return <Navigate to="/libraries" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
