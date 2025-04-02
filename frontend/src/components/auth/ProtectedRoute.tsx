'use client';

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({
  children,
}: ProtectedRouteProps) {
  const { user, loading } = useAuth(); // Using user instead of isAuthenticated
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      // User is not authenticated, redirect to login
      router.push("/login");
    }
  }, [user, loading, router]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If not loading and we have a user, render the children
  // If not loading and no user, this will still render briefly before the redirect happens
  return user ? <>{children}</> : null;
}