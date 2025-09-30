"use client"
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import apiClient from "@/lib/axios";

// Shape of what your backend returns inside data (without password) + token
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  token: string; // from controller's `data.token`
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const UNPROTECTED_ROUTES = ["/signin", "/signup"];

interface Props {
  children: ReactNode;
}

export function AuthProvider({ children }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    try {
      // Only access localStorage on client side
      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        }
      }
    } catch (error) {
      console.log("Error loading user from localStorage:", error);
      if (typeof window !== 'undefined') {
        localStorage.clear();
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (loading) return;
    
    const isUnprotected = UNPROTECTED_ROUTES.includes(pathname);
    
    if (!user && !isUnprotected) {
      router.push("/signin");
    }
    if (user && isUnprotected) {
      router.push("/");
    }
  }, [user, loading, pathname, router]);

  const login = async (email: string, password: string) => {
    try {
      if (!email || !password) {
        return { success: false, error: "Email and password are required" };
      }

      // API request to backend
      const res = await apiClient.post("/auth/login", { email, password });

      if (!res.data?.success) {
        return { success: false, error: res.data?.message || "Login failed" };
      }

      // Expecting: { success: true, data: { ...userWithoutPassword, token } }
      const data = res.data.data as User;
      const nextUser: User = { ...data, token: data.token };

      setUser(nextUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem("user", JSON.stringify(nextUser));
        localStorage.setItem("access_token", data.token);
      }

      router.push("/");
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.message || err.message || "Network error" };
    }
  };

  const logout = () => {
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
    router.push("/signin");
  };

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    return {
      user: null,
      loading: false,
      isAuthenticated: false,
      login: async () => ({ success: false, error: "AuthProvider not available" }),
      logout: () => {},
    };
  }
  return ctx;
}
