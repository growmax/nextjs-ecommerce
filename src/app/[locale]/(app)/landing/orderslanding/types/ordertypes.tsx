export interface OrdersLandingTableProps {
  onLoadingChange?: (loading: boolean) => void;
  refreshTrigger?: number;
  setExportCallback?: (callback: (() => void) | null) => void;
  onTotalCountChange?: (count: number) => void;
}
