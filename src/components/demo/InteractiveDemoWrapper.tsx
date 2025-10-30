"use client";

import dynamic from "next/dynamic";

// Dynamic import with no SSR - this loads AFTER the HTML is rendered
const InteractiveDemo = dynamic(
  () => import("@/components/demo/InteractiveDemo.client"),
  {
    ssr: false,
    loading: () => (
      <div className="border-2 border-gray-300 rounded-lg p-6 bg-gray-50 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    ),
  }
);

export default function InteractiveDemoWrapper() {
  return <InteractiveDemo />;
}
