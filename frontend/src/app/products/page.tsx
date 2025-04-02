"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { productService } from "@/services/productService";
import { Product } from "@/types/product";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";

// Wrapper component that uses searchParams
function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [categories, setCategories] = useState<string[]>([]);

  interface ApiError {
    response?: {
      data?: {
        message?: string;
      };
      status?: number;
    };
    message: string;
  }

  interface ProductParams {
    page: number;
    limit: number;
    category?: string;
    search?: string;
  }

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);

      // Build query params
      const params: ProductParams = {
        page,
        limit: 12,
      };

      if (category) params.category = category;
      if (search) params.search = search;

      const response = await productService.getProducts(params);

      if (response.data.length === 0 && page > 1) {
        // If no products and we're not on page 1, go back to page 1
        setPage(1);
        return;
      }

      setProducts(response.data);
      setTotalPages(response.meta.pages);

      // Extract unique categories for filter
      const uniqueCategories = Array.from(
        new Set(response.data.map((product) => product.category))
      ).filter(Boolean);

      if (uniqueCategories.length > 0) {
        setCategories(uniqueCategories);
      }
    } catch (err) {
      const error = err as ApiError;
      if (error.response?.status === 404) {
        setError("No products found");
      } else {
        setError("Failed to load products");
        console.error(error);
      }
    } finally {
      setLoading(false);
    }
  }, [page, category, search]);

  useEffect(() => {
    // Set initial search and category from URL
    const searchFromUrl = searchParams.get("search");
    const categoryFromUrl = searchParams.get("category");
    if (searchFromUrl) setSearch(searchFromUrl);
    if (categoryFromUrl) setCategory(categoryFromUrl);

    fetchProducts();
  }, [searchParams, fetchProducts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset to first page

    // Update URL with search param
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category) params.set("category", category);

    router.push(`/products?${params.toString()}`);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCategory = e.target.value;
    setCategory(newCategory);
    setPage(1); // Reset to first page

    // Update URL with category param
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (newCategory) params.set("category", newCategory);

    router.push(`/products?${params.toString()}`);
  };

  if (loading && products.length === 0) {
    return (
      <div className="container mx-auto p-4 flex justify-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-heading">Products</h1>

      {/* Search and filters */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1">
          <div className="flex">
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-4 py-2 border rounded-l flex-1 text-body"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-r"
            >
              Search
            </button>
          </div>
        </form>

        <div className="w-full md:w-64">
          <select
            value={category}
            onChange={handleCategoryChange}
            className="w-full px-4 py-2 border rounded text-body"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 bg-red-50 text-red-700 p-4 rounded">
          <p>{error}</p>
        </div>
      )}

      {/* Product grid */}
      {products.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-body">No products found</p>
          <button
            onClick={() => {
              setSearch("");
              setCategory("");
              router.push("/products");
            }}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
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
            <span className="mx-4 text-body">
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
      )}
    </div>
  );
}

// Main component with Suspense boundary
export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="container mx-auto p-4">Loading products...</div>}>
      <ProductsContent />
    </Suspense>
  );
}

function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.id}`}>
      <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white">
        <div className="h-48 overflow-hidden bg-gray-100">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              width={100}
              height={100}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <span className="text-gray-400">No image</span>
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-1 truncate text-heading">
            {product.name}
          </h3>
          <p className="text-muted text-sm mb-2 truncate">{product.category}</p>
          <div className="flex justify-between items-center">
            <span className="font-bold text-lg text-heading">
              ${product.price.toFixed(2)}
            </span>
            <span className="text-sm text-muted">
              {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
