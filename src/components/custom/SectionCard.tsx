"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface SectionCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  headerActions?: React.ReactNode;
  showSeparator?: boolean;
}

export default function SectionCard({
  title,
  children,
  className,
  headerClassName,
  contentClassName,
  headerActions,
  showSeparator = true,
}: SectionCardProps) {
  return (
    <Card className={className}>
      <CardHeader  className={`px-0 ${headerClassName}`}  >
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 px-2">
          <CardTitle className="text-base sm:text-lg ml-4">{title}</CardTitle>
          {headerActions && (
            <div className="flex items-center gap-2">{headerActions}</div>
          )}
        </div>
        {showSeparator && <Separator className="mt-2 w-full" />}
      </CardHeader>

      <CardContent className={contentClassName}>{children}</CardContent>
    </Card>
  );
}
