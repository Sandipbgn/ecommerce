"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaTimesCircle } from "react-icons/fa";
import { toast } from "react-hot-toast";

export default function PaymentCancelPage() {
  const router = useRouter();

  useEffect(() => {
    toast.error("Payment was cancelled or failed");
  }, []);

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-sm">
        <div className="text-center mb-6">
          <FaTimesCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-heading">Payment Cancelled</h1>
          <p className="text-body mt-2">
            Your payment was cancelled or did not complete successfully.
          </p>
        </div>

        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
          <p>
            If you experienced any issues with the payment system, please contact
            our customer support team for assistance.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
          <Link
            href="/orders"
            className="bg-blue-600 text-white px-6 py-2 rounded text-center hover:bg-blue-700"
          >
            View Your Orders
          </Link>
          <Link
            href="/cart"
            className="border border-blue-600 text-blue-600 px-6 py-2 rounded text-center hover:bg-blue-50"
          >
            Return to Cart
          </Link>
        </div>
      </div>
    </div>
  );
}