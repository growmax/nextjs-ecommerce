import type { Metadata } from "next";
import { Suspense } from "react";
import InteractiveDemoWrapper from "@/components/demo/InteractiveDemoWrapper";

export const metadata: Metadata = {
  title: "Fast Homepage Demo | Progressive Hydration",
  description:
    "Demonstrating Grainger-like fast page load with progressive hydration",
};

export default function HomePage() {
  // Simulate some mock data (this renders instantly as HTML)
  const mockProducts = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    name: `Product ${i + 1}`,
    price: Math.round(Math.random() * 1000 + 100),
  }));

  const mockCategories = Array.from({ length: 6 }, (_, i) => ({
    id: i + 1,
    name: `Category ${i + 1}`,
  }));

  return (
    <div className="container mx-auto p-8 space-y-8">
      {/* Performance Indicator - Static HTML */}
      <div className="bg-blue-500 text-white p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-2">
          ⚡ Lightning Fast Homepage Demo
        </h1>
        <p className="text-lg">
          This page demonstrates progressive hydration - HTML loads instantly,
          JavaScript enhances later!
        </p>
      </div>

      {/* HTML Load Time Indicator */}
      <div className="bg-yellow-100 border-2 border-yellow-400 rounded-lg p-4">
        <p className="text-yellow-900 font-semibold">
          ✅ Initial HTML Loaded: ~0ms (You see this immediately!)
        </p>
        <p className="text-sm text-yellow-800 mt-1">
          All content below is pure HTML - no JavaScript blocking the render
        </p>
      </div>

      {/* Hero Section - Static HTML */}
      <section className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-12 rounded-lg shadow-xl">
        <h2 className="text-4xl font-bold mb-4">Welcome to Our Store</h2>
        <p className="text-xl mb-6">
          Discover amazing products with lightning-fast page loads
        </p>
        <div className="inline-block bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold">
          Shop Now (Static HTML Button)
        </div>
      </section>

      {/* Categories Grid - Static HTML */}
      <section>
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          📦 Categories (Static HTML)
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {mockCategories.map(category => (
            <div
              key={category.id}
              className="bg-indigo-100 border-2 border-indigo-300 p-6 rounded-lg text-center hover:shadow-md transition-shadow"
            >
              <div className="text-4xl mb-2">🏷️</div>
              <h3 className="font-semibold text-indigo-900">
                {category.name}
              </h3>
            </div>
          ))}
        </div>
      </section>

      {/* Products Grid - Static HTML */}
      <section>
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          🛍️ Featured Products (Static HTML)
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {mockProducts.map(product => (
            <div
              key={product.id}
              className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow"
            >
              <div className="w-full h-40 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg mb-3 flex items-center justify-center">
                <span className="text-4xl">📦</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                {product.name}
              </h3>
              <p className="text-xl font-bold text-green-600 mb-3">
                ${product.price}
              </p>
              <div className="w-full bg-blue-500 text-white text-center py-2 rounded hover:bg-blue-600 transition-colors">
                Add to Cart
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Section - Hydrates Later */}
      <section>
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          🎮 Interactive Demo (Loads After HTML)
        </h2>
        <Suspense
          fallback={
            <div className="border-2 border-gray-300 rounded-lg p-6 bg-gray-50">
              <p className="text-gray-600">Loading interactive section...</p>
            </div>
          }
        >
          <InteractiveDemoWrapper />
        </Suspense>
      </section>

      {/* Performance Summary */}
      <div className="bg-gradient-to-r from-green-400 to-blue-500 text-white p-6 rounded-lg">
        <h3 className="text-xl font-bold mb-3">🚀 Performance Summary</h3>
        <ul className="space-y-2 text-sm">
          <li>✅ HTML rendered instantly (0ms blocking)</li>
          <li>✅ All content readable immediately</li>
          <li>✅ Page is scrollable before JavaScript loads</li>
          <li>✅ Interactive features enhance progressively</li>
          <li>✅ Smaller initial JavaScript bundle</li>
        </ul>
        <p className="mt-4 text-xs opacity-90">
          This is the Grainger pattern: Content First, Interactivity Later!
        </p>
      </div>
    </div>
  );
}
