import { Grid } from "lucide-react";

export default async function CategoryPage() {

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-3">
        <Grid className="h-8 w-8" />
        <h1 className="text-3xl font-bold">Categories</h1>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <p className="text-muted-foreground">
          Category Page
        </p>
        {/* Add your category content here */}
      </div>
    </div>
  );
}
