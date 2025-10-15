import type { ColumnDef, Row } from "@tanstack/react-table";
import type { ReactNode } from "react";

import { Checkbox } from "@/components/ui/checkbox";

import { DragHandle } from "./DragHandle";

/**
 * Creates a drag handle column for drag and drop functionality
 */
export function createDragHandleColumn<TData>(
  getRowId: (row: TData) => string | number
): ColumnDef<TData> {
  return {
    id: "drag",
    header: () => null,
    cell: ({ row }) => <DragHandle id={getRowId(row.original)} />,
    size: 40,
    enableSorting: false,
    enableHiding: false,
  };
}

/**
 * Creates a selection checkbox column
 */
export function createSelectionColumn<TData>(): ColumnDef<TData> {
  return {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={value => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    size: 40,
    enableSorting: false,
    enableHiding: false,
  };
}

/**
 * Creates an actions column with custom render function
 */
export function createActionsColumn<TData>(
  renderActions: (row: Row<TData>) => ReactNode
): ColumnDef<TData> {
  return {
    id: "actions",
    header: () => null,
    cell: ({ row }) => renderActions(row),
    size: 40,
    enableSorting: false,
    enableHiding: false,
  };
}

/**
 * Injects optional columns (drag, selection, actions) into the column array
 */
export function injectOptionalColumns<TData>(
  columns: ColumnDef<TData>[],
  options: {
    enableDragDrop?: boolean;
    enableSelection?: boolean;
    enableActions?: boolean;
    getRowId?: (row: TData) => string | number;
    renderRowActions?: (row: Row<TData>) => ReactNode;
  }
): ColumnDef<TData>[] {
  const injectedColumns: ColumnDef<TData>[] = [];

  // Add drag handle column at the start
  if (options.enableDragDrop && options.getRowId) {
    injectedColumns.push(createDragHandleColumn(options.getRowId));
  }

  // Add selection column after drag handle
  if (options.enableSelection) {
    injectedColumns.push(createSelectionColumn());
  }

  // Add user-defined columns
  injectedColumns.push(...columns);

  // Add actions column at the end
  if (options.enableActions && options.renderRowActions) {
    injectedColumns.push(createActionsColumn(options.renderRowActions));
  }

  return injectedColumns;
}
