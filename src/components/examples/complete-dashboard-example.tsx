"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Download, Trash2, Eye, Edit, Filter } from "lucide-react";
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
import { DataTable } from "@/components/DataTable";
import { useDashboardToolbar } from "@/hooks/useDashboardToolbar";
import { useBulkSelection } from "@/hooks/useBulkSelection";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { useState, useEffect } from "react";

// Types
interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  status: "active" | "pending" | "inactive";
  category: string;
  createdAt: string;
  updatedAt: string;
}

interface ProductFilters {
  search?: string;
  status?: string;
  category?: string;
}

// Mock API service
const productService = {
  async getProducts(filters: ProductFilters = {}) {
    await new Promise(resolve => setTimeout(resolve, 500));

    const mockData: Product[] = Array.from({ length: 25 }, (_, i) => ({
      id: `prod-${i + 1}`,
      name: `Product ${i + 1}`,
      sku: `SKU-${1000 + i}`,
      price: Math.floor(Math.random() * 1000) + 50,
      status: (["active", "pending", "inactive"] as const)[
        Math.floor(Math.random() * 3)
      ],
      category: ["Electronics", "Clothing", "Books", "Home"][
        Math.floor(Math.random() * 4)
      ],
      createdAt: new Date(
        Date.now() - Math.random() * 10000000000
      ).toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    // Apply filters
    let filtered = mockData;
    if (filters.search) {
      filtered = filtered.filter(
        p =>
          p.name.toLowerCase().includes(filters.search!.toLowerCase()) ||
          p.sku.toLowerCase().includes(filters.search!.toLowerCase())
      );
    }
    if (filters.status) {
      filtered = filtered.filter(p => p.status === filters.status);
    }
    if (filters.category) {
      filtered = filtered.filter(p => p.category === filters.category);
    }

    return filtered;
  },

  async deleteProducts(_productIds: string[]) {
    await new Promise(resolve => setTimeout(resolve, 1000));
  },

  async exportProducts(_productIds?: string[]) {
    await new Promise(resolve => setTimeout(resolve, 2000));
  },
};

/**
 * Complete Dashboard Example
 *
 * A comprehensive example showing how to use the dashboard toolbar components
 * with custom hooks for state management and API integration.
 */
export function CompleteDashboardExample() {
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();

  // Dashboard toolbar state
  const toolbar = useDashboardToolbar({
    enableSearch: true,
    enableViewToggle: true,
    enableFilters: true,
    searchDebounce: 300,
  });

  // Additional filters state
  const [filters, setFilters] = useState<ProductFilters>({});

  // Update filters when search changes
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      search: toolbar.debouncedSearch || undefined,
    }));
  }, [toolbar.debouncedSearch]);

  // Data fetching
  const {
    data: products = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["products", filters],
    queryFn: () => productService.getProducts(filters),
    staleTime: 30000,
  });

  // Bulk selection state
  const selection = useBulkSelection({
    items: products,
    getItemId: item => item.id,
    maxSelection: 50, // Optional limit
  });

  // Mutations
  const deleteProductsMutation = useMutation({
    mutationFn: productService.deleteProducts,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      selection.actions.unselectAll();
      toast.success(`Deleted ${selection.state.selectedCount} products`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete: ${error.message}`);
    },
  });

  const exportProductsMutation = useMutation({
    mutationFn: (productIds?: string[]) =>
      productService.exportProducts(productIds),
    onSuccess: () => {
      toast.success("Export completed");
    },
  });

  // Event handlers
  const handleRefresh = () => {
    refetch();
    toolbar.actions.setLoading(false);
  };

  const handleAddProduct = () => {
    toast.info("Add product clicked");
  };

  const handleBulkDelete = () => {
    deleteProductsMutation.mutate(selection.selectedIds);
  };

  const handleExportAll = () => {
    exportProductsMutation.mutate();
  };

  const handleExportSelected = () => {
    exportProductsMutation.mutate(selection.selectedIds);
  };

  const handleFilterChange = (key: keyof ProductFilters, value: string) => {
    const newFilters = { ...filters, [key]: value || undefined };
    setFilters(newFilters);
  };

  // Filter chips component
  const FilterChips = () => {
    const activeFilters = Object.entries(filters).filter(
      ([, value]) => value !== undefined && value !== ""
    );

    if (activeFilters.length === 0) return null;

    return (
      <div className="flex gap-2 flex-wrap">
        {activeFilters.map(([key, value]) => (
          <Badge key={key} variant="outline" className="gap-1">
            {key}: {value}
            <button
              onClick={() =>
                handleFilterChange(key as keyof ProductFilters, "")
              }
              className="ml-1 hover:bg-muted rounded-full"
            >
              ×
            </button>
          </Badge>
        ))}
      </div>
    );
  };

  // Table columns
  const columns = [
    {
      id: "select",
      header: ({
        table: _table,
      }: {
        table: {
          getIsAllPageRowsSelected: () => boolean;
          getIsSomePageRowsSelected: () => boolean;
          toggleAllPageRowsSelected: (value?: boolean) => void;
        };
      }) => (
        <Checkbox
          checked={selection.state.isAllSelected}
          indeterminate={selection.state.isPartiallySelected}
          onCheckedChange={selection.handlers.onSelectAll}
          aria-label="Select all"
        />
      ),
      cell: ({
        row: _row,
      }: {
        row: {
          getIsSelected: () => boolean;
          toggleSelected: (value?: boolean) => void;
          original: Product;
        };
      }) => (
        <Checkbox
          checked={selection.actions.isItemSelected(row.original.id)}
          onCheckedChange={checked =>
            selection.handlers.onItemSelect(row.original.id, checked as boolean)
          }
          aria-label={`Select ${row.original.name}`}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: "Product",
      cell: ({
        row: _row,
      }: {
        row: {
          getIsSelected: () => boolean;
          toggleSelected: (value?: boolean) => void;
          original: Product;
        };
      }) => (
        <div>
          <div className="font-medium">{row.original.name}</div>
          <div className="text-sm text-muted-foreground">
            {row.original.sku}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }: { row: { original: Product } }) =>
        `$${row.original.price.toFixed(2)}`,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({
        row: _row,
      }: {
        row: {
          getIsSelected: () => boolean;
          toggleSelected: (value?: boolean) => void;
          original: Product;
        };
      }) => (
        <Badge
          variant={
            row.original.status === "active"
              ? "default"
              : row.original.status === "pending"
                ? "secondary"
                : "outline"
          }
        >
          {row.original.status}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({
        row: _row,
      }: {
        row: {
          getIsSelected: () => boolean;
          toggleSelected: (value?: boolean) => void;
          original: Product;
        };
      }) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      ),
      enableSorting: false,
    },
  ];

  if (isError) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Error</CardTitle>
          <CardDescription>
            {error?.message || "Failed to load products"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => refetch()}>Retry</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Complete Dashboard Example</CardTitle>
          <CardDescription>
            Demonstrates the dashboard toolbar with hooks for state management
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Main Toolbar */}
          <DashboardToolbar
            ref={toolbar.toolbarRef}
            title="Product Management"
            label={{
              condition: true,
              value: `${products.length} items`,
              variant: "secondary",
            }}
            filter={toolbar.getFilterConfig()}
            showSearch={toolbar.getSearchConfig()}
            filterChips={{
              condition: toolbar.hasActiveFilters,
              value: <FilterChips />,
            }}
            secondary={{
              condition: !isMobile,
              value: "Export All",
              handleClick: handleExportAll,
              isLoading: exportProductsMutation.isPending,
              loadingButton: true,
              startIcon: <Download className="h-4 w-4" />,
            }}
            primary={{
              condition: true,
              value: "Add Product",
              handleClick: handleAddProduct,
              startIcon: <Plus className="h-4 w-4" />,
            }}
            toggleButton={toolbar.getToggleButtonConfig()}
            refresh={{
              condition: true,
              handleRefresh,
              loading: isLoading,
            }}
            loading={isLoading}
            position="relative"
          />

          {/* Filter Panel */}
          {toolbar.state.showFilters && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <select
                      className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2"
                      value={filters.status || ""}
                      onChange={e =>
                        handleFilterChange("status", e.target.value)
                      }
                    >
                      <option value="">All Statuses</option>
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Category</label>
                    <select
                      className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2"
                      value={filters.category || ""}
                      onChange={e =>
                        handleFilterChange("category", e.target.value)
                      }
                    >
                      <option value="">All Categories</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Clothing">Clothing</option>
                      <option value="Books">Books</option>
                      <option value="Home">Home</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      onClick={toolbar.actions.clearFilters}
                      className="w-full"
                    >
                      Clear Filters
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Selection Summary */}
          {selection.state.selectedCount > 0 && (
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <strong>{selection.state.selectedCount}</strong> of{" "}
                  <strong>{products.length}</strong> products selected
                  {selection.stats.isAtMaxCapacity && (
                    <span className="text-orange-600 ml-2">
                      (Maximum reached)
                    </span>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selection.handlers.onUnselectAll}
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          )}

          {/* Data Table */}
          <DataTable columns={columns} data={products} loading={isLoading} />

          {/* Action Toolbar */}
          <ActionToolbar
            show={selection.state.selectedCount}
            mode="bulk"
            itemName="product"
            onUncheckAll={selection.handlers.onUnselectAll}
            primaryAction={{
              condition: true,
              text: "Delete Selected",
              clickAction: handleBulkDelete,
              loading: deleteProductsMutation.isPending,
              variant: "destructive",
              icon: <Trash2 className="h-4 w-4" />,
            }}
            secondaryAction={{
              condition: true,
              text: "Export Selected",
              clickAction: handleExportSelected,
              loading: exportProductsMutation.isPending,
              icon: <Download className="h-4 w-4" />,
            }}
            checkAllAction={{
              condition: !selection.state.isAllSelected && products.length > 0,
              text: "Select All",
              clickAction: selection.actions.selectAll,
            }}
          />
        </CardContent>
      </Card>

      {/* Usage Information */}
      <Card>
        <CardHeader>
          <CardTitle>Implementation Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium">Key Features Demonstrated:</h4>
            <ul className="list-disc pl-6 space-y-1 text-sm">
              <li>Integrated search with debouncing</li>
              <li>Advanced filtering with active filter chips</li>
              <li>Bulk selection with maximum limits</li>
              <li>Loading states and error handling</li>
              <li>Mobile-responsive design</li>
              <li>React Query integration</li>
              <li>Custom hooks for state management</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium">Hooks Used:</h4>
            <ul className="list-disc pl-6 space-y-1 text-sm">
              <li>
                <code>useDashboardToolbar</code> - Toolbar state management
              </li>
              <li>
                <code>useBulkSelection</code> - Selection state management
              </li>
              <li>
                <code>useQuery</code> - Data fetching
              </li>
              <li>
                <code>useMutation</code> - Async actions
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
