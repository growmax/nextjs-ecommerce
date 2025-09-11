"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "./logo";
import SearchBox from "./search";
import NotificationButton from "./notifications";
import AddCardButton from "./add-card";
import ProfileButton from "./profile";

export default function NavBar() {
  return (
    <nav className="flex items-center justify-between px-4 py-3 border-b bg-background">
      {/* Left section */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon">
          <Menu className="h-5 w-5" />
        </Button>
        <Logo />
      </div>

      {/* Middle section - Search */}
      <div className="flex-1 max-w-xl mx-4">
        <SearchBox />
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2">
        <NotificationButton />
        <AddCardButton />
        <ProfileButton />
      </div>
    </nav>
  );
}
