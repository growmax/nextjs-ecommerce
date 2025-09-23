"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Download, Trash2, Filter, Eye } from "lucide-react";
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
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import type { DashboardToolbarRef } from "@/types/dashboard-toolbar";

// Mock API service calls - replace with your actual API services
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
  priceRange?: { min: number; max: number };
}

interface ProductsResponse {
  data: Product[];
  total: number;
  page: number;
  pageSize: number;
}

// Mock API functions - replace with your actual API service calls
const mockApiService = {
  async getProducts(
    page: number = 1,
    pageSize: number = 10,
    filters: ProductFilters = {}
  ): Promise<ProductsResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Mock data
    const mockProducts: Product[] = Array.from({ length: 50 }, (_, i) => ({
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
    let filteredProducts = mockProducts;

    if (filters.search) {
      filteredProducts = filteredProducts.filter(
        p =>
          p.name.toLowerCase().includes(filters.search!.toLowerCase()) ||
          p.sku.toLowerCase().includes(filters.search!.toLowerCase())
      );
    }

    if (filters.status) {
      filteredProducts = filteredProducts.filter(
        p => p.status === filters.status
      );
    }

    if (filters.category) {
      filteredProducts = filteredProducts.filter(
        p => p.category === filters.category
      );
    }

    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedProducts = filteredProducts.slice(start, end);

    return {
      data: paginatedProducts,
      total: filteredProducts.length,
      page,
      pageSize,
    };
  },

  async deleteProducts(productIds: string[]): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    // eslint-disable-next-line no-console
    console.log("Deleting products:", productIds);
  },

  async exportProducts(filters: ProductFilters = {}): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 2000));
    // eslint-disable-next-line no-console
    console.log("Exporting products with filters:", filters);
  },

  async createProduct(productData: Partial<Product>): Promise<Product> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      id: `prod-${Date.now()}`,
      name: productData.name || "New Product",
      sku: `SKU-${Date.now()}`,
      price: productData.price || 0,
      status: productData.status || "pending",
      category: productData.category || "Electronics",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },
};

/**
 * Dashboard with API Integration Example
 *
 * Demonstrates how to integrate the DashboardToolbar and ActionToolbar
 * with real API services, state management, and data fetching.
 */
