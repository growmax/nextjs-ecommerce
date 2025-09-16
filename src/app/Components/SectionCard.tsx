"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface SectionCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
}

export default function SectionCard({
  title,
  children,
  className,
  headerClassName,
  contentClassName,
}: SectionCardProps) {
  return (
    <Card className={className}>
      <CardHeader className={headerClassName}>
        <CardTitle>{title}</CardTitle>
        <Separator />
      </CardHeader>

      <CardContent className={contentClassName}>{children}</CardContent>
    </Card>
  );
}
