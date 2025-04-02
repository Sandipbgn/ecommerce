"use client";

import { useEffect, useState } from "react";
import { productService } from "@/services/productService";
import { Product } from "@/types/product";
import Link from "next/link";

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        // Get featured products (we'll sort by highest price for this example)
        const featuredResponse = await productService.getProducts({
          limit: 4,
          sortBy: "price",
          order: "desc",
        });

        // Get newest products
        const newArrivalsResponse = await productService.getProducts({
          limit: 8,
          sortBy: "createdAt",
          order: "desc",
        });

        setFeaturedProducts(featuredResponse.data);
        setNewArrivals(newArrivalsResponse.data);
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setError("Failed to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-8 mb-12 text-white">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-bold mb-4">Welcome to Our Store</h1>
          <p className="text-xl mb-6">
            Discover amazing products at incredible prices. Shop now and enjoy
            fast shipping!
          </p>
          <Link
            href="/products"
            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Shop Now
          </Link>
        </div>
      </div>

      {/* Featured Products Section */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Featured Products
          </h2>
          <Link href="/products" className="text-blue-600 hover:underline">
            View All →
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-10 text-red-500">{error}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* New Arrivals Section */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">New Arrivals</h2>
          <Link href="/products" className="text-blue-600 hover:underline">
            View All →
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-10 text-red-500">{error}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Categories Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Shop by Category
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {["Electronics", "Clothing", "Home & Kitchen", "Books"].map(
            (category) => (
              <Link
                key={category}
                href={`/products?category=${category}`}
                className="bg-gray-100 hover:bg-gray-200 p-6 rounded-lg text-center transition-colors"
              >
                <span className="text-lg font-medium text-gray-700">
                  {category}
                </span>
              </Link>
            )
          )}
        </div>
      </section>
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.id}`}>
      <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
        <div className="h-48 overflow-hidden bg-gray-100">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <span className="text-gray-400">No image</span>
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-1 truncate text-gray-800">
            {product.name}
          </h3>
          <p className="text-gray-500 text-sm mb-2 truncate">
            {product.category}
          </p>
          <div className="flex justify-between items-center">
            <span className="font-bold text-lg text-gray-900">
              ${product.price.toFixed(2)}
            </span>
            <span className="text-sm text-gray-500">
              {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
