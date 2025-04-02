import { api } from "@/lib/axios";

export const paymentService = {
  // Initiate payment for an order
  initiatePayment: async (orderId: string) => {
    const response = await api.post("/checkout/payment", { orderId });
    return response.data;
  },

  // Verify payment status
  verifyPayment: async (transactionId: string) => {
    const response = await api.get(
      `/checkout/payment/status?transactionId=${transactionId}`
    );
    return response.data;
  },

  // Capture payment
  capturePayment: async (transactionId: string) => {
    const response = await api.post("/checkout/payment/capture", {
      transactionId,
    });
    return response.data;
  },

  // Get payment details
  getPaymentById: async (id: string) => {
    const response = await api.get(`/payments/${id}`);
    return response.data;
  },

  // Get order details for payment page
  getOrderDetails: async (orderId: string) => {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  },
};
