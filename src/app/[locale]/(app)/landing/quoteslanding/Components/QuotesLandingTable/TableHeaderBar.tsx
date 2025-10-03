"use client";

import { Button } from "@/components/ui/button";
import { Filter, Plus, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface TableHeaderBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  handleOpenDrawer: () => void;
  handleExport: () => void;
  setRowPerPage: (rows: number) => void;
}

export default function TableHeaderBar({
  activeTab,
  setActiveTab,
  handleOpenDrawer,
  handleExport,
  setRowPerPage,
}: TableHeaderBarProps) {
  return (
    <div className="flex justify-between items-center">
      {/* Left Side - Tabs and Add Filter */}
      <div className="flex items-center gap-2">
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          <Button
            variant={activeTab === "ALL" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("ALL")}
            className={activeTab === "ALL" ? "bg-white shadow-sm" : ""}
          >
            ALL
          </Button>
        </div>
        <Button
          onClick={handleOpenDrawer}
          variant="ghost"
          size="sm"
          title="Add Filter"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Right Side - Settings and Filter Button */}
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" title="Table Settings">
              <Settings className="h-4 w-4" />
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
            <DropdownMenuItem onClick={() => setRowPerPage(25)}>
              Show 25 rows
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setRowPerPage(50)}>
              Show 50 rows
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setRowPerPage(100)}>
              Show 100 rows
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button onClick={handleOpenDrawer} variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Open Filters
        </Button>
      </div>
    </div>
  );
}
