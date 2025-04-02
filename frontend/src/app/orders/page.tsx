"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { orderService } from "@/services/orderService";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { format } from "date-fns";

interface Order {
  id: string;
  createdAt: string;
  totalPrice: number;
  status: string;
}

export default function OrdersPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      toast.error("Please log in to view your orders");
      router.push("/login?redirect=/orders");
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

      const response = await orderService.getUserOrders(params);
      setOrders(response.data);
      setTotalPages(response.meta.pages);
    } catch (err) {
      toast.error("Failed to load orders");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user, page, statusFilter, fetchOrders]);

  const getStatusBadgeClass = (status: string): string => {
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

  if (authLoading) {
    return (
      <div className="container mx-auto p-4 flex justify-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-heading">Your Orders</h1>

      {/* Filter */}
      <div className="mb-6">
        <label htmlFor="statusFilter" className="block text-body mb-1">
          Filter by Status
        </label>
        <select
          id="statusFilter"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 border rounded text-body"
        >
          <option value="">All Orders</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-sm text-center">
          <p className="text-body mb-4">You don&apos;t have any orders yet.</p>
          <Link
            href="/products"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-body">
                      {order.id.slice(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-body">
                      {format(new Date(order.createdAt), "MMM d, yyyy")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-body">
                      ${order.totalPrice.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                          order.status
                        )}`}
                      >
                        {order.status.charAt(0).toUpperCase() +
                          order.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/orders/${order.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="mt-8 flex justify-center">
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
