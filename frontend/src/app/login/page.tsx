"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message: string;
}

// Wrapper component that uses searchParams
function LoginContent() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, login } = useAuth();

  // Get redirect URL from query params
  const redirectUrl = searchParams.get("redirect") || "/";

  useEffect(() => {
    // If user is already logged in, redirect immediately
    if (user) {
      router.push(redirectUrl);
    }
  }, [user, router, redirectUrl]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      await login(formData.email, formData.password);
      toast.success("Login successful!");

      // Add a parameter to indicate redirect from login when going back to product
      router.push(redirectUrl);
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{" "}
            <Link
              href="/register"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              create a new account
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-blue-400"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-gray-600">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-blue-600 hover:text-blue-500"
            >
              Sign up
            </Link>
          </p>
          <p className="text-gray-600 mt-2">
            Forgot your password?{" "}
            <Link
              href="/forgot-password"
              className="text-blue-600 hover:text-blue-500"
            >
              Reset it here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
