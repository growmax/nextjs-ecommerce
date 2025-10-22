import { TableCell, TableRow } from "@/components/ui/table";

interface SkeletonRowProps {
  columnCount: number;
}

export function SkeletonRow({ columnCount }: SkeletonRowProps) {
  // Generate varying widths for more realistic skeleton
  const getSkeletonWidth = (index: number) => {
    const widths = [
      "w-24",
      "w-32",
      "w-28",
      "w-36",
      "w-20",
      "w-24",
      "w-28",
      "w-32",
    ];
    return widths[index % widths.length];
  };

  return (
    <TableRow className="animate-pulse">
      {Array.from({ length: columnCount }).map((_, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <TableCell key={`skeleton-cell-${index}`} className="py-4">
          <div
            className={`h-4 bg-gray-200 rounded ${getSkeletonWidth(index)}`}
          />
        </TableCell>
      ))}
    </TableRow>
  );
}
