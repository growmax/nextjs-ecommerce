"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton"; // 🔥 Missing import added
import { cn } from "@/lib/utils";
import { containsXSS } from "@/utils/sanitization/sanitization.utils";
import { Check, Pencil, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface SummaryNameCardProps {
  name: string;
  onNameChange: (newName: string) => void;
  title?: string;
  loading?: boolean;
  className?: string;
  maxLength?: number;
}

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

    if (tempVal.length > maxLength || containsXSS(tempVal)) {
      setError("Invalid content");
      setTempName(name);
      toast.error("Invalid content detected");
      return;
    }

    setError("");
    setTempName(tempVal);
  };

  const handleSave = () => {
    if (error) return;

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
    if (e.key === "Enter") handleSave();
    else if (e.key === "Escape") handleCancel();
  };

  // 🔥 Only one loading UI — no JSX syntax error
  if (loading) {
    return (
      <Card className={cn("shadow-sm", className)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-7 w-3/4" />
            </div>
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // 🔥 Clean return — fixed broken JSX
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
                  maxLength={300}
                  className={cn(error && "border-destructive")}
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

