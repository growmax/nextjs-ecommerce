"use client";

import {
  User,
  Home,
  LayoutDashboard,
  ShoppingBag,
  Settings,
  Building2,
  IdCard,
  ShoppingCart,
  FileText,
} from "lucide-react";
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
import { useRouter } from "next/navigation";

export default function ProfileButton() {
  const router = useRouter();

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

        {/* Home */}
        <DropdownMenuItem onClick={() => router.push("/")}>
          <Home className="mr-2 h-4 w-4" />
          Home
        </DropdownMenuItem>

        {/* Dashboard */}
        <DropdownMenuItem onClick={() => router.push("/dashboard")}>
          <LayoutDashboard className="mr-2 h-4 w-4" />
          Dashboard
        </DropdownMenuItem>

        {/* Sales Submenu */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <ShoppingBag className="mr-2 h-4 w-4" />
            Sales
          </DropdownMenuSubTrigger>

          <DropdownMenuSubContent className="w-48">
            <DropdownMenuItem
              onClick={() => router.push("/landing/orderslanding")}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Orders
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => router.push("/landing/quoteslanding")}
            >
              <FileText className="mr-2 h-4 w-4" />
              Quotes
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Settings Submenu */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </DropdownMenuSubTrigger>

          <DropdownMenuSubContent className="w-48">
            <DropdownMenuItem onClick={() => router.push("/profilesettings")}>
              <IdCard className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => router.push("/companysettings")}>
              <Building2 className="mr-2 h-4 w-4" />
              Company
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
