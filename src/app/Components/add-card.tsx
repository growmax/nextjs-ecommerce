import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AddCardButton() {
  return (
    <Button variant="ghost" size="icon">
      <Plus className="h-5 w-5" />
    </Button>
  );
}
