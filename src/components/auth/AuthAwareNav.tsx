"use client";

import { ServerUser } from "@/lib/auth-server";
import { useHybridAuth } from "@/hooks/useHybridAuth";
import { useGlobalLoader } from "@/hooks/useGlobalLoader";
import { useUserDetails } from "@/contexts/UserDetailsContext";
import Link from "next/link";
import Image from "next/image";

interface AuthAwareNavProps {
  isAuthenticated?: boolean;
  user?: ServerUser | null;
  initialAuth?: boolean;
  initialUser?: ServerUser | null;
}

/**
 * Navigation component that shows different UI based on authentication status
 *
 * Uses server-side auth detection for perfect SSR, then seamlessly transitions
 * to client-side auth state after hydration.
 */
export function AuthAwareNav({
  isAuthenticated,
  user,
  initialAuth,
  initialUser,
}: AuthAwareNavProps) {
  // Use hybrid auth for smooth SSR -> client transition
  const auth = useHybridAuth(
    isAuthenticated ?? initialAuth,
    user ?? initialUser
  );

  const { showLogoutLoader, hideLoading } = useGlobalLoader();
  const { logout: clientLogout } = useUserDetails();

  const handleLogout = async () => {
    showLogoutLoader();
    try {
      await clientLogout();
      // Redirect will be handled by AuthContext
    } finally {
      hideLoading();
    }
  };

  if (auth.isAuthenticated && auth.user) {
    return <AuthenticatedNav user={auth.user as ServerUser} onLogout={handleLogout} />;
  } else {
    return <PublicNav />;
  }
}

/**
 * Navigation for authenticated users
 */
function AuthenticatedNav({
  user,
  onLogout,
}: {
  user: ServerUser | null;
  onLogout: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      {/* Hamburger Menu */}
      <button
        className="sm:hidden p-2 hover:bg-accent rounded-md"
        aria-label="Open menu"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 19h16"
          />
        </svg>
      </button>

      {/* Desktop Navigation */}
      <nav className="hidden sm:flex items-center gap-4">
        <Link href="/dashboard" className="hover:text-primary">
          Dashboard
        </Link>
        <Link href="/profile" className="hover:text-primary">
          Profile
        </Link>
        <Link href="/company" className="hover:text-primary">
          Company
        </Link>
      </nav>

      {/* User Account Dropdown */}
      <div className="relative">
        <button className="flex items-center gap-2 p-2 hover:bg-accent rounded-md">
          {user?.picture ? (
            <Image
              src={user.picture}
              alt={user.name || "User"}
              width={24}
              height={24}
              className="w-6 h-6 rounded-full"
            />
          ) : (
            <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium">
                {user?.name?.[0] || user?.email?.[0] || "U"}
              </span>
            </div>
          )}
          <span className="text-sm hidden md:block">
            {user?.name || user?.email || "Account"}
          </span>
        </button>

        {/* Dropdown content would go here */}
      </div>

      {/* Logout Button */}
      <button
        onClick={onLogout}
        className="px-3 py-1 text-sm bg-destructive text-destructive-foreground rounded hover:bg-destructive/90"
      >
        Logout
      </button>
    </div>
  );
}

/**
 * Navigation for public (non-authenticated) users
 */
function PublicNav() {
  return (
    <div className="flex items-center gap-2">
      <Link
        href="/login"
        className="px-3 py-1 text-sm border rounded hover:bg-accent"
      >
        Login
      </Link>
      <Link
        href="/register"
        className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90"
      >
        Register
      </Link>
    </div>
  );
}
