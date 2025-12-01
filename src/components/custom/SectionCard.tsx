"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface SectionCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  headerContainerClassName?: string;
  contentClassName?: string;
  headerActions?: React.ReactNode;
  showSeparator?: boolean;
}

export default function SectionCard({
  title,
  children,
  className,
  headerClassName,
  headerContainerClassName,
  contentClassName,
  headerActions,
  showSeparator = true,
}: SectionCardProps) {
  return (
    <Card className={className}>
      <CardHeader  className={`px-0 ${headerClassName}`}  >
        <div className={cn("flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 px-2", headerContainerClassName)}>
          <CardTitle className="text-base sm:text-lg ml-4">{title}</CardTitle>
          {headerActions && (
            <div className="flex items-center gap-2">{headerActions}</div>
          )}
        </div>
        {showSeparator && <Separator className="mt-2 -mx-6" />}
      </CardHeader>

      <CardContent className={contentClassName}>{children}</CardContent>
    </Card>
  );
}
