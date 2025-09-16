"use client";

import { useState } from "react";
import { X, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SidebarButton from "./sidebar/SidebarButton";
import sidebarMenuItems from "./sidebar/menuItems";

export default function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  return (
    <>
      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-background shadow-lg z-50 transform transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Card className="h-full rounded-none border-0 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between border-b shrink-0">
            <CardTitle>Menu</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-2">
            <nav className="flex flex-col gap-1">
              {sidebarMenuItems.map(item => (
                <div key={item.id}>
                  {item.submenu ? (
                    <>
                      {/* Parent item with submenu */}
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => toggleExpanded(item.id)}
                      >
                        <span className="flex items-center gap-2 flex-1">
                          {item.icon}
                          <span>{item.label}</span>
                        </span>
                        {expandedItems.includes(item.id) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>

                      {/* Submenu items */}
                      {expandedItems.includes(item.id) && (
                        <div className="ml-4 mt-1 space-y-1">
                          {item.submenu.map(subitem => (
                            <SidebarButton
                              key={subitem.id}
                              href={subitem.href}
                              icon={subitem.icon}
                              label={subitem.label}
                              onClick={onClose}
                            />
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    /* Regular item without submenu */
                    <SidebarButton
                      href={item.href}
                      icon={item.icon}
                      label={item.label}
                      onClick={onClose}
                    />
                  )}
                </div>
              ))}
            </nav>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
