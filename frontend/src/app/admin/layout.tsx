"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
// Style utilities for consistent rendering

import {
  FaTachometerAlt,
  FaShoppingCart,
  FaBox,
  FaUsers,
  FaChevronRight,
} from "react-icons/fa";
import { toast } from "react-hot-toast";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      toast.error("You don't have access to the admin area");
      router.push("/");
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="container mx-auto p-4 flex justify-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return null; // Will redirect in useEffect
  }

  const navigation = [
    { name: "Dashboard", href: "/admin/dashboard", icon: FaTachometerAlt },
    { name: "Orders", href: "/admin/orders", icon: FaShoppingCart },
    { name: "Products", href: "/admin/products", icon: FaBox },
    { name: "Users", href: "/admin/users", icon: FaUsers },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-gray-100 border-b">
        <div className="container mx-auto py-2 px-4">
          <div className="flex items-center text-sm text-muted">
            <Link href="/" className="hover:text-blue-600">
              Home
            </Link>
            <FaChevronRight className="mx-2 text-xs" />
            <Link href="/admin/dashboard" className="hover:text-blue-600">
              Admin
            </Link>

            {pathname !== "/admin/dashboard" && (
              <>
                <FaChevronRight className="mx-2 text-xs" />
                <span className="text-body">
                  {navigation.find((item) => pathname.startsWith(item.href))
                    ?.name || "Page"}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto flex-grow flex flex-col md:flex-row">
        {/* Sidebar */}
        <div className="md:w-64 bg-white shadow-sm p-4 md:min-h-screen">
          <h2 className="text-xl font-bold mb-6 text-heading">Admin Panel</h2>
          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-body hover:bg-gray-50"
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 ${
                      isActive ? "text-blue-500" : "text-gray-400"
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1 p-4">{children}</div>
      </div>
    </div>
  );
}
