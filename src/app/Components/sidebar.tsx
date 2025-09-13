"use client";

import { Building2, IdCard, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <div
      className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-bold">Settings</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Menu Items */}
      <nav className="p-4 space-y-3">
        <Link
          href="/company"
          onClick={onClose}
          className="flex items-center gap-2 p-2 rounded hover:bg-gray-100"
        >
          <Building2 className="h-5 w-5" />
          Company
        </Link>

        <Link
          href="/profile"
          onClick={onClose}
          className="flex items-center gap-2 p-2 rounded hover:bg-gray-100"
        >
          <IdCard className="h-5 w-5" />
          Profile
        </Link>
      </nav>
    </div>
  );
}
