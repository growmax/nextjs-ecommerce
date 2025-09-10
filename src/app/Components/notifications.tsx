import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotificationButton() {
  return (
    <Button variant="ghost" size="icon">
      <Bell className="h-5 w-5" />
    </Button>
  );
}
