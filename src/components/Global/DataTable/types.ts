import type {
  ColumnDef,
  ColumnFiltersState,
  OnChangeFn,
  PaginationState,
  Row,
  RowSelectionState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import type { ReactNode } from "react";

export interface DataTableTab {
  value: string;
  label: string;
  content?: ReactNode;
  badge?: string | number;
}

export interface DataTablePaginationConfig {
  pageIndex: number;
  pageSize: number;
}

export interface DataTableProps<TData> {
  // Required
  data: TData[];
  columns: ColumnDef<TData>[];

  // === PAGINATION ===
  pagination?: DataTablePaginationConfig;
  onPaginationChange?: OnChangeFn<PaginationState>;
  totalCount?: number; // For server-side pagination
  pageSizeOptions?: number[]; // Default: [10, 20, 30, 40, 50]
  manualPagination?: boolean; // Set true for server-side pagination

  // === DRAG & DROP ===
  enableDragDrop?: boolean;
  onDragEnd?: (reorderedData: TData[]) => void;

  // === ROW SELECTION ===
  enableSelection?: boolean;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;

  // === ACTIONS COLUMN ===
  enableActions?: boolean;
  renderRowActions?: (row: Row<TData>) => ReactNode;

  // === COLUMN VISIBILITY ===
  enableColumnVisibility?: boolean;
  columnVisibility?: VisibilityState;
  onColumnVisibilityChange?: OnChangeFn<VisibilityState>;

  // === SORTING ===
  enableSorting?: boolean;
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  manualSorting?: boolean; // Set true for server-side sorting

  // === FILTERING ===
  enableFiltering?: boolean;
  columnFilters?: ColumnFiltersState;
  onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>;
  manualFiltering?: boolean; // Set true for server-side filtering

  // === TOOLBAR ===
  enableToolbar?: boolean;
  toolbarActions?: ReactNode; // Custom buttons/actions in toolbar
  showAddButton?: boolean;
  onAddClick?: () => void;
  addButtonLabel?: string;

  // === TABS ===
  tabs?: DataTableTab[];
  defaultTab?: string;

  // === UI CUSTOMIZATION ===
  isLoading?: boolean;
  emptyMessage?: string;
  getRowId?: (row: TData, index: number) => string;
  onRowClick?: (row: Row<TData>) => void;
  className?: string;
  tableClassName?: string;

  // === SELECTION INFO ===
  showSelectionInfo?: boolean; // Show "X of Y rows selected"

  // === PAGINATION CONTROLS ===
  showPagination?: boolean; // Default: true
  showPageSizeSelector?: boolean; // Default: true (desktop only)
  showFirstLastButtons?: boolean; // Default: true (desktop only)
}
