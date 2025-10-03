export const statusColor = (status: string): string => {
  switch (status) {
    case "ORDER SENT": {
      return "#C0941A";
    }
    case "ORDER RECEIVED": {
      return "#C0941A";
    }
    case "ORDER ACKNOWLEDGED": {
      return "#F57C00";
    }
    case "INVOICED PARTIALLY": {
      return "#316686";
    }
    case "PARTIALLY SHIPPED": {
      return "#F57C00";
    }
    case "REQUESTED EDIT": {
      return "#F57C00";
    }
    case "EDIT IN PROGRESS": {
      return "#36833C";
    }
    case "EDIT ENABLED": {
      return "#4caf50";
    }
    case "EDIT DISABLED": {
      return "#D32F2F";
    }
    case "ORDER ACCEPTED": {
      return "#5FA100";
    }
    case "ORDER BOOKED": {
      return "#388E3C";
    }
    case "INVOICED": {
      return "#316686";
    }
    case "SHIPPED": {
      return "#7554A5";
    }
    case "ORDER CANCELLED": {
      return "#D32F2F";
    }
    // Quote statuses
    case "OPEN": {
      return "#2196F3"; // Blue
    }
    case "IN PROGRESS": {
      return "#FF9800"; // Orange
    }
    case "QUOTE RECEIVED": {
      return "#4CAF50"; // Green
    }
    case "CANCELLED": {
      return "#757575"; // Gray
    }
    case "DRAFT": {
      return "#9E9E9E"; // Light Gray
    }
    case "PENDING": {
      return "#FFA000"; // Amber
    }
    case "APPROVED": {
      return "#388E3C"; // Dark Green
    }
    case "REJECTED": {
      return "#D32F2F"; // Red
    }
    case "EXPIRED": {
      return "#795548"; // Brown
    }
    default: {
      return "#c3c3c3";
    }
  }
};
