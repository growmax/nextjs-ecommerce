"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  useManualNavigationProgress,
  useNavigationProgress 
} from "@/hooks/useNavigationProgress";
import { useNavigationProgressValue } from "@/components/Loaders/NavigationProgress";
import { useRouter } from "@/i18n/navigation";
import { Loader2, Play, Square, RotateCcw } from "lucide-react";

export default function NavigationProgressDemo() {
  const router = useRouter();
  const { startProgress: startAutoProgress, completeProgress } = useManualNavigationProgress();
  const [isCustomProgress, setIsCustomProgress] = useState(false);
  
  const {
    progress,
    isActive,
    startProgress,
    setProgressValue,
    completeProgress: completeCustomProgress,
    resetProgress
  } = useNavigationProgressValue();

  // Demo functions
  const simulateNavigation = () => {
    startAutoProgress("Navigating to page...");
    setTimeout(() => {
      completeProgress();
    }, 2000);
  };

  const simulateApiCall = () => {
    startAutoProgress("Loading data from API...");
    setTimeout(() => {
      completeProgress();
    }, 3000);
  };

  const simulateCustomProgress = () => {
    setIsCustomProgress(true);
    startProgress(0);
    
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.random() * 15 + 5; // Random increments
      setProgressValue(Math.min(currentProgress, 100));
      
      if (currentProgress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          completeCustomProgress();
          setIsCustomProgress(false);
        }, 500);
      }
    }, 200);
  };

  const navigateToSlowPage = () => {
    startAutoProgress("Loading slow page...");
    // Navigate to a page that might take time to load
    router.push("/search?query=slow");
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Navigation Progress Bar Demo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Test the navigation progress bar functionality. Click the buttons below to simulate different scenarios.
          </p>

          {/* Automatic Progress Demos */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Automatic Progress Demos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button 
                onClick={simulateNavigation}
                variant="outline"
                className="justify-start"
              >
                <Play className="mr-2 h-4 w-4" />
                Simulate Navigation
              </Button>

              <Button 
                onClick={simulateApiCall}
                variant="outline"
                className="justify-start"
              >
                <Loader2 className="mr-2 h-4 w-4" />
                Simulate API Call
              </Button>

              <Button 
                onClick={navigateToSlowPage}
                variant="outline"
                className="justify-start"
              >
                <Play className="mr-2 h-4 w-4" />
                Navigate to Slow Page
              </Button>

              <Button 
                onClick={() => completeProgress()}
                variant="outline"
                className="justify-start"
              >
                <Square className="mr-2 h-4 w-4" />
                Stop Progress
              </Button>
            </div>
          </div>

          {/* Custom Progress Demo */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Custom Progress Demo</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Button 
                  onClick={simulateCustomProgress}
                  variant="default"
                  disabled={isActive}
                >
                  <Play className="mr-2 h-4 w-4" />
                  Start Custom Progress
                </Button>
                
                <Button 
                  onClick={resetProgress}
                  variant="outline"
                  disabled={!isActive}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset
                </Button>

                {isActive && (
                  <div className="text-sm text-muted-foreground">
                    Progress: {Math.round(progress)}%
                  </div>
                )}
              </div>

              {/* Progress visualization */}
              {isActive && (
                <div className="w-full bg-secondary rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-200"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Real-world Examples */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Real-world Examples</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button 
                onClick={() => {
                  startAutoProgress("Searching products...");
                  setTimeout(completeProgress, 2500);
                }}
                variant="outline"
                className="justify-start"
              >
                <Play className="mr-2 h-4 w-4" />
                Product Search
              </Button>

              <Button 
                onClick={() => {
                  startAutoProgress("Processing order...");
                  setTimeout(completeProgress, 4000);
                }}
                variant="outline"
                className="justify-start"
              >
                <Play className="mr-2 h-4 w-4" />
                Process Order
              </Button>

              <Button 
                onClick={() => {
                  startAutoProgress("Loading dashboard...");
                  setTimeout(completeProgress, 1800);
                }}
                variant="outline"
                className="justify-start"
              >
                <Play className="mr-2 h-4 w-4" />
                Load Dashboard
              </Button>
            </div>
          </div>

          {/* Status Display */}
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">Current Status:</h4>
            <div className="text-sm space-y-1">
              <div>Navigation Progress: {isActive ? 'Active' : 'Inactive'}</div>
              <div>Progress Value: {Math.round(progress)}%</div>
              <div>Custom Progress Active: {isCustomProgress ? 'Yes' : 'No'}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div>
              <strong>1. Automatic Detection:</strong> The progress bar automatically detects navigation events 
              and shows when pages are loading.
            </div>
            <div>
              <strong>2. Global Integration:</strong> Works seamlessly with your existing LoadingContext 
              and GlobalLoader components.
            </div>
            <div>
              <strong>3. Manual Control:</strong> You can manually control progress for custom operations 
              using the provided hooks.
            </div>
            <div>
              <strong>4. Smart Animation:</strong> The progress bar uses intelligent animation that starts 
              quickly but doesn't complete until the actual operation finishes.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
