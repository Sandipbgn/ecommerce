"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { cartService } from "@/services/cartService";
import { orderService } from "@/services/orderService";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { CartItem } from "@/types/cart";

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message: string;
}

// Wrapper component that uses searchParams
function CheckoutContent() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const response = await cartService.getCart();

      if (response.data.items.length === 0) {
        toast.error("Your cart is empty");
        router.push("/cart");
        return;
      }

      setCartItems(response.data.items);
      setTotal(response.data.total);
    } catch (error) {
      console.log(error);
      toast.error("Failed to load cart items");
      router.push("/cart");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (!authLoading && !user) {
      toast.error("Please log in to continue checkout");
      router.push("/login?redirect=/checkout");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchCart();
    }
  }, [user, fetchCart]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setPlacingOrder(true);

      // Create the order with empty shipping address for now
      const orderResponse = await orderService.createOrder({
        shippingAddress: {
          fullName: "",
          address: "",
          city: "",
          state: "",
          postalCode: "",
          country: "",
          phone: "",
        },
      });

      // Redirect to payment page with the order ID
      if (orderResponse.data.order.id) {
        router.push(`/payment?orderId=${orderResponse.data.order.id}`);
      } else {
        throw new Error("Order creation failed");
      }
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.response?.data?.message || "Failed to create order");
      setPlacingOrder(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto p-4 flex justify-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-heading">Checkout</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Order Summary and Checkout Button */}
        <div className="md:col-span-3">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-heading">
              Order Summary
            </h2>

            <div className="divide-y">
              {cartItems.map((item) => (
                <div key={item.id} className="py-3 flex justify-between">
                  <div>
                    <p className="text-body font-medium">{item.product.name}</p>
                    <p className="text-sm text-muted">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-body">
                    ${(item.quantity * item.product.price).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-b py-3 my-3">
              <div className="flex justify-between mb-1">
                <span className="text-body">Subtotal</span>
                <span className="text-body">${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-body">Shipping</span>
                <span className="text-body">Free</span>
              </div>
            </div>

            <div className="flex justify-between font-bold">
              <span className="text-heading">Total</span>
              <span className="text-heading">${total.toFixed(2)}</span>
            </div>

            <div className="pt-6">
              <button
                onClick={handleSubmit}
                disabled={placingOrder}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
              >
                {placingOrder ? "Processing..." : "Continue to Payment"}
              </button>

              <Link
                href="/cart"
                className="block text-center mt-4 text-blue-600 hover:underline"
              >
                Return to Cart
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto p-4 flex justify-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
