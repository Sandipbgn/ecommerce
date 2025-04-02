"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { cartService } from "@/services/cartService";
import { orderService } from "@/services/orderService";
import { toast } from "react-hot-toast";
import Link from "next/link";

export default function CheckoutPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);

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
  }, [user]);

  const fetchCart = async () => {
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
    } catch (err) {
      toast.error("Failed to load cart items");
      router.push("/cart");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setPlacingOrder(true);

      // Create the order without shipping address
      const orderResponse = await orderService.createOrder({});

      // Redirect to payment page with the order ID
      if (orderResponse.data.order.id) {
        router.push(`/payment?orderId=${orderResponse.data.order.id}`);
      } else {
        throw new Error("Order creation failed");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create order");
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
