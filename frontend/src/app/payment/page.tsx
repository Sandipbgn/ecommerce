"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { paymentService } from "@/services/paymentService";
import { toast } from "react-hot-toast";
import Link from "next/link";

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [order, setOrder] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("paypal");

  // Get orderId from URL params
  const orderId = searchParams.get("orderId");

  useEffect(() => {
    if (!authLoading && !user) {
      toast.error("Please log in to continue");
      router.push("/login?redirect=/cart");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && orderId) {
      fetchOrderDetails();
    } else if (user && !orderId) {
      toast.error("No order found");
      router.push("/cart");
    }
  }, [user, orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await paymentService.getOrderDetails(orderId);
      setOrder(response.data);
    } catch (err) {
      toast.error("Failed to load order details");
      router.push("/cart");
    } finally {
      setLoading(false);
    }
  };

  const handlePaypalPayment = async () => {
    try {
      setProcessingPayment(true);
      const response = await paymentService.initiatePayment(orderId);

      // Redirect to PayPal
      if (response.data.approvalUrl) {
        window.location.href = response.data.approvalUrl;
      } else {
        throw new Error("Failed to get PayPal approval URL");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Payment initiation failed");
      setProcessingPayment(false);
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
            href="/cart"
            className="mt-4 inline-block bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Return to Cart
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-heading">Payment</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Payment Options */}
        <div className="md:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-heading">
              Payment Method
            </h2>

            <div className="space-y-4">
              <div>
                <label className="flex items-center space-x-3">
                  <input
                    type="radio"
                    value="paypal"
                    checked={paymentMethod === "paypal"}
                    onChange={() => setPaymentMethod("paypal")}
                    className="form-radio h-5 w-5 text-blue-600"
                  />
                  <span className="text-body">PayPal</span>
                </label>
              </div>

              <div>
                <label className="flex items-center space-x-3 opacity-50 cursor-not-allowed">
                  <input
                    type="radio"
                    value="creditCard"
                    disabled
                    className="form-radio h-5 w-5 text-blue-600"
                  />
                  <span className="text-body">Credit Card (Coming Soon)</span>
                </label>
              </div>
            </div>

            <div className="mt-8">
              <button
                onClick={handlePaypalPayment}
                disabled={processingPayment}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
              >
                {processingPayment ? "Processing..." : "Pay Now"}
              </button>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-sm sticky top-4">
            <h2 className="text-xl font-semibold mb-4 text-heading">
              Order Summary
            </h2>

            <div className="mb-4">
              <p className="text-sm text-muted mb-1">Order ID</p>
              <p className="text-body font-mono">{order.id}</p>
            </div>

            <div className="border-t border-b py-3 my-3">
              <div className="flex justify-between mb-1">
                <span className="text-body">Total</span>
                <span className="text-body">
                  ${order.totalPrice.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex justify-between font-bold">
              <span className="text-heading">Amount to Pay</span>
              <span className="text-heading">
                ${order.totalPrice.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
