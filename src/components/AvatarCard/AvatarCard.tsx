"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRoutePrefetch } from "@/hooks/useRoutePrefetch";
import { cn } from "@/lib/utils";
import { getUserInitials } from "@/utils/General/general";
import {
  AlertCircle,
  Building2,
  IdCard,
  Loader2,
  LogOut,
  RefreshCw,
  ShoppingCart,
  User,
} from "lucide-react";
import Link from "next/link";
import { AvatarCardProps } from "./Avatarcard.types";

export function AvatarCard({
  user,
  onLogout,
  isLoggingOut = false,
  isError = false,
  onRetry,
  trigger,
  align = "end",
  side,
  menuClassName,
}: AvatarCardProps) {
  const { prefetch } = useRoutePrefetch();
  const menuItems = [
    {
      href: "/settings/profile",
      icon: IdCard,
      label: "Profile",
    },
    {
      href: "/settings/company",
      icon: Building2,
      label: "Company Settings",
    },
    {
      href: "/landing/orderslanding",
      icon: ShoppingCart,
      label: "Orders",
    },
    {
      href: "/landing/quoteslanding",
      icon: User,
      label: "Quotes",
    },
  ];
  // Handle logout state
  if (isLoggingOut) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
        <DropdownMenuContent
          className={cn("w-56", menuClassName)}
          align={align}
          {...(side ? { side } : {})}
          forceMount
          aria-label="User account menu - Logging out"
        >
          <DropdownMenuItem disabled className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <div className="flex flex-col">
              <span className="text-sm">Logging out...</span>
              <span className="text-xs text-muted-foreground">Please wait</span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Handle error state
  if (isError) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
        <DropdownMenuContent
          className={cn("w-56", menuClassName)}
          align={align}
          {...(side ? { side } : {})}
          forceMount
          aria-label="User account menu - Error"
        >
          <DropdownMenuItem disabled className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <div className="flex flex-col">
              <span className="text-sm">Failed to load user</span>
              <span className="text-xs text-muted-foreground">
                Please try again
              </span>
            </div>
          </DropdownMenuItem>
          {onRetry && (
            <DropdownMenuItem
              onClick={onRetry}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Retry</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Handle loading state - only for normal loading, not during logout
  if (!user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
        <DropdownMenuContent
          className={cn("w-56", menuClassName)}
          align={align}
          {...(side ? { side } : {})}
          forceMount
          aria-label="User account menu - Loading"
        >
          <DropdownMenuItem disabled className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <div className="flex flex-col">
              <span className="text-sm">Loading user...</span>
              <span className="text-xs text-muted-foreground">Please wait</span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent
        className={cn("w-56 z-[120]", menuClassName)}
        align={align}
        {...(side ? { side } : {})}
        forceMount
        aria-label="User account menu"
      >
        <DropdownMenuLabel className="font-normal p-0">
          <div className="flex items-center gap-2 px-1 py-1.5">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarImage
                src={user.picture || undefined}
                alt={user.displayName || "User"}
                className="aspect-square object-cover"
              />
              <AvatarFallback>
                {getUserInitials(user.displayName || "")}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left leading-tight">
              <p className="truncate text-sm font-semibold">
                {user.displayName}
              </p>
              {user.companyName && user.companyName !== "No company" && (
                <p className="truncate text-xs font-medium text-muted-foreground">
                  {user.companyName}
                </p>
              )}
              {user.email && user.email !== "No email" && (
                <p className="truncate text-xs text-muted-foreground">
                  {user.email}
                </p>
              )}
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {menuItems.map(item => {
          const Icon = item.icon;
          return (
            <DropdownMenuItem key={item.href} asChild>
              <Link href={item.href} onMouseEnter={() => prefetch(item.href)}>
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={onLogout}
          disabled={isLoggingOut}
          className="text-red-600 focus:text-red-600"
        >
          {isLoggingOut ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="h-4 w-4" />
          )}
          <span>{isLoggingOut ? "Logging out..." : "Log out"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
