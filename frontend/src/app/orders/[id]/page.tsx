"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { orderService } from "@/services/orderService";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { format } from "date-fns";

interface Payment {
  id: string;
  amount: number;
  status: string;
  transactionId?: string;
  createdAt: string;
}

interface ShippingAddress {
  fullName: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

interface Order {
  id: string;
  status: string;
  totalPrice: number;
  createdAt: string;
  payments?: Payment[];
  shippingAddress?: ShippingAddress;
}

export default function OrderDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrderDetails = useCallback(async () => {
    try {
      setLoading(true);
      const orderId = typeof params.id === 'string' ? params.id : '';
      const response = await orderService.getOrderById(orderId);
      setOrder(response.data);
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    if (!authLoading && !user) {
      toast.error('Please log in to view order details');
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchOrderDetails();
    }
  }, [user, fetchOrderDetails]);

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

  if (authLoading || loading) {
    return (
      <div className="container mx-auto p-4 flex justify-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Error</h2>
          <p>Order not found</p>
          <Link
            href="/orders"
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
          href="/orders"
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
          <div className="mt-4 md:mt-0">
            <span
              className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                order.status
              )}`}
            >
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          </div>
        </div>

        <div className="border-t border-b py-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h2 className="font-semibold text-heading mb-2">
                Order Information
              </h2>
              <p className="text-body">
                <span className="text-muted">Date Placed:</span>{" "}
                {format(new Date(order.createdAt), "MMMM d, yyyy 'at' h:mma")}
              </p>
              <p className="text-body">
                <span className="text-muted">Total:</span> $
                {order.totalPrice.toFixed(2)}
              </p>
            </div>

            <div>
              <h2 className="font-semibold text-heading mb-2">
                Payment Information
              </h2>
              {order.payments && order.payments.length > 0 ? (
                order.payments.map((payment) => (
                  <div key={payment.id}>
                    <p className="text-body">
                      <span className="text-muted">Payment ID:</span>{" "}
                      {payment.id}
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

      {/* Actions */}
      <div className="flex justify-center gap-4">
        <Link
          href="/orders"
          className="bg-gray-200 text-gray-800 px-6 py-2 rounded hover:bg-gray-300"
        >
          Back to Orders
        </Link>
        {order.status === "pending" && (
          <Link
            href={`/payment?orderId=${order.id}`}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Pay Now
          </Link>
        )}
      </div>
    </div>
  );
}
