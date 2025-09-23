"use client";

import { useState, useRef } from "react";
import { Plus, Download, Upload, Trash2, Edit, Share } from "lucide-react";
import { DashboardToolbar } from "@/components/custom/dashboard-toolbar";
import { ActionToolbar } from "@/components/custom/action-toolbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import type { DashboardToolbarRef } from "@/types/dashboard-toolbar";

interface ExampleItem {
  id: string;
  name: string;
  status: "active" | "pending" | "inactive";
}

const mockItems: ExampleItem[] = [
  { id: "1", name: "Product Alpha", status: "active" },
  { id: "2", name: "Product Beta", status: "pending" },
  { id: "3", name: "Product Gamma", status: "inactive" },
  { id: "4", name: "Product Delta", status: "active" },
  { id: "5", name: "Product Epsilon", status: "pending" },
];

/**
 * Dashboard Toolbar Examples
 *
 * Demonstrates various configurations and use cases for the DashboardToolbar
 * and ActionToolbar components.
 */
export function DashboardToolbarExamples() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "grid" | "board">("list");
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeFilters, setActiveFilters] = useState(0);

  const toolbarRef = useRef<DashboardToolbarRef>(null);

  // Handlers
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    toast.info(`Searching for: ${query}`);
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
    toast.success("Data refreshed");
  };

  const handleAddNew = () => {
    toast.success("Add new item clicked");
  };

  const handleExport = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    toast.success("Export completed");
  };

  const handleBulkDelete = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSelectedItems(new Set());
    setIsLoading(false);
    toast.success(`Deleted ${selectedItems.size} items`);
  };

  const handleItemSelect = (itemId: string, checked: boolean) => {
    const newSelection = new Set(selectedItems);
    if (checked) {
      newSelection.add(itemId);
    } else {
      newSelection.delete(itemId);
    }
    setSelectedItems(newSelection);
  };

  const handleSelectAll = () => {
    if (selectedItems.size === mockItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(mockItems.map(item => item.id)));
    }
  };

  const handleFormSave = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsEditing(false);
    setIsLoading(false);
    toast.success("Changes saved");
  };

  const handleFormCancel = () => {
    setIsEditing(false);
    toast.info("Changes cancelled");
  };

  return (
    <div className="space-y-8">
      {/* Basic Dashboard Toolbar */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Dashboard Toolbar</CardTitle>
          <CardDescription>
            A simple toolbar with title, search, and basic actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DashboardToolbar
            ref={toolbarRef}
            title="Products"
            showSearch={{
              condition: true,
              placeholder: "Search products...",
              searchTextValue: searchQuery,
              handleSearch,
              handleClearAll: () => setSearchQuery(""),
            }}
            primary={{
              condition: true,
              value: "Add Product",
              handleClick: handleAddNew,
              startIcon: <Plus className="h-4 w-4" />,
            }}
            refresh={{
              condition: true,
              handleRefresh,
              loading: isLoading,
            }}
            position="relative"
          />
        </CardContent>
      </Card>

      {/* Advanced Dashboard Toolbar */}
      <Card>
        <CardHeader>
          <CardTitle>Advanced Dashboard Toolbar</CardTitle>
          <CardDescription>
            Full-featured toolbar with filters, view toggles, and multiple
            actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DashboardToolbar
            title="Advanced Product Management"
            label={{
              condition: true,
              value: "Beta",
              variant: "secondary",
            }}
            filter={{
              condition: true,
              handleClick: () => {
                setShowFilters(!showFilters);
                setActiveFilters(activeFilters > 0 ? 0 : 3);
              },
              isActive: showFilters,
              count: activeFilters,
            }}
            showSearch={{
              condition: true,
              placeholder: "Search products, SKUs, or categories...",
              searchTextValue: searchQuery,
              handleSearch,
              handleClearAll: () => setSearchQuery(""),
            }}
            filterChips={{
              condition: activeFilters > 0,
              value: (
                <div className="flex gap-2">
                  <Badge variant="outline">Status: Active</Badge>
                  <Badge variant="outline">Category: Electronics</Badge>
                  <Badge variant="outline">Price: $100-$500</Badge>
                </div>
              ),
            }}
            secondary={{
              condition: true,
              value: "Export",
              handleClick: handleExport,
              isLoading,
              loadingButton: true,
              startIcon: <Download className="h-4 w-4" />,
            }}
            primary={{
              condition: true,
              value: "Add Product",
              handleClick: handleAddNew,
              startIcon: <Plus className="h-4 w-4" />,
            }}
            toggleButton={{
              condition: true,
              value: viewMode,
              handleClick: value =>
                setViewMode(value as "list" | "grid" | "board"),
            }}
            settings={{
              condition: true,
              handleClick: () => toast.info("Settings clicked"),
            }}
            refresh={{
              condition: true,
              handleRefresh,
              loading: isLoading,
            }}
            position="relative"
          />
        </CardContent>
      </Card>

      {/* Example Content with Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Selectable Items with Action Toolbar</CardTitle>
          <CardDescription>
            Select items to see the action toolbar appear
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Toolbar */}
            <DashboardToolbar
              title={`Products (${mockItems.length})`}
              showSearch={{
                condition: true,
                placeholder: "Search products...",
                searchTextValue: searchQuery,
                handleSearch,
                handleClearAll: () => setSearchQuery(""),
              }}
              primary={{
                condition: !isEditing,
                value: "Add Product",
                handleClick: handleAddNew,
                startIcon: <Plus className="h-4 w-4" />,
              }}
              secondary={{
                condition: selectedItems.size === 0 && !isEditing,
                value: "Import",
                handleClick: () => toast.info("Import clicked"),
                startIcon: <Upload className="h-4 w-4" />,
              }}
              refresh={{
                condition: true,
                handleRefresh,
                loading: isLoading,
              }}
              position="relative"
            />

            {/* Item List */}
            <div className="border rounded-lg">
              <div className="p-4 border-b bg-muted/50">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={selectedItems.size === mockItems.length}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all items"
                  />
                  <span className="text-sm font-medium">Select All</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    {isEditing ? "Stop Editing" : "Edit Mode"}
                  </Button>
                </div>
              </div>

              <div className="divide-y">
                {mockItems.map(item => (
                  <div key={item.id} className="p-4 flex items-center gap-3">
                    <Checkbox
                      checked={selectedItems.has(item.id)}
                      onCheckedChange={checked =>
                        handleItemSelect(item.id, checked as boolean)
                      }
                      aria-label={`Select ${item.name}`}
                    />
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      <Badge
                        variant={
                          item.status === "active"
                            ? "default"
                            : item.status === "pending"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {item.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bulk Actions Toolbar */}
            <ActionToolbar
              show={selectedItems.size}
              mode="bulk"
              itemName="product"
              itemNamePlural="products"
              onUncheckAll={() => setSelectedItems(new Set())}
              primaryAction={{
                condition: true,
                text: "Delete Selected",
                clickAction: handleBulkDelete,
                loading: isLoading,
                variant: "destructive",
                icon: <Trash2 className="h-4 w-4" />,
              }}
              secondaryAction={{
                condition: true,
                text: "Share",
                clickAction: () => toast.info("Share clicked"),
                icon: <Share className="h-4 w-4" />,
              }}
              checkAllAction={{
                condition: selectedItems.size < mockItems.length,
                text: "Select All",
                clickAction: handleSelectAll,
              }}
            />

            {/* Form Mode Toolbar */}
            <ActionToolbar
              show={isEditing}
              mode="form"
              formActions={{
                onSave: handleFormSave,
                onCancel: handleFormCancel,
                isSubmitting: isLoading,
                saveText: "Save Changes",
                cancelText: "Cancel",
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Usage Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Examples</CardTitle>
          <CardDescription>
            Code examples for implementing these toolbar components
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Basic Dashboard Toolbar</h4>
              <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                {`<DashboardToolbar
  title="Products"
  showSearch={{
    condition: true,
    placeholder: "Search products...",
    handleSearch: (query) => setSearchQuery(query),
  }}
  primary={{
    condition: true,
    value: "Add Product",
    handleClick: handleAddNew,
    startIcon: <Plus className="h-4 w-4" />,
  }}
  refresh={{
    condition: true,
    handleRefresh: handleRefresh,
    loading: isLoading,
  }}
/>`}
              </pre>
            </div>

            <div>
              <h4 className="font-medium mb-2">
                Action Toolbar for Bulk Actions
              </h4>
              <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                {`<ActionToolbar
  show={selectedItems.size}
  mode="bulk"
  itemName="product"
  onUncheckAll={() => setSelectedItems(new Set())}
  primaryAction={{
    condition: true,
    text: "Delete Selected",
    clickAction: handleBulkDelete,
    variant: "destructive",
  }}
/>`}
              </pre>
            </div>

            <div>
              <h4 className="font-medium mb-2">
                Action Toolbar for Form Actions
              </h4>
              <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                {`<ActionToolbar
  show={isEditing}
  mode="form"
  formActions={{
    onSave: handleFormSave,
    onCancel: handleFormCancel,
    isSubmitting: isLoading,
  }}
/>`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
