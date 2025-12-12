import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { Loader2 } from "lucide-react";
import api from "@/lib/api";

// ProtectedRoute: Only accessible when logged in and token is valid
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setIsAuthenticated(false);
        setIsChecking(false);
        return;
      }

      try {
        // Verify token with backend using the auth verify endpoint
        await api.get('/auth/verify');
        setIsAuthenticated(true);
      } catch (error) {
        // Token is invalid or expired
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        setIsAuthenticated(false);
      } finally {
        setIsChecking(false);
      }
    };

    verifyToken();
  }, []);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// PublicRoute: Redirects to dashboard if already logged in and token is valid
export function PublicRoute() {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setIsAuthenticated(false);
        setIsChecking(false);
        return;
      }

      try {
        // Verify token with backend using the auth verify endpoint
        await api.get('/auth/verify');
        setIsAuthenticated(true);
      } catch (error) {
        // Token is invalid or expired
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        setIsAuthenticated(false);
      } finally {
        setIsChecking(false);
      }
    };

    verifyToken();
  }, []);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
