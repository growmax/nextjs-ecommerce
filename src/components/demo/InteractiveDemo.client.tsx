"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export default function InteractiveDemo() {
  const [count, setCount] = useState(0);
  const [hydrationTime, setHydrationTime] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Record when this component hydrates
    const hydrationTimestamp = performance.now();
    setHydrationTime(Math.round(hydrationTimestamp));
    setMounted(true);
  }, []);

  return (
    <div className="border-2 border-green-500 rounded-lg p-6 bg-green-50">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-green-800 mb-2">
          🎯 Interactive Section (Client Component)
        </h3>
        <p className="text-sm text-green-700">
          This section loaded with JavaScript and hydrated progressively!
        </p>
      </div>

      {mounted && hydrationTime && (
        <div className="mb-4 p-3 bg-green-100 rounded border border-green-300">
          <p className="text-sm font-semibold text-green-900">
            ⚡ JavaScript Hydrated at: ~{hydrationTime}ms
          </p>
          <p className="text-xs text-green-700 mt-1">
            Notice: The HTML above loaded instantly, this interactive part came
            later!
          </p>
        </div>
      )}

      <div className="flex items-center gap-4">
        <Button
          onClick={() => setCount(count - 1)}
          variant="outline"
          className="bg-white"
        >
          - Decrease
        </Button>
        <div className="text-2xl font-bold text-green-800 min-w-[60px] text-center">
          {count}
        </div>
        <Button
          onClick={() => setCount(count + 1)}
          variant="outline"
          className="bg-white"
        >
          + Increase
        </Button>
      </div>

      <p className="text-xs text-green-600 mt-4">
        Try clicking the buttons - this proves the component is fully
        interactive!
      </p>
    </div>
  );
}
