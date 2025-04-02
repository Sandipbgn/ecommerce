"use client";

import { useEffect, useState } from "react";
import { cartService } from "@/services/cartService";
import { CartItem } from "@/types/cart";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import Link from "next/link";
import Image from "next/image";

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
    status?: number;
  };
  message: string;
}

export default function CartPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);
  const [processingOrder, setProcessingOrder] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      toast.error("Please log in to view your cart");
      router.push("/login?redirect=/cart");
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
      setCartItems(response.data.items);
      setTotal(response.data.total);
    } catch (err) {
      const error = err as ApiError;
      if (error.response?.status === 404) {
        setCartItems([]);
        setTotal(0);
      } else {
        setError("Failed to load cart items");
        console.error(error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (id: string, quantity: number) => {
    try {
      setUpdating(id);
      await cartService.updateCartItem(id, quantity);
      await fetchCart(); // Refresh cart
      toast.success("Cart updated");
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.response?.data?.message || "Failed to update cart");
    } finally {
      setUpdating(null);
    }
  };

  const handleRemoveItem = async (id: string) => {
    try {
      setRemoving(id);
      await cartService.removeCartItem(id);
      await fetchCart(); // Refresh cart
      toast.success("Item removed from cart");
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.response?.data?.message || "Failed to remove item");
    } finally {
      setRemoving(null);
    }
  };

  const handleClearCart = async () => {
    if (!window.confirm("Are you sure you want to clear your cart?")) {
      return;
    }

    try {
      await cartService.clearCart();
      await fetchCart(); // Refresh cart
      toast.success("Cart cleared");
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.response?.data?.message || "Failed to clear cart");
    }
  };

  const handleCheckout = async () => {
    try {
      setProcessingOrder(true);

      // Redirect to checkout page
      router.push("/checkout");
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.response?.data?.message || "Failed to process order");
      setProcessingOrder(false);
    }
  };

  if (authLoading) {
    return (
      <div className="container mx-auto p-4 flex justify-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  if (loading && !error) {
    return (
      <div className="container mx-auto p-4 flex justify-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Error</h2>
          <p>{error}</p>
          <button
            onClick={fetchCart}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Your Cart</h1>

        <div className="text-center py-10">
          <p className="text-gray-500 mb-4">Your cart is empty</p>
          <Link
            href="/products"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Your Cart</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subtotal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {cartItems.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          {item.product.imageUrl ? (
                            <Image
                              src={item.product.imageUrl}
                              alt={item.product.name}
                              width={100}
                              height={100}
                              className="h-10 w-10 object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 bg-gray-200 flex items-center justify-center">
                              <span className="text-xs text-gray-500">
                                No img
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <Link
                            href={`/products/${item.product.id}`}
                            className="text-sm font-medium text-gray-800 hover:underline"
                          >
                            {item.product.name}
                          </Link>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${item.product.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <button
                          onClick={() =>
                            handleUpdateQuantity(
                              item.id,
                              Math.max(1, item.quantity - 1)
                            )
                          }
                          disabled={updating === item.id || item.quantity <= 1}
                          className="px-2 py-1 border rounded-l disabled:opacity-50"
                        >
                          -
                        </button>
                        <span className="px-4 py-1 border-t border-b">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            handleUpdateQuantity(
                              item.id,
                              Math.min(item.product.stock, item.quantity + 1)
                            )
                          }
                          disabled={
                            updating === item.id ||
                            item.quantity >= item.product.stock
                          }
                          className="px-2 py-1 border rounded-r disabled:opacity-50"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${(item.quantity * item.product.price).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={removing === item.id}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                      >
                        {removing === item.id ? "Removing..." : "Remove"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="px-6 py-4 border-t">
              <button
                onClick={handleClearCart}
                className="text-red-600 hover:text-red-900"
              >
                Clear Cart
              </button>
            </div>
          </div>
        </div>

        {/* Cart Summary */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

            <div className="flex justify-between mb-2 text-gray-800">
              <span>Subtotal</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2 text-gray-800">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="flex justify-between font-semibold text-lg border-t pt-2 mt-2 text-gray-900">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={processingOrder}
              className="w-full mt-6 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-blue-400"
            >
              {processingOrder ? "Processing..." : "Proceed to Checkout"}
            </button>

            <Link
              href="/products"
              className="block text-center mt-4 text-blue-600 hover:underline"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
