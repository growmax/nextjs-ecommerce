"use client";

import { Button } from "@/components/ui/button";
import { Menu, Search, LogIn } from "lucide-react";
import { useState } from "react";
import Logo from "./custom/logo";
import SearchBox from "./custom/search";
import NotificationButton from "./notifications";
import ProfileButton from "./profile/ProfileButton";
import AddCardButton from "./sample/add-card";
import Sidebar from "./sidebar";
import SearchDrawer from "@/components/custom/search-drawer";
import {
  AuthenticatedOnly,
  UnauthenticatedOnly,
} from "@/components/auth/AuthGuard";
import Link from "next/link";

export default function NavBar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchDrawerOpen, setSearchDrawerOpen] = useState(false);

  return (
    <>
      <nav className="bg-background border-b">
        <div className="sm:hidden">
          <div className="flex items-center gap-2 px-2 py-2">
            {/* Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              aria-label="Open menu"
              onClick={() => setSidebarOpen(true)}
              className="h-9 w-9 flex-shrink-0"
            >
              <Menu className="h-5 w-5" />
            </Button>
            {/* Logo - Center */}
            <div className="flex-1 flex justify-center">
              <Logo />
            </div>

            {/* Actions - Right */}
            <div className="flex items-center gap-0.5 flex-shrink-0">
              {/* Search Icon */}
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open search"
                onClick={() => setSearchDrawerOpen(true)}
                className="h-9 w-9"
              >
                <Search className="h-5 w-5" />
              </Button>

              {/* Authenticated Actions */}
              <AuthenticatedOnly>
                <NotificationButton />
                <ProfileButton />
              </AuthenticatedOnly>

              {/* Unauthenticated Actions */}
              <UnauthenticatedOnly>
                <Button variant="ghost" size="icon" asChild>
                  <Link href="/login">
                    <LogIn className="h-5 w-5" />
                  </Link>
                </Button>
              </UnauthenticatedOnly>
            </div>
          </div>
        </div>

        {/* Tablet Layout: Logo visible */}
        <div className="hidden sm:flex md:hidden items-center gap-3 px-3 py-2">
          {/* Left: Menu + Logo */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Open menu"
              onClick={() => setSidebarOpen(true)}
              className="h-9 w-9"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <Logo />
          </div>

          {/* Center: Search */}
          <div className="flex-1 max-w-md">
            <SearchBox size="md" />
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1">
            {/* Authenticated Actions */}
            <AuthenticatedOnly>
              <NotificationButton />
              <AddCardButton />
              <ProfileButton />
            </AuthenticatedOnly>

            {/* Unauthenticated Actions */}
            <UnauthenticatedOnly>
              <Button variant="ghost" size="icon" asChild>
                <Link href="/login">
                  <LogIn className="h-5 w-5" />
                </Link>
              </Button>
            </UnauthenticatedOnly>
          </div>
        </div>

        {/* Desktop Layout: Full featured */}
        <div className="hidden md:flex items-center gap-4 px-4 py-3">
          {/* Left Section */}
          <div className="flex items-center gap-3 flex-shrink-0">
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

          {/* Middle Section - Search (Desktop) */}
          <div className="flex-1 max-w-2xl mx-auto">
            <SearchBox size="md" />
          </div>

          {/* Right Section - Desktop */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Authenticated Actions */}
            <AuthenticatedOnly>
              <NotificationButton />
              <AddCardButton />
              <ProfileButton />
            </AuthenticatedOnly>

            {/* Unauthenticated Actions */}
            <UnauthenticatedOnly>
              <Button variant="default" asChild>
                <Link href="/login">
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </Link>
              </Button>
            </UnauthenticatedOnly>
          </div>
        </div>
      </nav>

      {/* Mobile-First Sidebar */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Mobile Search Drawer */}
      <SearchDrawer
        open={searchDrawerOpen}
        onClose={() => setSearchDrawerOpen(false)}
      />
    </>
  );
}
