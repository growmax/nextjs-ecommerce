"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User } from "lucide-react";
import dynamic from "next/dynamic";
import ProfileMenu from "../ProfileMenu/ProfileMenu";

function ProfileDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <User className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-72">
        <ProfileMenu />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Only load on client-side - fixes hydration
export default dynamic(() => Promise.resolve(ProfileDropdown), {
  ssr: false,
});
