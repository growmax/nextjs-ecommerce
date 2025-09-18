"use client";

import { CenteredLayout } from "@/components/layout/PageContent";
import { useGlobalLoader } from "@/hooks/useGlobalLoader";

function TestLoaderButton() {
  const { withLogoutLoader } = useGlobalLoader();

  const testLoader = async () => {
    await withLogoutLoader(async () => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert("Loader test completed!");
    });
  };

  return (
    <button
      onClick={testLoader}
      className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
    >
      🔄 Test Global Loader
    </button>
  );
}

export default function Home() {
  return (
    <CenteredLayout className="min-h-screen bg-background">
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Homepage</h1>
          <p className="text-muted-foreground">
            Click the button below to test the global loader
          </p>
          <TestLoaderButton />
        </div>
      </div>
    </CenteredLayout>
  );
}
