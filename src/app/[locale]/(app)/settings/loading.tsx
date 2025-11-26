import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading state for settings parent page
 * Generic skeleton for settings routes
 */
export default function SettingsLoading() {
  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-4 p-6 border rounded-lg">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
