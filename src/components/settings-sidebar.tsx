"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import { Building2, User, Settings } from "lucide-react";

const defaultItems = [
  {
    title: "Company",
    href: "/settings/company",
    icon: <Building2 />,
    badge: "Admin",
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
  return (
    <div className="w-64 h-screen border-r bg-background">
      <Card className="h-full rounded-none border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings />
            {title}
          </CardTitle>
          <Separator />
        </CardHeader>
        <CardContent className="space-y-2">
          <nav className="flex flex-col gap-1">
            {items.map(item => (
              <Button
                key={item.href}
                variant="ghost"
                className="justify-start w-full"
                asChild
              >
                <Link href={item.href} className="flex items-center gap-2">
                  {item.icon}
                  <span className="flex-1">{item.title}</span>
                  {item.badge && (
                    <Badge variant="secondary">{item.badge}</Badge>
                  )}
                </Link>
              </Button>
            ))}
          </nav>
        </CardContent>
      </Card>
    </div>
  );
}
