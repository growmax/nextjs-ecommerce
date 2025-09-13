"use client";

import { useState } from "react";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import Sidebar from "@/app/Components/sidebar";
// import Sidebar from "./sidebar"; // adjust path

export default function SettingsButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Settings Trigger Button */}
      <Button
        variant="ghost"
        className="flex items-center gap-2"
        onClick={() => setOpen(true)}
      >
        <Settings className="h-4 w-4" />
        Settings
      </Button>

      {/* Render sidebar only when open */}
      {open && <Sidebar open={open} onClose={() => setOpen(false)} />}
    </>
  );
}
