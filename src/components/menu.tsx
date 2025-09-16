"use client";

import React from "react";
import Link from "next/link";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { Button } from "@/components/ui/button";

const MenubarDemo = () => {
  return (
    <div className="flex items-center justify-between w-full p-4">
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>
              New Tab <MenubarShortcut>⌘T</MenubarShortcut>
            </MenubarItem>
            <MenubarItem>New Window</MenubarItem>
            <MenubarSeparator />
            <MenubarItem>Share</MenubarItem>
            <MenubarSeparator />
            <MenubarItem>Print</MenubarItem>
          </MenubarContent>
        </MenubarMenu>

        <MenubarMenu>
          <MenubarTrigger>Settings</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>Preferences</MenubarItem>
            <MenubarItem>Account Settings</MenubarItem>
            <MenubarSeparator />
            <MenubarItem>Help</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>

      <div className="flex gap-2">
        <Link href="/login">
          <Button variant="outline" size="sm">
            Login
          </Button>
        </Link>
        <Link href="/register">
          <Button size="sm">Register</Button>
        </Link>
      </div>
    </div>
  );
};

export default MenubarDemo;
