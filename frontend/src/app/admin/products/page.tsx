"use client";

import { useEffect, useState } from "react";
import { productService } from "@/services/productService";
import { Product, ProductsResponse } from "@/types/product";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export default function AdminProductsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    // Redirect if not admin
    if (!authLoading && (!user || user.role !== "admin")) {
      toast.error("You don't have permission to access this page");
      router.push("/");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.role === "admin") {
      fetchProducts();
    }
  }, [page, user]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getProducts({
        page,
        limit: 10,
      });
      setProducts(response.data);
      setTotalPages(response.meta.pages);
    } catch (err) {
      setError("Failed to load products");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      setDeleting(id);
      await productService.deleteProduct(id);
      toast.success("Product deleted successfully");
      fetchProducts(); // Refresh list
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete product");
    } finally {
      setDeleting(null);
    }
  };

  if (authLoading) {
    return <div className="container mx-auto p-4">Loading...</div>;
  }

  if (!user || user.role !== "admin") {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manage Products</h1>

        <Link
          href="/admin/products/new"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Add New Product
        </Link>
      </div>

      {loading && products.length === 0 ? (
        <div className="text-center py-10">Loading products...</div>
      ) : error ? (
        <div className="text-center py-10 text-red-500">{error}</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b text-left text-gray-800">
                    Image
                  </th>
                  <th className="py-2 px-4 border-b text-left text-gray-800">
                    Name
                  </th>
                  <th className="py-2 px-4 border-b text-left text-gray-800">
                    Category
                  </th>
                  <th className="py-2 px-4 border-b text-left text-gray-800">
                    Price
                  </th>
                  <th className="py-2 px-4 border-b text-left text-gray-800">
                    Stock
                  </th>
                  <th className="py-2 px-4 border-b text-left text-gray-800">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="py-2 px-4 border-b">
                      <div className="h-12 w-12 overflow-hidden bg-gray-100">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-gray-200">
                            <span className="text-xs text-gray-400">
                              No img
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-2 px-4 border-b text-gray-800">
                      {product.name}
                    </td>
                    <td className="py-2 px-4 border-b text-gray-800">
                      {product.category}
                    </td>
                    <td className="py-2 px-4 border-b text-gray-800">
                      ${product.price.toFixed(2)}
                    </td>
                    <td className="py-2 px-4 border-b text-gray-800">
                      {product.stock}
                    </td>
                    <td className="py-2 px-4 border-b">
                      <div className="flex space-x-2">
                        <Link
                          href={`/admin/products/edit/${product.id}`}
                          className="text-blue-600 hover:underline"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          disabled={deleting === product.id}
                          className="text-red-600 hover:underline disabled:text-gray-400"
                        >
                          {deleting === product.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-6 flex justify-center">
            <nav className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className={`px-4 py-2 rounded ${
                  page === 1
                    ? "bg-gray-200 text-gray-500"
                    : "bg-blue-600 text-white"
                }`}
              >
                Previous
              </button>
              <span className="mx-4">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => (p < totalPages ? p + 1 : p))}
                disabled={page >= totalPages}
                className={`px-4 py-2 rounded ${
                  page >= totalPages
                    ? "bg-gray-200 text-gray-500"
                    : "bg-blue-600 text-white"
                }`}
              >
                Next
              </button>
            </nav>
          </div>
        </>
      )}
    </div>
  );
}
