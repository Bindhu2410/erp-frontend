import React, { useEffect, useState, ComponentType } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// Higher-order component for protecting admin-only routes
const withAdminAuth = <P extends object>(Component: ComponentType<P>) => {
  const AdminAuthComponent: React.FC<P> = (props) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isAuth, setIsAuth] = useState<boolean>(false);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
      const checkAuth = () => {
        // Check for token in localStorage
        const token = localStorage.getItem("token");

        if (!token || token.trim() === "") {
          // No valid token found, redirect to login
          setIsAuth(false);
          setIsLoading(false);
          navigate("/login", {
            replace: true,
            state: { from: location.pathname },
          });
          return;
        }

        // Check if user is admin
        let roleName = "";
        try {
          const roleDtoStr = localStorage.getItem("roleDto");
          if (roleDtoStr) {
            const roleDto = JSON.parse(roleDtoStr);
            roleName = roleDto.roleName;
          }
        } catch (e) {
          roleName = "";
        }

        const userIsAdmin = roleName === "Administrator" || roleName === "Admin"|| roleName === "Finance Department";

        if (!userIsAdmin) {
          // User is authenticated but not admin, show access denied or redirect to login
          setIsAuth(false);
          setIsLoading(false);
          navigate("/login", { replace: true });
          return;
        }

        // User is authenticated and is admin
        setIsAuth(true);
        setIsAdmin(true);
        setIsLoading(false);
      };

      checkAuth();

      // Set up a listener for storage changes
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === "token" || e.key === "roleDto") {
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
            <p className="mt-4 text-gray-600">Verifying access...</p>
          </div>
        </div>
      );
    }

    // If not authenticated or not admin, show nothing (user will be redirected)
    if (!isAuth || !isAdmin) {
      return null;
    }

    // User is authenticated and is admin, render the protected component
    return <Component {...props} />;
  };

  // Set display name for better debugging
  AdminAuthComponent.displayName = `withAdminAuth(${
    Component.displayName || Component.name
  })`;

  return AdminAuthComponent;
};

export default withAdminAuth;