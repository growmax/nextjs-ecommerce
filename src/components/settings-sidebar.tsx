"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Link } from "@/i18n/navigation";
import { Building2, User, Settings } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const defaultItems = [
  {
    title: "Company",
    href: "/settings/company",
    icon: <Building2 />,
  },
  {
    title: "Profile",
    href: "/settings/profile",
    icon: <User />,
  },
];

export default function SettingsSidebar({
  title = "Settings",
  items = defaultItems,
}) {
  const pathname = usePathname();

  return (
    <div className="hidden lg:block w-64 min-h-full border-r bg-background">
      <Card className="h-full rounded-none border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings />
            {title}
          </CardTitle>
          <Separator />
        </CardHeader>
        <CardContent className="space-y-2">
          <nav className="flex flex-col gap-1">
            {items.map(item => {
              const isActive = pathname.includes(item.href);
              return (
                <Button
                  key={item.href}
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "justify-start w-full",
                    isActive && "bg-primary text-primary-foreground"
                  )}
                  asChild
                >
                  <Link href={item.href} className="flex items-center gap-2">
                    {item.icon}
                    <span className="flex-1">{item.title}</span>
                  </Link>
                </Button>
              );
            })}
          </nav>
        </CardContent>
      </Card>
    </div>
  );
}
