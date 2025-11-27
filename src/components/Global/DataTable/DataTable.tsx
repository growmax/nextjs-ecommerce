"use client";

import {
    closestCenter,
    DndContext,
    KeyboardSensor,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
    type UniqueIdentifier,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
    arrayMove,
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
    flexRender,
    getCoreRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    type ColumnFiltersState,
    type PaginationState,
    type Row,
    type RowSelectionState,
    type SortingState,
    type VisibilityState,
} from "@tanstack/react-table";
import { ChevronDown, Columns3, Plus } from "lucide-react";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { injectOptionalColumns } from "./columnHelpers";
import { DataTablePagination } from "./DataTablePagination";
import { DraggableRow } from "./DraggableRow";
import type { DataTableProps } from "./types";

export function DataTable<TData>({
  data: initialData,
  columns: userColumns,
  // Pagination
  pagination: controlledPagination,
  onPaginationChange,
  totalCount,
  pageSizeOptions = [10, 20, 30, 40, 50],
  manualPagination = false,
  // Drag & Drop
  enableDragDrop = false,
  onDragEnd,
  // Selection
  enableSelection = false,
  rowSelection: controlledRowSelection,
  onRowSelectionChange,
  // Actions
  enableActions = false,
  renderRowActions,
  // Column Visibility
  enableColumnVisibility = false,
  columnVisibility: controlledColumnVisibility,
  onColumnVisibilityChange,
  // Sorting
  enableSorting = true,
  sorting: controlledSorting,
  onSortingChange,
  manualSorting = false,
  // Filtering
  enableFiltering = true,
  columnFilters: controlledColumnFilters,
  onColumnFiltersChange,
  manualFiltering = false,
  // Toolbar
  enableToolbar = true,
  toolbarActions,
  showAddButton = false,
  onAddClick,
  addButtonLabel = "Add Section",
  // Tabs
  tabs,
  defaultTab,
  // UI
  isLoading = false,
  emptyMessage = "No results.",
  getRowId,
  onRowClick,
  className,
  tableClassName,
  // Pagination controls
  showPagination = true,
  showPageSizeSelector = true,
  showFirstLastButtons = true,
}: DataTableProps<TData>) {
  // Internal states (used only if not controlled)
  const [data, setData] = React.useState(initialData);
  const [internalRowSelection, setInternalRowSelection] =
    React.useState<RowSelectionState>({});
  const [internalColumnVisibility, setInternalColumnVisibility] =
    React.useState<VisibilityState>({});
  const [internalColumnFilters, setInternalColumnFilters] =
    React.useState<ColumnFiltersState>([]);
  const [internalSorting, setInternalSorting] = React.useState<SortingState>(
    []
  );
  const [internalPagination, setInternalPagination] =
    React.useState<PaginationState>({
      pageIndex: 0,
      pageSize: pageSizeOptions[0] || 10,
    });

  // Update internal data when initialData changes
  React.useEffect(() => {
    setData(initialData);
  }, [initialData]);

  // Use controlled state if provided, otherwise use internal
  const rowSelection = controlledRowSelection ?? internalRowSelection;
  const setRowSelection = onRowSelectionChange ?? setInternalRowSelection;

  const columnVisibility =
    controlledColumnVisibility ?? internalColumnVisibility;
  const setColumnVisibility =
    onColumnVisibilityChange ?? setInternalColumnVisibility;

  const columnFilters = controlledColumnFilters ?? internalColumnFilters;
  const setColumnFilters = onColumnFiltersChange ?? setInternalColumnFilters;

  const sorting = controlledSorting ?? internalSorting;
  const setSorting = onSortingChange ?? setInternalSorting;

  const pagination = controlledPagination ?? internalPagination;
  const setPagination = onPaginationChange ?? setInternalPagination;

  // Default getRowId function
  const defaultGetRowId = (row: TData, index: number) => {
    if (
      row &&
      typeof row === "object" &&
      "id" in row &&
      (typeof row.id === "string" || typeof row.id === "number")
    ) {
      return String(row.id);
    }
    return String(index);
  };

  const finalGetRowId = getRowId ?? defaultGetRowId;

  // Inject optional columns (drag, selection, actions)
  const columns = React.useMemo(() => {
    const options: {
      enableDragDrop?: boolean;
      enableSelection?: boolean;
      enableActions?: boolean;
      getRowId?: (row: TData) => string | number;
      renderRowActions?: (row: Row<TData>) => React.ReactNode;
    } = {
      enableDragDrop,
      enableSelection,
      enableActions,
    };

    if (enableDragDrop) {
      options.getRowId = (row: TData) => finalGetRowId(row, 0);
    }

    if (enableActions && renderRowActions) {
      options.renderRowActions = renderRowActions;
    }

    return injectOptionalColumns(userColumns, options);
  }, [
    userColumns,
    enableDragDrop,
    enableSelection,
    enableActions,
    finalGetRowId,
    renderRowActions,
  ]);

  // DnD setup
  const sortableId = React.useId();
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  );

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => data?.map((row, idx) => finalGetRowId(row, idx)) || [],
    [data, finalGetRowId]
  );

  // Table instance
   
  const tableOptions: any = {
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: finalGetRowId,
    enableRowSelection: enableSelection,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination,
    manualSorting,
    manualFiltering,
  };

  if (enableFiltering) {
    tableOptions.getFilteredRowModel = getFilteredRowModel();
    tableOptions.getFacetedRowModel = getFacetedRowModel();
    tableOptions.getFacetedUniqueValues = getFacetedUniqueValues();
  }

  if (enableSorting) {
    tableOptions.getSortedRowModel = getSortedRowModel();
  }

  if (totalCount) {
    tableOptions.pageCount = Math.ceil(totalCount / pagination.pageSize);
  }

  const table = useReactTable(tableOptions);

  // Drag end handler
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setData(currentData => {
        const oldIndex = dataIds.indexOf(active.id);
        const newIndex = dataIds.indexOf(over.id);
        const newData = arrayMove(currentData, oldIndex, newIndex);
        onDragEnd?.(newData);
        return newData;
      });
    }
  }

  // Render toolbar
  const renderToolbar = () => {
    if (!enableToolbar && !enableColumnVisibility && !showAddButton) {
      return null;
    }

    return (
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div className="flex-1">{/* Placeholder for left content */}</div>
        <div className="flex items-center gap-2">
          {enableColumnVisibility && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Columns3 className="h-4 w-4" />
                  <span className="hidden lg:inline">Customize Columns</span>
                  <span className="lg:hidden">Columns</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {table
                  .getAllColumns()
                  .filter(
                    column =>
                      typeof column.accessorFn !== "undefined" &&
                      column.getCanHide()
                  )
                  .map(column => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={value =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {toolbarActions}
          {showAddButton && (
            <Button variant="outline" size="sm" onClick={onAddClick}>
              <Plus className="h-4 w-4" />
              <span className="hidden lg:inline">{addButtonLabel}</span>
            </Button>
          )}
        </div>
      </div>
    );
  };

  // Render table content
  const renderTableContent = () => {
    const tableElement = (
      <div className="overflow-hidden rounded-lg border m-4 md:m-6">
        <Table className={tableClassName}>
          <TableHeader className="bg-muted sticky top-0 z-[1]">
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="**:data-[slot=table-cell]:first:w-8">
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              enableDragDrop ? (
                <SortableContext
                  items={dataIds}
                  strategy={verticalListSortingStrategy}
                >
                  {table.getRowModel().rows.map(row => (
                    <DraggableRow<TData>
                      key={row.id}
                      row={row as Row<TData>}
                      getRowId={(r: TData) => finalGetRowId(r, 0)}
                    />
                  ))}
                </SortableContext>
              ) : (
                table.getRowModel().rows.map(row => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    onClick={() => onRowClick?.(row as Row<TData>)}
                    className={onRowClick ? "cursor-pointer" : undefined}
                  >
                    {row.getVisibleCells().map(cell => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    );

    // Wrap with DndContext if drag & drop is enabled
    if (enableDragDrop) {
      return (
        <DndContext
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={handleDragEnd}
          sensors={sensors}
          id={sortableId}
        >
          {tableElement}
        </DndContext>
      );
    }

    return tableElement;
  };

  // Render with or without tabs
  if (tabs && tabs.length > 0) {
    const firstTabValue = tabs[0]?.value || "default";
    return (
      <Tabs
        defaultValue={defaultTab || firstTabValue}
        className={`w-full flex-col justify-start gap-6 ${className || ""}`}
      >
        <div className="flex items-center justify-between px-4 lg:px-6">
          <Label htmlFor="view-selector" className="sr-only">
            View
          </Label>
          <Select defaultValue={defaultTab || firstTabValue}>
            <SelectTrigger
              className="flex w-fit @4xl/main:hidden"
              size="sm"
              id="view-selector"
            >
              <SelectValue placeholder="Select a view" />
            </SelectTrigger>
            <SelectContent>
              {tabs.map(tab => (
                <SelectItem key={tab.value} value={tab.value}>
                  {tab.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <TabsList className="**:data-[slot=badge]:bg-muted-foreground/30 hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:px-1 @4xl/main:flex">
            {tabs.map(tab => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
                {tab.badge && <Badge variant="secondary">{tab.badge}</Badge>}
              </TabsTrigger>
            ))}
          </TabsList>
          <div className="flex items-center gap-2">{renderToolbar()}</div>
        </div>
        {tabs.map(tab => (
          <TabsContent
            key={tab.value}
            value={tab.value}
            className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
          >
            {tab.content ? (
              tab.content
            ) : (
              <>
                {renderTableContent()}
                {showPagination && (
                  <DataTablePagination
                    table={table}
                    showPageSizeSelector={showPageSizeSelector}
                    showFirstLastButtons={showFirstLastButtons}
                    pageSizeOptions={pageSizeOptions}
                  />
                )}
              </>
            )}
          </TabsContent>
        ))}
      </Tabs>
    );
  }

  // Render without tabs
  return (
    <div className={`flex flex-col ${className || ""}`}>
      {renderToolbar()}
      <div className="flex-1 overflow-auto">
        {renderTableContent()}
      </div>
      {showPagination && (
        <div className="flex-shrink-0 border-t bg-background">
          <DataTablePagination
            table={table}
            showPageSizeSelector={showPageSizeSelector}
            showFirstLastButtons={showFirstLastButtons}
            pageSizeOptions={pageSizeOptions}
          />
        </div>
      )}
    </div>
  );
}
