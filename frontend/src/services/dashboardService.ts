// frontend/src/services/dashboardService.ts
import { api } from "@/lib/axios";

export const dashboardService = {
  // Get sales analytics and dashboard data
  getSalesAnalytics: async () => {
    const response = await api.get("/admin/dashboard");
    return response.data;
  },

  // Get all orders (for admin order management)
  getAllOrders: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) => {
    const response = await api.get("/orders", { params });
    return response.data;
  },

  // Update order status
  updateOrderStatus: async (id: string, status: string) => {
    const response = await api.put(`/orders/${id}/status`, { status });
    return response.data;
  },

  // Get all users (for admin user management)
  getAllUsers: async (params?: { page?: number; limit?: number }) => {
    const response = await api.get("/users", { params });
    return response.data;
  },
};
