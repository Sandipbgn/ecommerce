import { api } from "@/lib/axios";

export const orderService = {

  // Create a new order
  createOrder: async (data: { shippingAddress: unknown }) => {
    const response = await api.post("/orders", data);
    return response.data;
  },

  // Get user orders
  getUserOrders: async (params?: { page?: number; limit?: number; status?: string }) => {
    const response = await api.get("/orders/user", { params });
    return response.data;
  },

  // Get order details
  getOrderById: async (id: string) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  // Admin: Update order status
  updateOrderStatus: async (id: string, status: string) => {
    const response = await api.put(`/orders/${id}/status`, { status });
    return response.data;
  },

  // Admin: Get all orders
  getAllOrders: async (params?: { page?: number; limit?: number; status?: string }) => {
    const response = await api.get("/orders", { params });
    return response.data;
  },
};
