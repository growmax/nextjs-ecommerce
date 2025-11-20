"use client";

import { CardContent, CardTitle } from "@/components/ui/card";
import {
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import useLogout from "@/hooks/Auth/useLogout";
import { useRoutePrefetch } from "@/hooks/useRoutePrefetch";
import {
  Building2,
  FileText,
  Home,
  IdCard,
  LayoutDashboard,
  Loader2,
  LogOut,
  Settings,
  ShoppingBag,
  ShoppingCart,
} from "lucide-react";
import { useRouter } from "next/navigation";
import useUserProfile from "../../hooks/Profile/useUserProfile";

export default function ProfileMenu() {
  const router = useRouter();
  const { userProfile } = useUserProfile();
  const { isLoggingOut, handleLogout } = useLogout();
  const { prefetch } = useRoutePrefetch();

  return (
    <>
      {/* User Profile Section */}
      {userProfile && (
        <DropdownMenuLabel className="font-normal">
          <CardContent className="p-0 space-y-1">
            <CardTitle className="text-sm font-semibold">
              {userProfile.displayName}{" "}
              {userProfile.role &&
                `(${userProfile.role} ${userProfile.accountRole || ""})`}
            </CardTitle>
            <CardContent className="text-sm text-muted-foreground p-0">
              {userProfile.email}
            </CardContent>
            <CardContent className="text-sm p-0">
              {userProfile.companyName}
            </CardContent>
            {userProfile.lastLogin && (
              <CardContent className="text-xs text-muted-foreground p-0">
                Last Login : {userProfile.lastLogin}
              </CardContent>
            )}
          </CardContent>
        </DropdownMenuLabel>
      )}

      <DropdownMenuSeparator />

      {/* Home */}
      <DropdownMenuItem
        onClick={() => {
          prefetch("/");
          router.push("/");
        }}
        onMouseEnter={() => prefetch("/")}
      >
        <Home className="mr-2 h-4 w-4" />
        Home
      </DropdownMenuItem>

      {/* Dashboard */}
      <DropdownMenuItem
        onClick={() => {
          prefetch("/dashboard");
          router.push("/dashboard");
        }}
        onMouseEnter={() => prefetch("/dashboard")}
      >
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
            onClick={() => {
              prefetch("/landing/orderslanding");
              router.push("/landing/orderslanding");
            }}
            onMouseEnter={() => prefetch("/landing/orderslanding")}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Orders
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => {
              prefetch("/landing/quoteslanding");
              router.push("/landing/quoteslanding");
            }}
            onMouseEnter={() => prefetch("/landing/quoteslanding")}
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
          <DropdownMenuItem
            onClick={() => {
              prefetch("/settings/profile");
              router.push("/settings/profile");
            }}
            onMouseEnter={() => prefetch("/settings/profile")}
          >
            <IdCard className="mr-2 h-4 w-4" />
            Profile
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => {
              prefetch("/settings/company");
              router.push("/settings/company");
            }}
            onMouseEnter={() => prefetch("/settings/company")}
          >
            <Building2 className="mr-2 h-4 w-4" />
            Company
          </DropdownMenuItem>
        </DropdownMenuSubContent>
      </DropdownMenuSub>

      <DropdownMenuSeparator />

      {/* Logout Button */}
      <DropdownMenuItem
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="text-red-600 focus:text-red-600"
      >
        {isLoggingOut ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <LogOut className="mr-2 h-4 w-4" />
        )}
        {isLoggingOut ? "Logging out..." : "Logout"}
      </DropdownMenuItem>
    </>
  );
}
