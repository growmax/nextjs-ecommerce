"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Pencil, Check, X } from "lucide-react";
import { containsXSS } from "@/utils/sanitization/sanitization.utils";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SummaryNameCardProps {
  name: string;
  onNameChange: (newName: string) => void;
  title?: string;
  loading?: boolean;
  className?: string;
  maxLength?: number;
}

/**
 * Component for editing quote/order name
 * Migrated from buyer-fe/src/components/Summary/Components/NameCard/NameCard.js
 * 
 * @param name - Current name value
 * @param onNameChange - Callback when name changes
 * @param title - Title label (e.g., "Quote Name", "Order Name")
 * @param loading - Loading state
 * @param className - Additional CSS classes
 * @param maxLength - Maximum character length (default: 250)
 */
export default function SummaryNameCard({
  name,
  onNameChange,
  title = "Name",
  loading = false,
  className,
  maxLength = 250,
}: SummaryNameCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(name);
  const [error, setError] = useState("");

  useEffect(() => {
    setTempName(name);
  }, [name]);

  const handleTempNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tempVal = e.target.value;
    
    if (tempVal.length > maxLength) {
      setError("Invalid content");
      setTempName(name); // Reset to original safe value
      toast.error("Invalid content detected");
      return;
    }
    
    if (containsXSS(tempVal)) {
      setError("Invalid content");
      setTempName(name); // Reset to original safe value
      toast.error("Invalid content detected");
      return;
    }
    
    setError("");
    setTempName(tempVal);
  };

  const handleSave = () => {
    if (error) {
      return;
    }
    
    if (tempName.trim() !== name.trim()) {
      onNameChange(tempName.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempName(name);
    setError("");
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (loading) {
    return (
      <Card className={cn("animate-pulse", className)}>
        <CardContent className="p-4">
          <div className="h-8 bg-muted rounded w-3/4" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("shadow-sm", className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          {!isEditing ? (
            <div
              className="flex-1 flex items-center justify-between cursor-pointer group"
              onClick={() => setIsEditing(true)}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground mb-1">{title}</p>
                <h2 className="text-xl font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                  {name || `Enter ${title.toLowerCase()}`}
                </h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="ml-2 flex-shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex-1 flex flex-col gap-2">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">
                  {title}
                </label>
                <Input
                  autoFocus
                  value={tempName}
                  onChange={handleTempNameChange}
                  onKeyDown={handleKeyDown}
                  onBlur={handleSave}
                  maxLength={300} // Allow slightly more for input, but validate at maxLength
                  className={cn(error && "border-destructive")}
                  aria-invalid={!!error}
                />
                {error ? (
                  <p className="text-xs text-destructive mt-1">{error}</p>
                ) : (
                  <p className="text-xs text-muted-foreground mt-1">
                    {tempName.length}/{maxLength} characters
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={!!error}
                  className="flex-1"
                >
                  <Check className="h-4 w-4 mr-1" />
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancel}
                  className="flex-1"
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

