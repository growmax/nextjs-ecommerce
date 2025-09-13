"use client";

import { User, Settings, Building2, IdCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

export default function ProfileButton() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <User className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Nested Settings Menu */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuSubTrigger>

          <DropdownMenuSubContent className="w-48">
            <DropdownMenuItem asChild>
              <Link href="/company" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Company
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link href="/profile" className="flex items-center gap-2">
                <IdCard className="h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
