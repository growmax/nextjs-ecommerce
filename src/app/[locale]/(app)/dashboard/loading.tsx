export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start p-6">
        <div className="w-full space-y-4">
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          <div className="h-64 w-full bg-muted animate-pulse rounded" />
        </div>
        <div className="w-full space-y-4">
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          <div className="h-64 w-full bg-muted animate-pulse rounded" />
        </div>
      </div>
    </div>
  );
}
