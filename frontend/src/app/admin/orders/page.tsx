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
}

interface Order {
  id: string;
  userId: string;
  totalPrice: number;
  status: "pending" | "paid" | "shipped" | "delivered" | "cancelled";
  createdAt: string;
  user?: User;
}

export default function AdminOrdersPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      toast.error("You don't have access to this page");
      router.push("/");
    }
  }, [user, authLoading, router]);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        ...(statusFilter && { status: statusFilter }),
      };

      const response = await dashboardService.getAllOrders(params);
      setOrders(response.data);
      setTotalPages(response.meta.pages || 1);
    } catch (err) {
      console.error("Error fetching orders:", err);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);
  useEffect(() => {
    if (user && user.role === "admin") {
      fetchOrders();
    }
  }, [user, page, statusFilter, fetchOrders]);

  const updateOrderStatus = async (id: string, status: string) => {
    try {
      setProcessing(id);
      await dashboardService.updateOrderStatus(id, status);
      toast.success(`Order status updated to ${status}`);
      fetchOrders();
    } catch (err) {
      console.error("Error updating order status:", err);
      toast.error("Failed to update order status");
    } finally {
      setProcessing(null);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "paid":
        return "bg-green-100 text-green-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "delivered":
        return "bg-indigo-100 text-indigo-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

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
        <h1 className="text-2xl font-bold text-heading">Order Management</h1>
        <Link href="/admin/dashboard" className="text-blue-600 hover:underline">
          Back to Dashboard
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label
              htmlFor="statusFilter"
              className="block text-sm text-muted mb-1"
            >
              Filter by Status
            </label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 border rounded text-body min-w-[150px]"
            >
              <option value="">All Orders</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <button
            onClick={() => {
              setStatusFilter("");
              setPage(1);
            }}
            className="text-blue-600 hover:underline text-sm mt-6"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-body">
                      {order.id.slice(0, 8)}...
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-body">
                      {order.user?.name || "Unknown"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-body">
                      {format(new Date(order.createdAt), "MMM d, yyyy")}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-body">
                      ${order.totalPrice.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                          order.status
                        )}`}
                      >
                        {order.status.charAt(0).toUpperCase() +
                          order.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                      <div className="flex justify-end items-center gap-2">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </Link>
                        <div className="relative">
                          <select
                            disabled={processing === order.id}
                            onChange={(e) => {
                              if (
                                e.target.value &&
                                e.target.value !== order.status
                              ) {
                                updateOrderStatus(order.id, e.target.value);
                              }
                            }}
                            defaultValue=""
                            className="text-sm border rounded py-1 pl-2 pr-8 text-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="" disabled>
                              Update Status
                            </option>
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                          {processing === order.id && (
                            <div className="absolute right-2 top-2">
                              <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-4 text-center text-sm text-muted"
                  >
                    No orders found
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
