"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import axios from "axios";
import { api } from "@/lib/axios";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if user data exists in localStorage
        const storedUser = localStorage.getItem("user");
        const storedToken = localStorage.getItem("token");

        if (storedUser && storedToken) {
          const userData = JSON.parse(storedUser);

          // Set the user data
          setUser(userData);

          // Update the axios instance with the token
          api.defaults.headers.common.Authorization = `Bearer ${storedToken}`;
        }
      } catch (err) {
        console.error("Auth check error:", err);
        // Clear localStorage in case of errors
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post("/user/login", { email, password });
      const userData = response.data.data;

      // Save user data to state and localStorage
      setUser({
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
      });

      localStorage.setItem(
        "user",
        JSON.stringify({
          id: userData.id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
        })
      );
      localStorage.setItem("token", userData.token);

      // Set token for future requests
      api.defaults.headers.common.Authorization = `Bearer ${userData.token}`;

      return userData;
    } catch (error) {
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await api.post("/user/register", {
        name,
        email,
        password,
      });
      const userData = response.data.data;

      // Save user data to state and localStorage
      setUser({
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
      });

      localStorage.setItem(
        "user",
        JSON.stringify({
          id: userData.id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
        })
      );
      localStorage.setItem("token", userData.token);

      // Set token for future requests
      api.defaults.headers.common.Authorization = `Bearer ${userData.token}`;

      return userData;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    delete api.defaults.headers.common.Authorization;
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
