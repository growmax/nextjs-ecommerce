// "use client" required because toast runs in the browser
"use client";

import { Toaster, toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function SonnerRichBuiltin() {
  return (
    <div>
      {/* enables richer success/error/info/warning colors */}
      <Toaster richColors position="top-right" />

      <Button
        onClick={() =>
          toast.success("Saved!", {
            description: "All changes were saved successfully.",
            // optional: you can pass action, duration, onDismiss etc.
            action: {
              label: "Undo",
              onClick: () => {
                /* Undo clicked */
              },
            },
          })
        }
      >
        Show rich success toast
      </Button>
    </div>
  );
}
