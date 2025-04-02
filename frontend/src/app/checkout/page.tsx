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
  const [shippingAddress, setShippingAddress] = useState({
    fullName: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    phone: "",
  });

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate the form
    for (const [key, value] of Object.entries(shippingAddress)) {
      if (!value.trim()) {
        toast.error(
          `${key.charAt(0).toUpperCase() + key.slice(1)} is required`
        );
        return;
      }
    }

    try {
      setPlacingOrder(true);

      // Create the order
      const orderResponse = await orderService.createOrder({
        shippingAddress,
      });

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
        {/* Shipping Address Form */}
        <div className="md:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-heading">
              Shipping Address
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block text-body mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={shippingAddress.fullName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded text-body"
                  required
                />
              </div>

              <div>
                <label htmlFor="address" className="block text-body mb-1">
                  Address
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={shippingAddress.address}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded text-body"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="city" className="block text-body mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={shippingAddress.city}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded text-body"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="state" className="block text-body mb-1">
                    State/Province
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={shippingAddress.state}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded text-body"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="postalCode" className="block text-body mb-1">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    id="postalCode"
                    name="postalCode"
                    value={shippingAddress.postalCode}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded text-body"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="country" className="block text-body mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    value={shippingAddress.country}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded text-body"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-body mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={shippingAddress.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded text-body"
                  required
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={placingOrder}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
                >
                  {placingOrder ? "Processing..." : "Continue to Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Order Summary */}
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-sm sticky top-4">
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
          </div>
        </div>
      </div>
    </div>
  );
}
