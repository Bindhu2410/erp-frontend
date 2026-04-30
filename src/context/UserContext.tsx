import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface User {
  userId: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  dateCreated: string;
  failedLoginAttempts: number;
  isActive: boolean;
  isLocked: boolean;
  lastLoginDate: string | null;
  lastPasswordChangeDate: string | null;
  notes: string | null;
  phoneNumber: string | null;
  preferredLanguage: string;
  profileImageUrl: string | null;
  requirePasswordChange: boolean;
  timeZone: string;
  twoFactorEnabled: boolean;
}

interface Role {
  roleId: number;
  roleName: string;
  description: string;
  isSystemRole: boolean;
  dateCreated: string;
  createdBy: number;
  createdByUsername: string;
  isActive: boolean;
}

interface UserContextType {
  user: User | null;
  role: Role | null;
  setUser: (user: User | null) => void;
  setRole: (role: Role | null) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [role, setRole] = useState<Role | null>(() => {
    const savedRole = localStorage.getItem("roleDto");
    return savedRole ? JSON.parse(savedRole) : null;
  });

  // Always keep 'user' and 'roleDto' in sync with state
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  // Sync context with localStorage changes (e.g., from other tabs)
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === "user") {
        const newUser = event.newValue ? JSON.parse(event.newValue) : null;
        setUser(newUser);
      }
      if (event.key === "roleDto") {
        const newRole = event.newValue ? JSON.parse(event.newValue) : null;
        setRole(newRole);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => {
    if (role) {
      localStorage.setItem("roleDto", JSON.stringify(role));
    } else {
      localStorage.removeItem("roleDto");
    }
  }, [role]);

  const logout = () => {
    setUser(null);
    setRole(null);
    localStorage.removeItem("user");
    localStorage.removeItem("roleDto");
    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
    // Clean up any other auth-related state here
  };

  return (
    <UserContext.Provider value={{ user, role, setUser, setRole, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
