import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { flexRender, type Row } from "@tanstack/react-table";
import * as React from "react";

import { TableCell, TableRow } from "@/components/ui/table";

interface DraggableRowProps<TData> {
  row: Row<TData>;
  getRowId: (row: TData) => string | number;
}

function DraggableRowComponent<TData>({
  row,
  getRowId,
}: DraggableRowProps<TData>) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: getRowId(row.original),
  });

  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      {row.getVisibleCells().map(cell => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
}

// Memoize to prevent unnecessary re-renders when parent table updates
export const DraggableRow = React.memo(
  DraggableRowComponent
) as typeof DraggableRowComponent;
