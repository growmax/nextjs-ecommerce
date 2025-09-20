import {
  SaveCancelAlertExample,
  SaveCancelDialogExample,
  SaveCancelToolbarExample,
} from "@/components/examples/save-cancel-examples";
import { CenteredLayout } from "@/components/layout/PageContent";

export default async function Home() {
  return (
    <CenteredLayout className="min-h-screen bg-background">
      <div className="space-y-8">
        <div className="flex items-center justify-center h-full">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold">SaveCancel Components Demo</h1>
            <p className="text-muted-foreground">
              Test the migrated SaveCancel components
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          <div className="grid gap-8 md:grid-cols-1">
            <div className="bg-card border rounded-lg p-6">
              <SaveCancelToolbarExample />
            </div>

            <div className="bg-card border rounded-lg p-6">
              <SaveCancelDialogExample />
            </div>

            <div className="bg-card border rounded-lg p-6">
              <SaveCancelAlertExample />
            </div>
          </div>
        </div>
      </div>
    </CenteredLayout>
  );
}
