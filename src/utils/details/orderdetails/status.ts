/**
 * Get status badge styling based on order status
 */
export function getStatusStyle(status?: string): string {
  const statusUpper = status?.toUpperCase();

  switch (statusUpper) {
    case "ORDER ACKNOWLEDGED":
    case "ACKNOWLEDGED":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "IN PROGRESS":
    case "PROCESSING":
      return "bg-orange-100 text-orange-700 border-orange-200";
    case "COMPLETED":
    case "DELIVERED":
      return "bg-green-100 text-green-700 border-green-200";
    case "CANCELLED":
      return "bg-red-100 text-red-700 border-red-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
}

/**
 * Check if order is cancelled
 */
export function isOrderCancelled(status?: string): boolean {
  return status?.toUpperCase() === "ORDER CANCELLED";
}

/**
 * Check if edit is in progress
 */
export function isEditInProgress(status?: string): boolean {
  return status?.toUpperCase() === "EDIT IN PROGRESS";
}
