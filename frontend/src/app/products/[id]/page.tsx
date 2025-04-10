"use client";

import { useEffect, useState, Suspense } from "react";
import { productService } from "@/services/productService";
import { Product } from "@/types/product";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { cartService } from "@/services/cartService";
import { useAuth } from "@/context/AuthContext";
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

// Wrapper component that uses searchParams
function ProductDetailContent() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productId = typeof params.id === "string" ? params.id : "";
        const response = await productService.getProductById(productId);
        setProduct(response.data);
      } catch (err) {
        const error = err as ApiError;
        setError(error.response?.data?.message || "Failed to load product");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params.id]);

  const handleAddToCart = async () => {
    if (!user) {
      toast.error("Please log in to add items to cart");
      router.push(`/login?redirect=/products/${params.id}`);
      return;
    }

    try {
      setAddingToCart(true);
      const productId = typeof params.id === "string" ? params.id : "";
      await cartService.addToCart({ productId, quantity });
      toast.success("Added to cart!");

      // If coming from cart/checkout, redirect back
      const redirect = searchParams.get("redirect");
      if (redirect) {
        router.push(redirect);
      }
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.response?.data?.message || "Failed to add to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 flex justify-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Error</h2>
          <p>{error || "Product not found"}</p>
          <button
            onClick={() => router.push("/products")}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {/* Breadcrumb navigation */}
      <nav className="text-sm mb-6">
        <ol className="flex items-center space-x-2">
          <li>
            <Link href="/" className="text-gray-500 hover:text-gray-700">
              Home
            </Link>
          </li>
          <li className="text-gray-500">/</li>
          <li>
            <Link
              href="/products"
              className="text-gray-500 hover:text-gray-700"
            >
              Products
            </Link>
          </li>
          <li className="text-gray-500">/</li>
          <li className="text-gray-700 font-medium truncate max-w-xs">
            {product.name}
          </li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="rounded-lg overflow-hidden bg-gray-100 h-96">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              width={100}
              height={100}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <span className="text-gray-400">No image available</span>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h1 className="text-3xl font-bold mb-2 text-gray-800">
            {product.name}
          </h1>
          <p className="text-gray-600 mb-4">Category: {product.category}</p>
          <p className="text-2xl font-bold mb-4 text-gray-900">
            ${product.price.toFixed(2)}
          </p>

          <div className="mb-4">
            <p className="text-gray-700 mb-2">
              Availability:{" "}
              <span
                className={
                  product.stock > 0 ? "text-green-600" : "text-red-600"
                }
              >
                {product.stock > 0
                  ? `${product.stock} in stock`
                  : "Out of stock"}
              </span>
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2 text-gray-800">
              Description
            </h3>
            <p className="text-gray-700">{product.description}</p>
          </div>

          {product.stock > 0 && (
            <div className="flex items-center mb-6">
              <div className="mr-4">
                <label htmlFor="quantity" className="block text-gray-700 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  id="quantity"
                  min="1"
                  max={product.stock}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-20 px-3 py-2 border rounded text-gray-800"
                />
              </div>
              <button
                onClick={handleAddToCart}
                disabled={addingToCart}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-blue-400"
              >
                {addingToCart ? "Adding..." : "Add to Cart"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export default function ProductDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto p-4 flex justify-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      }
    >
      <ProductDetailContent />
    </Suspense>
  );
}
