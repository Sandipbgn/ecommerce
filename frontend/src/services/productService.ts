import { api } from "@/lib/axios";
import { Product, ProductResponse, ProductsResponse } from "@/types/product";

export const productService = {
  // Get all products with filtering, pagination, and sorting
  getProducts: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    sortBy?: string;
    order?: "asc" | "desc";
  }): Promise<ProductsResponse> => {
    const response = await api.get("/products", { params });
    return response.data;
  },

  // Get a product by ID
  getProductById: async (id: string): Promise<ProductResponse> => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Create a product (admin only)
  createProduct: async (productData: FormData): Promise<ProductResponse> => {
    const response = await api.post("/products", productData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Update a product (admin only)
  updateProduct: async (
    id: string,
    productData: FormData
  ): Promise<ProductResponse> => {
    const response = await api.put(`/products/${id}`, productData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Delete a product (admin only)
  deleteProduct: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },
};
