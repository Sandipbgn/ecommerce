"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { orderService } from "@/services/orderService";
import { dashboardService } from "@/services/dashboardService";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { format } from "date-fns";

export default function AdminOrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      toast.error("You don't have access to this page");
      router.push("/");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && user.role === "admin" && id) {
      fetchOrderDetails();
    }
  }, [user, id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await orderService.getOrderById(id);
      setOrder(response.data);
    } catch (err) {
      console.error("Error fetching order details:", err);
      toast.error("Failed to load order details");
      router.push("/admin/orders");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (status) => {
    try {
      setProcessing(true);
      await dashboardService.updateOrderStatus(id, status);
      toast.success(`Order status updated to ${status}`);
      fetchOrderDetails();
    } catch (err) {
      console.error("Error updating order status:", err);
      toast.error("Failed to update order status");
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadgeClass = (status) => {
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

  if (!order) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Error</h2>
          <p>Order not found</p>
          <Link
            href="/admin/orders"
            className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <Link
          href="/admin/orders"
          className="text-blue-600 hover:underline flex items-center"
        >
          &larr; Back to Orders
        </Link>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-heading mb-1">
              Order Details
            </h1>
            <p className="text-muted">Order ID: {order.id}</p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-3">
            <span
              className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                order.status
              )}`}
            >
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>

            <div className="relative">
              <select
                disabled={processing}
                onChange={(e) => {
                  if (e.target.value && e.target.value !== order.status) {
                    updateOrderStatus(e.target.value);
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
              {processing && (
                <div className="absolute right-2 top-2">
                  <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h2 className="font-semibold text-heading mb-3">
              Customer Information
            </h2>
            {order.user ? (
              <div className="space-y-1">
                <p className="text-body">
                  <span className="text-muted">Name:</span> {order.user.name}
                </p>
                <p className="text-body">
                  <span className="text-muted">Email:</span> {order.user.email}
                </p>
              </div>
            ) : (
              <p className="text-body">No customer information available</p>
            )}
          </div>

          <div>
            <h2 className="font-semibold text-heading mb-3">
              Order Information
            </h2>
            <div className="space-y-1">
              <p className="text-body">
                <span className="text-muted">Date Placed:</span>{" "}
                {format(new Date(order.createdAt), "MMMM d, yyyy 'at' h:mma")}
              </p>
              <p className="text-body">
                <span className="text-muted">Total:</span> $
                {order.totalPrice.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-b py-4 mb-4">
          <h2 className="font-semibold text-heading mb-3">
            Payment Information
          </h2>
          {order.payments && order.payments.length > 0 ? (
            order.payments.map((payment) => (
              <div key={payment.id} className="mb-4">
                <p className="text-body">
                  <span className="text-muted">Payment ID:</span> {payment.id}
                </p>
                <p className="text-body">
                  <span className="text-muted">Status:</span>{" "}
                  <span
                    className={
                      payment.status === "completed"
                        ? "text-green-600"
                        : payment.status === "pending"
                        ? "text-yellow-600"
                        : "text-red-600"
                    }
                  >
                    {payment.status.charAt(0).toUpperCase() +
                      payment.status.slice(1)}
                  </span>
                </p>
                <p className="text-body">
                  <span className="text-muted">Amount:</span> $
                  {payment.amount.toFixed(2)}
                </p>
                <p className="text-body">
                  <span className="text-muted">Date:</span>{" "}
                  {format(
                    new Date(payment.createdAt),
                    "MMMM d, yyyy 'at' h:mma"
                  )}
                </p>
                {payment.transactionId && (
                  <p className="text-body">
                    <span className="text-muted">Transaction ID:</span>{" "}
                    {payment.transactionId}
                  </p>
                )}
              </div>
            ))
          ) : (
            <p className="text-body">No payment information available</p>
          )}
        </div>

        {/* Order Items */}
        <div className="mb-6">
          <h2 className="font-semibold text-heading mb-4">Order Items</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {item.product?.imageUrl && (
                            <img
                              src={item.product.imageUrl}
                              alt={item.product.name}
                              className="h-10 w-10 rounded-full mr-3 object-cover"
                            />
                          )}
                          <div>
                            <div className="text-sm font-medium text-body">
                              {item.product?.name || "Product"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-right text-body">
                        ${(item.price || 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-right text-body">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-right text-body">
                        ${((item.price || 0) * item.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-4 text-center text-sm text-muted"
                    >
                      No items in this order
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-3 text-right text-sm font-semibold text-body"
                  >
                    Total
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-semibold text-body">
                    ${order.totalPrice.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div>
          <h2 className="font-semibold text-heading mb-4">Shipping Address</h2>
          {order.shippingAddress ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <p className="text-body">
                <span className="text-muted">Name:</span>{" "}
                {order.shippingAddress.fullName}
              </p>
              <p className="text-body">
                <span className="text-muted">Address:</span>{" "}
                {order.shippingAddress.address}
              </p>
              <p className="text-body">
                <span className="text-muted">City:</span>{" "}
                {order.shippingAddress.city}
              </p>
              <p className="text-body">
                <span className="text-muted">State:</span>{" "}
                {order.shippingAddress.state}
              </p>
              <p className="text-body">
                <span className="text-muted">Postal Code:</span>{" "}
                {order.shippingAddress.postalCode}
              </p>
              <p className="text-body">
                <span className="text-muted">Country:</span>{" "}
                {order.shippingAddress.country}
              </p>
              <p className="text-body">
                <span className="text-muted">Phone:</span>{" "}
                {order.shippingAddress.phone}
              </p>
            </div>
          ) : (
            <p className="text-body">No shipping information available</p>
          )}
        </div>
      </div>
    </div>
  );
}
