"use client";

import * as React from "react";
import { SaveCancelToolbar } from "@/components/custom/save-cancel-toolbar";
import { SaveCancelDialog } from "@/components/custom/save-cancel-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function SaveCancelToolbarExample() {
  const [showToolbar, setShowToolbar] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
    setShowToolbar(false);
    toast.success("Changes saved successfully!");
  };

  const handleCancel = () => {
    setShowToolbar(false);
    toast.info("Changes cancelled");
  };

  return (
    <div className="p-6 space-y-4">
      <h3 className="text-lg font-semibold">SaveCancel Toolbar Example</h3>

      <Button onClick={() => setShowToolbar(true)}>
        Show Save/Cancel Toolbar
      </Button>

      <SaveCancelToolbar
        show={showToolbar}
        onSave={handleSave}
        onCancel={handleCancel}
        isLoading={isLoading}
        saveText="Save Changes"
        cancelText="Cancel"
      />
    </div>
  );
}

export function SaveCancelDialogExample() {
  const [showDialog, setShowDialog] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
    setShowDialog(false);
    toast.success("Form submitted successfully!");
  };

  const handleCancel = () => {
    setShowDialog(false);
    toast.info("Action cancelled");
  };

  return (
    <div className="p-6 space-y-4">
      <h3 className="text-lg font-semibold">SaveCancel Dialog Example</h3>

      <Button onClick={() => setShowDialog(true)}>
        Open Save/Cancel Dialog
      </Button>

      <SaveCancelDialog
        open={showDialog}
        onSave={handleSave}
        onCancel={handleCancel}
        isLoading={isLoading}
        title="Confirm Changes"
        description="Are you sure you want to save these changes? This action cannot be undone."
        saveText="Save Changes"
        cancelText="Cancel"
      >
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            Your changes will be saved to the database and synced across all
            devices.
          </p>
        </div>
      </SaveCancelDialog>
    </div>
  );
}

export function SaveCancelAlertExample() {
  const [showAlert, setShowAlert] = React.useState(false);

  return (
    <div className="p-6 space-y-4">
      <h3 className="text-lg font-semibold">SaveCancel Alert Example</h3>

      <Button variant="destructive" onClick={() => setShowAlert(true)}>
        Show Alert Dialog
      </Button>

      <SaveCancelDialog
        open={showAlert}
        onCancel={() => setShowAlert(false)}
        onSave={() => {}}
        title="Action Required"
        description="This is an alert message that requires acknowledgment."
        alertMode={true}
      />
    </div>
  );
}
