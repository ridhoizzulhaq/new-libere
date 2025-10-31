import { usePrivy } from "@privy-io/react-auth";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const { ready, authenticated } = usePrivy();

  // Show loading while Privy is initializing
  if (!ready) {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-900 mx-auto mb-4"></div>
          <p className="text-zinc-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to auth if not authenticated
  if (!authenticated) {
    return <Navigate to="/auth" replace />;
  }

  // Allow access to protected route
  return <Outlet />;
};

export default ProtectedRoute;
