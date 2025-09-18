"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "./custom/logo";
import SearchBox from "./custom/search";
import NotificationButton from "./notifications";
import AddCardButton from "./sample/add-card";
import ProfileButton from "./profile/ProfileButton";
import Sidebar from "./sidebar";

export default function NavBar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      {/* Mobile-First Top Navigation */}
      <nav className="bg-background px-3 py-2 sm:px-4 sm:py-3">
        {/* Mobile Layout: Stack search below on small screens */}
        <div className="flex flex-col gap-3 sm:hidden">
          {/* Mobile Top Row */}
          <div className="flex items-center justify-between">
            {/* Left Section */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open menu"
                onClick={() => setSidebarOpen(true)}
                className="h-10 w-10"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <Logo />
            </div>

            {/* Right Section - Mobile */}
            <div className="flex items-center gap-1">
              <NotificationButton />
              <AddCardButton />
              <ProfileButton />
            </div>
          </div>

          {/* Mobile Search Row */}
          <div className="px-1">
            <SearchBox />
          </div>
        </div>

        {/* Desktop Layout: Single row */}
        <div className="hidden items-center justify-between sm:flex">
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

          {/* Middle Section - Search (Desktop) */}
          <div className="mx-4 flex-1 max-w-xl">
            <SearchBox />
          </div>

          {/* Right Section - Desktop */}
          <div className="flex items-center gap-2">
            <NotificationButton />
            <AddCardButton />
            <ProfileButton />
          </div>
        </div>
      </nav>

      {/* Mobile-First Sidebar */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </>
  );
}
