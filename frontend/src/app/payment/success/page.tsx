"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { paymentService } from "@/services/paymentService";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { FaCheckCircle } from "react-icons/fa";

interface Payment {
  id: string;
  amount: number;
  status: string;
  transactionId: string;
}

interface Order {
  id: string;
  status: string;
  totalPrice: number;
}

// Wrapper component that uses searchParams
function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [order, setOrder] = useState<Order | null>(null);

  // Get transaction ID from URL query params
  const token = searchParams.get("token");

  const verifyAndCapturePayment = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      // Capture payment
      const captureResponse = await paymentService.capturePayment(token);

      setPayment(captureResponse.data);
      setOrder(captureResponse.data.order);

      toast.success("Payment successful!");
    } catch (err) {
      console.error("Payment verification error:", err);
      toast.error("Failed to verify payment. Please contact support.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!authLoading && !user) {
      toast.error("Please log in to view payment details");
      router.push("/login");
      return;
    }

    if (user && token) {
      verifyAndCapturePayment();
    } else if (user && !token) {
      toast.error("Invalid payment information");
      router.push("/orders");
    }
  }, [user, authLoading, token, router, verifyAndCapturePayment]);

  if (authLoading || loading) {
    return (
      <div className="container mx-auto p-4 flex justify-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!payment || !order) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Payment Error</h2>
          <p>
            We could not verify your payment. Please contact customer support.
          </p>
          <Link
            href="/orders"
            className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            View Your Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-sm">
        <div className="text-center mb-6">
          <FaCheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-heading">
            Payment Successful!
          </h1>
          <p className="text-body mt-2">
            Your order has been confirmed and will be shipped soon.
          </p>
        </div>

        <div className="border-t border-b py-4 my-4">
          <div className="flex justify-between mb-2">
            <span className="text-muted">Order ID:</span>
            <span className="text-body font-mono">{order.id}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-muted">Payment ID:</span>
            <span className="text-body font-mono">{payment.id}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-muted">Transaction ID:</span>
            <span className="text-body font-mono">{payment.transactionId}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-muted">Amount Paid:</span>
            <span className="text-body font-semibold">
              ${payment.amount?.toFixed(2) || "0.00"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Status:</span>
            <span className="text-green-600 font-semibold">
              {payment.status === "completed" ? "Completed" : "Processing"}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
          <Link
            href="/orders"
            className="bg-blue-600 text-white px-6 py-2 rounded text-center hover:bg-blue-700"
          >
            View Your Orders
          </Link>
          <Link
            href="/"
            className="border border-blue-600 text-blue-600 px-6 py-2 rounded text-center hover:bg-blue-50"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto p-4 flex justify-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
