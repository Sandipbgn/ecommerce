"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { paymentService } from "@/services/paymentService";
import { toast } from "react-hot-toast";
import Link from "next/link";

interface Order {
  id: string;
  totalPrice: number;
  status: string;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message: string;
}

// Wrapper component that uses searchParams
function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("paypal");

  // Get orderId from URL params
  const orderId = searchParams.get("orderId");

  const fetchOrderDetails = useCallback(async () => {
    if (!orderId) return;

    try {
      setLoading(true);
      const response = await paymentService.getOrderDetails(orderId);
      setOrder(response.data);
    } catch (error) {
      const err = error as ApiError;
      toast.error(
        err.response?.data?.message || "Failed to load order details"
      );
      router.push("/cart");
    } finally {
      setLoading(false);
    }
  }, [orderId, router]);

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
  }, [user, orderId, fetchOrderDetails, router]);

  const handlePaypalPayment = async () => {
    if (!orderId) return;

    try {
      setProcessingPayment(true);
      const response = await paymentService.initiatePayment(orderId);

      // Redirect to PayPal
      if (response.data.approvalUrl) {
        window.location.href = response.data.approvalUrl;
      } else {
        throw new Error("Failed to get PayPal approval URL");
      }
    } catch (error) {
      const err = error as ApiError;
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
          <h2 className="text-lg font-semibold mb-2">Order Error</h2>
          <p>We could not find your order. Please try again.</p>
          <Link
            href="/cart"
            className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Return to Cart
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold mb-6 text-heading">Payment</h1>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3 text-heading">
            Order Summary
          </h2>
          <div className="border-t border-b py-4">
            <div className="flex justify-between mb-2">
              <span className="text-muted">Order ID:</span>
              <span className="text-body font-mono">{order.id}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-muted">Total Amount:</span>
              <span className="text-body font-semibold">
                ${order.totalPrice.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Status:</span>
              <span className="text-body">{order.status}</span>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3 text-heading">
            Payment Method
          </h2>
          <div className="space-y-3">
            <div className="border p-4 rounded flex items-center space-x-3">
              <input
                type="radio"
                id="paypal"
                name="paymentMethod"
                value="paypal"
                checked={paymentMethod === "paypal"}
                onChange={() => setPaymentMethod("paypal")}
                className="h-5 w-5 text-blue-600"
              />
              <label htmlFor="paypal" className="flex-1 text-body">
                PayPal
              </label>
              <div className="text-sm text-blue-600">Recommended</div>
            </div>
          </div>
        </div>

        <button
          onClick={handlePaypalPayment}
          disabled={processingPayment}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
        >
          {processingPayment ? "Processing..." : "Pay Now"}
        </button>

        <div className="mt-4 text-center">
          <Link href="/cart" className="text-blue-600 hover:underline">
            Cancel and return to cart
          </Link>
        </div>
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto p-4 flex justify-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      }
    >
      <PaymentContent />
    </Suspense>
  );
}
