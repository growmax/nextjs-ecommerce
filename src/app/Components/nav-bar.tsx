"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "./logo";
import SearchBox from "./search";
import NotificationButton from "./notifications";
import AddCardButton from "./add-card";
import ProfileButton from "./profile";
import Sidebar from "./sidebar";

export default function NavBar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      {/* Top Navigation */}
      <nav className="flex items-center justify-between px-4 py-3 border-b bg-background">
        {/* Left Section */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open menu"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Logo />
        </div>

        {/* Middle Section - Search */}
        <div className="flex-1 max-w-xl mx-4">
          <SearchBox />
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          <NotificationButton />
          <AddCardButton />
          <ProfileButton />
        </div>
      </nav>

      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </>
  );
}