export function DashboardWithApiIntegration() {
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();
  const toolbarRef = useRef<DashboardToolbarRef>(null);

  // State management
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [filters, setFilters] = useState<ProductFilters>({});
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(
    new Set()
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid" | "board">("list");
  const [showFilters, setShowFilters] = useState(false);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Update filters when search changes
  useEffect(() => {
    setFilters(prev => ({ ...prev, search: debouncedSearch }));
    setCurrentPage(1); // Reset to first page when searching
  }, [debouncedSearch]);

  // Data fetching with React Query
  const {
    data: productsResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["products", currentPage, pageSize, filters],
    queryFn: () => mockApiService.getProducts(currentPage, pageSize, filters),
    staleTime: 30000, // Consider data fresh for 30 seconds
    gcTime: 300000, // Keep in cache for 5 minutes
  });

  // Mutations
  const deleteProductsMutation = useMutation({
    mutationFn: mockApiService.deleteProducts,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setSelectedProducts(new Set());
      toast.success("Products deleted successfully");
    },
    onError: error => {
      toast.error(`Failed to delete products: ${error.message}`);
    },
  });

  const exportProductsMutation = useMutation({
    mutationFn: () => mockApiService.exportProducts(filters),
    onSuccess: () => {
      toast.success("Export completed successfully");
    },
    onError: error => {
      toast.error(`Export failed: ${error.message}`);
    },
  });

  const createProductMutation = useMutation({
    mutationFn: mockApiService.createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product created successfully");
    },
    onError: error => {
      toast.error(`Failed to create product: ${error.message}`);
    },
  });

  // Event handlers
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  const handleRefresh = useCallback(() => {
    refetch();
    toast.success("Data refreshed");
  }, [refetch]);

  const handleAddProduct = useCallback(() => {
    createProductMutation.mutate({
      name: `New Product ${Date.now()}`,
      status: "pending",
    });
  }, [createProductMutation]);

  const handleExport = useCallback(() => {
    exportProductsMutation.mutate();
  }, [exportProductsMutation]);

  const handleBulkDelete = useCallback(() => {
    if (selectedProducts.size === 0) return;
    deleteProductsMutation.mutate(Array.from(selectedProducts));
  }, [selectedProducts, deleteProductsMutation]);

  const handleProductSelect = useCallback(
    (productId: string, checked: boolean) => {
      setSelectedProducts(prev => {
        const newSet = new Set(prev);
        if (checked) {
          newSet.add(productId);
        } else {
          newSet.delete(productId);
        }
        return newSet;
      });
    },
    []
  );

  const handleSelectAll = useCallback(() => {
    if (!productsResponse?.data) return;

    const allProductIds = productsResponse.data.map(p => p.id);
    if (selectedProducts.size === allProductIds.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(allProductIds));
    }
  }, [productsResponse?.data, selectedProducts.size]);

  const handleUnselectAll = useCallback(() => {
    setSelectedProducts(new Set());
  }, []);

  const handleFilterToggle = useCallback(() => {
    setShowFilters(!showFilters);
  }, [showFilters]);

  const handleViewModeChange = useCallback((mode: string | null) => {
    if (mode) {
      setViewMode(mode as "list" | "grid" | "board");
    }
  }, []);

  // Active filters count
  const activeFiltersCount = Object.values(filters).filter(
    v => v !== undefined && v !== "" && v !== null
  ).length;

  // Filter chips
  const filterChips =
    activeFiltersCount > 0 ? (
      <div className="flex gap-2 flex-wrap">
        {filters.search && (
          <Badge variant="outline">Search: {filters.search}</Badge>
        )}
        {filters.status && (
          <Badge variant="outline">Status: {filters.status}</Badge>
        )}
        {filters.category && (
          <Badge variant="outline">Category: {filters.category}</Badge>
        )}
      </div>
    ) : null;

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
          checked={selectedProducts.size === productsResponse?.data?.length}
          onCheckedChange={handleSelectAll}
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
          checked={selectedProducts.has(row.original.id)}
          onCheckedChange={checked =>
            handleProductSelect(row.original.id, checked as boolean)
          }
          aria-label={`Select ${row.original.name}`}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: "Product Name",
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
      cell: ({
        row: _row,
      }: {
        row: {
          getIsSelected: () => boolean;
          toggleSelected: (value?: boolean) => void;
          original: Product;
        };
      }) => <span>${row.original.price.toFixed(2)}</span>,
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
        <Button variant="ghost" size="sm">
          <Eye className="h-4 w-4" />
        </Button>
      ),
      enableSorting: false,
    },
  ];

  if (isError) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">
            Error Loading Products
          </CardTitle>
          <CardDescription>
            {error?.message || "An error occurred while loading products"}
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
      {/* Main Dashboard Toolbar */}
      <DashboardToolbar
        ref={toolbarRef}
        title="Product Management"
        label={{
          condition: true,
          value: "v2.0",
          variant: "secondary",
        }}
        filter={{
          condition: true,
          handleClick: handleFilterToggle,
          isActive: showFilters,
          count: activeFiltersCount,
        }}
        showSearch={{
          condition: true,
          placeholder: "Search products, SKUs...",
          searchTextValue: searchQuery,
          handleSearch,
          handleClearAll: handleClearSearch,
        }}
        filterChips={{
          condition: activeFiltersCount > 0,
          value: filterChips,
        }}
        secondary={{
          condition: !isMobile,
          value: "Export",
          handleClick: handleExport,
          isLoading: exportProductsMutation.isPending,
          loadingButton: true,
          startIcon: <Download className="h-4 w-4" />,
        }}
        primary={{
          condition: true,
          value: "Add Product",
          handleClick: handleAddProduct,
          isLoading: createProductMutation.isPending,
          loadingButton: true,
          startIcon: <Plus className="h-4 w-4" />,
        }}
        toggleButton={{
          condition: !isMobile,
          value: viewMode,
          handleClick: handleViewModeChange,
        }}
        refresh={{
          condition: true,
          handleRefresh,
          loading: isLoading,
        }}
        loading={isLoading}
        position="sticky"
        className="z-40"
      />

      {/* Filter Panel */}
      {showFilters && (
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
                    setFilters(prev => ({
                      ...prev,
                      status: e.target.value || undefined,
                    }))
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
                    setFilters(prev => ({
                      ...prev,
                      category: e.target.value || undefined,
                    }))
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
                  onClick={() => setFilters({})}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Products Table */}
      <Card>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={productsResponse?.data || []}
            loading={isLoading}
          />
        </CardContent>
      </Card>

      {/* Pagination Info */}
      {productsResponse && (
        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <div>
            Showing {(currentPage - 1) * pageSize + 1} to{" "}
            {Math.min(currentPage * pageSize, productsResponse.total)} of{" "}
            {productsResponse.total} products
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage * pageSize >= productsResponse.total}
              onClick={() => setCurrentPage(p => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Bulk Actions Toolbar */}
      <ActionToolbar
        show={selectedProducts.size}
        mode="bulk"
        itemName="product"
        onUncheckAll={handleUnselectAll}
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
          clickAction: () => toast.info("Export selected clicked"),
          icon: <Download className="h-4 w-4" />,
        }}
        checkAllAction={{
          condition:
            selectedProducts.size < (productsResponse?.data?.length || 0),
          text: "Select All",
          clickAction: handleSelectAll,
        }}
      />
    </div>
  );
}
