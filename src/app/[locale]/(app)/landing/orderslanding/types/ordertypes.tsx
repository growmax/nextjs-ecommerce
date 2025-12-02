export interface OrdersLandingTableProps {
  refreshTrigger?: number;
  setExportCallback?: (callback: (() => void) | null) => void;
  onTotalCountChange?: (count: number) => void;
}
