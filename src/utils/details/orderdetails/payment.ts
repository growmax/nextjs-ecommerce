import { differenceInDays, isAfter } from "date-fns";
import { zoneDateTimeCalculator } from "@/utils/date-format";
import type { PaymentDueDataItem } from "@/lib/api";
import type { UserPreferences } from "@/types/details/orderdetails/version.types";

/**
 * Get last date to pay from payment due data
 */
export function getLastDateToPay(
  paymentDueData: PaymentDueDataItem[],
  preferences: UserPreferences
): string {
  if (paymentDueData.length === 0) {
    return "- No due";
  }

  const firstItem = paymentDueData[0];
  if (!firstItem) {
    return "- No due";
  }

  // Get the appropriate breakup array
  const breakup = firstItem.invoiceIdentifier
    ? firstItem.invoiceDueBreakup
    : firstItem.orderDueBreakup;

  if (!breakup || breakup.length === 0) {
    return "- No due";
  }

  const firstBreakup = breakup[0];
  const dueDate = firstBreakup?.dueDate;

  if (!dueDate) {
    return "-";
  }

  // Check if the date is overdue
  const dueDateObj = new Date(dueDate);
  const isDue = isAfter(new Date(), dueDateObj);

  if (isDue) {
    const daysOverdue = differenceInDays(new Date(), dueDateObj);
    return `Overdue by ${daysOverdue} ${daysOverdue > 1 ? "days" : "day"}`;
  }

  // Format the date using user preferences
  const formattedDate = zoneDateTimeCalculator(
    dueDate,
    preferences.timeZone,
    preferences.dateFormat,
    preferences.timeFormat,
    true
  );

  return formattedDate || "-";
}
