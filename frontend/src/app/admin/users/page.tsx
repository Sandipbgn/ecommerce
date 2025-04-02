"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { dashboardService } from "@/services/dashboardService";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { format } from "date-fns";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  _count?: {
    orders?: number;
  };
}

export default function AdminUsersPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      toast.error("You don't have access to this page");
      router.push("/");
    }
  }, [user, authLoading, router]);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
      };

      const response = await dashboardService.getAllUsers(params);
      setUsers(response.data);
      setTotalPages(response.meta.pages || 1);
    } catch (err) {
      console.error("Error fetching users:", err);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    if (user && user.role === "admin") {
      fetchUsers();
    }
  }, [user, page, fetchUsers]);

  if (authLoading || loading) {
    return (
      <div className="container mx-auto p-4 flex justify-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-heading">User Management</h1>
        <Link href="/admin/dashboard" className="text-blue-600 hover:underline">
          Back to Dashboard
        </Link>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Orders
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-body">
                      {user.id.slice(0, 8)}...
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-body">
                      {user.name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-body">
                      {user.email}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-body">
                      <span
                        className={
                          user.role === "admin"
                            ? "bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs"
                            : ""
                        }
                      >
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-body">
                      {format(new Date(user.createdAt), "MMM d, yyyy")}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-body">
                      {user._count?.orders || 0}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-4 text-center text-sm text-muted"
                  >
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <nav className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className={`px-4 py-2 rounded ${
                page === 1
                  ? "bg-gray-200 text-gray-500"
                  : "bg-blue-600 text-white"
              }`}
            >
              Previous
            </button>
            <span className="mx-4 text-body">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => (p < totalPages ? p + 1 : p))}
              disabled={page >= totalPages}
              className={`px-4 py-2 rounded ${
                page >= totalPages
                  ? "bg-gray-200 text-gray-500"
                  : "bg-blue-600 text-white"
              }`}
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}
