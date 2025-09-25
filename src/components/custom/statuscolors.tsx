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
    default: {
      return "#c3c3c3";
    }
  }
};
