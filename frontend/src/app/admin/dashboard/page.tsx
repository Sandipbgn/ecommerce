"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { dashboardService } from "@/services/dashboardService";
import {
  FaBoxOpen,
  FaShoppingCart,
  FaDollarSign,
  FaExclamationTriangle,
} from "react-icons/fa";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { DashboardData } from "@/types/dashboard";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      toast.error("You don't have access to this page");
      router.push("/");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && user.role === "admin") {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await dashboardService.getSalesAnalytics();
      setDashboardData(response.data);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
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
      <h1 className="text-2xl font-bold mb-6 text-heading">Admin Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-muted text-sm">Total Sales</p>
              <p className="text-2xl font-bold text-heading">
                ${dashboardData?.totalSales?.toFixed(2) || "0.00"}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <FaDollarSign className="text-blue-500 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-muted text-sm">Total Products</p>
              <p className="text-2xl font-bold text-heading">
                {dashboardData?.inventory?.totalProducts || 0}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <FaBoxOpen className="text-green-500 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-purple-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-muted text-sm">Orders</p>
              <p className="text-2xl font-bold text-heading">
                {dashboardData?.salesByStatus?.reduce(
                  (total, item) => total + item._count._all,
                  0
                ) || 0}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <FaShoppingCart className="text-purple-500 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-yellow-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-muted text-sm">Low Stock Products</p>
              <p className="text-2xl font-bold text-heading">
                {dashboardData?.inventory?.lowStockProducts?.length || 0}
              </p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <FaExclamationTriangle className="text-yellow-500 text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Orders by Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h2 className="text-lg font-semibold mb-4 text-heading">
            Orders by Status
          </h2>

          <div className="space-y-2">
            {dashboardData?.salesByStatus?.map((statusGroup) => (
              <div
                key={statusGroup.status}
                className="flex justify-between items-center"
              >
                <div className="flex items-center">
                  <div
                    className={`w-3 h-3 rounded-full mr-2 ${
                      statusGroup.status === "pending"
                        ? "bg-yellow-500"
                        : statusGroup.status === "paid"
                        ? "bg-green-500"
                        : statusGroup.status === "shipped"
                        ? "bg-blue-500"
                        : statusGroup.status === "delivered"
                        ? "bg-indigo-500"
                        : "bg-red-500"
                    }`}
                  ></div>
                  <span className="text-body capitalize">
                    {statusGroup.status}
                  </span>
                </div>
                <div className="flex gap-4">
                  <span className="text-body">
                    {statusGroup._count._all} orders
                  </span>
                  <span className="text-body font-semibold">
                    ${statusGroup._sum.totalPrice?.toFixed(2) || "0.00"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Products */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-heading">
              Low Stock Products
            </h2>
            <Link
              href="/admin/products"
              className="text-blue-600 text-sm hover:underline"
            >
              View All
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Product
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Stock
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Price
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dashboardData?.inventory?.lowStockProducts?.map((product) => (
                  <tr key={product.id}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-body">
                      {product.name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-body">
                      <span
                        className={`${
                          product.stock <= 0
                            ? "text-red-600"
                            : "text-yellow-600"
                        }`}
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-body">
                      ${product.price.toFixed(2)}
                    </td>
                  </tr>
                ))}

                {!dashboardData?.inventory?.lowStockProducts?.length && (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-4 py-3 text-sm text-center text-muted"
                    >
                      No low stock products
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-heading">Recent Orders</h2>
          <Link
            href="/admin/orders"
            className="text-blue-600 text-sm hover:underline"
          >
            View All Orders
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Order ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Amount
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dashboardData?.recentOrders?.map((order) => (
                <tr key={order.id}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-body">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {order.id.slice(0, 8)}...
                    </Link>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-body">
                    {order.user?.name}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-body">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-body">
                    ${order.totalPrice.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        order.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : order.status === "paid"
                          ? "bg-green-100 text-green-800"
                          : order.status === "shipped"
                          ? "bg-blue-100 text-blue-800"
                          : order.status === "delivered"
                          ? "bg-indigo-100 text-indigo-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {order.status.charAt(0).toUpperCase() +
                        order.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}

              {!dashboardData?.recentOrders?.length && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-3 text-sm text-center text-muted"
                  >
                    No recent orders
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
