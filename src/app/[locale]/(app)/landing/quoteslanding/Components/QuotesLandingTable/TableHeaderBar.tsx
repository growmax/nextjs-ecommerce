"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AddFilterTab } from "./Util/AddFilterTab";
import { Tab } from "./Util/Tab";

interface TableHeaderBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  handleOpenDrawer: () => void;
  handleExport: () => void;
  setRowPerPage: (rows: number) => void;
}

export default function TableHeaderBar({
  handleExport,
  setRowPerPage,
  handleOpenDrawer,
}: TableHeaderBarProps) {
  const [filters, setFilters] = useState<string[]>(["ALL"]);
  const [activeFilter, setActiveFilter] = useState<string>("ALL");

  const handleTabClick = (filter: string) => {
    setActiveFilter(filter);
    // You can add logic here to actually filter the data
  };

  const removeTab = (filter: string): void => {
    const newFilters = filters.filter(f => f !== filter);
    if (newFilters.length === 0) {
      setFilters(["ALL"]);
      setActiveFilter("ALL");
    } else {
      setFilters(newFilters);
      if (activeFilter === filter) {
        setActiveFilter(newFilters[0] ?? "ALL"); // Ensure we always have a fallback
      }
    }
  };

  return (
    <div className="w-full bg-white border-b border-gray-200 flex-shrink-0">
      <div className="flex items-center justify-between h-12 px-4">
        {/* Tab Container with Overflow Handling */}
        <div className="flex-1 flex items-center overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-6 min-w-0">
            {filters.map(filter => (
              <Tab
                key={filter}
                label={filter}
                isActive={activeFilter === filter}
                onSelect={() => handleTabClick(filter)}
                onClose={filter !== "ALL" ? () => removeTab(filter) : undefined}
                allowClose={filter !== "ALL"}
              />
            ))}

            {/* Add Filter Tab Button */}
            <AddFilterTab onClick={handleOpenDrawer} />
          </div>
        </div>

        {/* Right Section - Settings */}
        <div className="flex items-center flex-shrink-0 ml-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-gray-100 rounded-md transition-colors"
              >
                <Settings className="h-4 w-4 text-gray-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Table Settings</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => toast.info("Column settings coming soon")}
              >
                Manage Columns
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport()}>
                Export to CSV
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs">
                Rows per page
              </DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setRowPerPage(20)}>
                20 rows
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setRowPerPage(50)}>
                50 rows
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setRowPerPage(100)}>
                100 rows
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
