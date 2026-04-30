import React, { useEffect, useState, ComponentType } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// Higher-order component for protecting routes
const withAuth = <P extends object>(Component: ComponentType<P>) => {
  const AuthComponent: React.FC<P> = (props) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isAuth, setIsAuth] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
      const checkAuth = () => {
        // Check for token in localStorage
        const token = localStorage.getItem("token");

        if (token && token.trim() !== "") {
          // Token exists and is not empty, user is authenticated
          setIsAuth(true);
          setIsLoading(false);
        } else {
          // No valid token found, redirect to login immediately
          setIsAuth(false);
          setIsLoading(false);

          // Only redirect if not already on an auth page
          if (
            location.pathname !== "/login" &&
            location.pathname !== "/create-user" &&
            location.pathname !== "/forgot-password"
          ) {
            navigate("/login", {
              replace: true,
              state: { from: location.pathname },
            });
          }
        }
      };

      checkAuth();

      // Set up a listener for storage changes (in case token is removed in another tab)
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === "token") {
          checkAuth();
        }
      };

      window.addEventListener("storage", handleStorageChange);

      return () => {
        window.removeEventListener("storage", handleStorageChange);
      };
    }, [navigate, location]);

    // Show loading state while checking authentication
    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Verifying authentication...</p>
          </div>
        </div>
      );
    }

    // If not authenticated, show nothing (user will be redirected or is on login page)
    if (!isAuth) {
      return null;
    }

    // User is authenticated, render the protected component
    return <Component {...props} />;
  };

  // Set display name for better debugging
  AuthComponent.displayName = `withAuth(${
    Component.displayName || Component.name
  })`;

  return AuthComponent;
};

export default withAuth;
