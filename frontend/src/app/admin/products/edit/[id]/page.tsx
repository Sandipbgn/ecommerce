"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { productService } from "@/services/productService";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";
import Image from "next/image";

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
  });
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  const fetchProduct = useCallback(
    async (productId: string) => {
      try {
        setFetchLoading(true);
        const response = await productService.getProductById(productId);
        const productData = response.data;
        setFormData({
          name: productData.name,
          description: productData.description,
          price: productData.price.toString(),
          stock: productData.stock.toString(),
          category: productData.category,
        });
        if (productData.imageUrl) {
          setImagePreview(productData.imageUrl);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        toast.error("Failed to load product");
        router.push("/admin/products");
      } finally {
        setFetchLoading(false);
      }
    },
    [router]
  );

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      toast.error("You don't have permission to access this page");
      router.push("/");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (typeof id === "string" && user?.role === "admin") {
      fetchProduct(id);
    }
  }, [id, user, fetchProduct]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.description ||
      !formData.price ||
      !formData.stock ||
      !formData.category
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (typeof id !== "string") return;

    try {
      setLoading(true);
      const data = new FormData();
      data.append("name", formData.name);
      data.append("description", formData.description);
      data.append("price", formData.price);
      data.append("stock", formData.stock);
      data.append("category", formData.category);

      if (image) {
        data.append("image", image);
      }

      await productService.updateProduct(id, data);
      toast.success("Product updated successfully");
      router.push("/admin/products");
    } catch (error: unknown) {
      const apiError = error as ApiError;
      toast.error(
        apiError.response?.data?.message || "Failed to update product"
      );
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || fetchLoading) {
    return <div className="container mx-auto p-4">Loading...</div>;
  }

  if (!user || user.role !== "admin") {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Edit Product</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 mb-1">Product Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-1">Price ($) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1">Stock *</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Category *</label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Product Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {imagePreview && (
              <div className="mt-2">
                <p className="text-sm text-gray-500 mb-1">
                  {image ? "New image preview:" : "Current image:"}
                </p>
                <Image
                  src={imagePreview}
                  alt="Preview"
                  width={100}
                  height={100}
                  className="h-40 object-contain"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.push("/admin/products")}
              className="px-6 py-2 border rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400"
            >
              {loading ? "Updating..." : "Update Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
