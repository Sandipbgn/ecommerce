import { api } from "@/lib/axios";
import { CartItem } from "@/types/cart";

export interface CartResponse {
  message: string;
  data: {
    items: CartItem[];
    total: number;
  };
}

export interface CartItemResponse {
  message: string;
  data: CartItem;
}

export const cartService = {
  // Get user's cart
  getCart: async (): Promise<CartResponse> => {
    const response = await api.get("/cart");
    return response.data;
  },

  // Add to cart
  addToCart: async (data: {
    productId: string;
    quantity: number;
  }): Promise<CartItemResponse> => {
    const response = await api.post("/cart/add", data);
    return response.data;
  },

  // Update cart item
  updateCartItem: async (
    id: string,
    quantity: number
  ): Promise<CartItemResponse> => {
    const response = await api.put(`/cart/update/${id}`, { quantity });
    return response.data;
  },

  // Remove from cart
  removeCartItem: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/cart/remove/${id}`);
    return response.data;
  },

  // Clear cart
  clearCart: async (): Promise<{ message: string }> => {
    const response = await api.delete("/cart/clear");
    return response.data;
  },
};
