"use client";

import React, { useState } from "react";
import { FilterTabs } from "./FilterTabs";
import { toast } from "sonner";

export function FilterTabsDemo() {
  const [tabs, setTabs] = useState([
    { id: "all", label: "All", hasFilter: true },
    { id: "active", label: "Active", hasFilter: false },
    { id: "pending", label: "Pending", hasFilter: true, count: 2 },
  ]);

  const handleTabChange = (value: string) => {
    toast.info(`Switched to ${value} tab`);
  };

  const handleAddTab = () => {
    const newTab = {
      id: `tab-${Date.now()}`,
      label: `New Tab ${tabs.length}`,
      hasFilter: true,
      count: 0,
    };
    setTabs([...tabs, newTab]);
    toast.success("New tab added");
  };

  const handleFilterClick = (tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);
    toast.info(`Filter clicked for ${tab?.label} tab`);
  };

  const handleSettingsClick = () => {
    toast.info("Settings clicked");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Filter Tabs Demo</h1>

      <FilterTabs
        tabs={tabs}
        defaultValue="all"
        onTabChange={handleTabChange}
        onAddTab={handleAddTab}
        onFilterClick={handleFilterClick}
        onSettingsClick={handleSettingsClick}
      >
        <div className="p-4 bg-muted/30 rounded-lg">
          <p>Content for the selected tab goes here.</p>
          <p className="text-sm text-muted-foreground mt-2">
            This content will be displayed for all tabs. You can customize the
            content based on the active tab by checking the tab value.
          </p>
        </div>
      </FilterTabs>
    </div>
  );
}
