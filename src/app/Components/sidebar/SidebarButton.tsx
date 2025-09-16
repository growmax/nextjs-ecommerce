"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

interface SidebarButtonProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  variant?: "default" | "ghost" | "outline";
}

export default function SidebarButton({
  href,
  icon,
  label,
  onClick,
  variant = "ghost",
}: SidebarButtonProps) {
  const linkProps = onClick
    ? { href, onClick, className: "flex items-center gap-2" }
    : { href, className: "flex items-center gap-2" };

  return (
    <Button variant={variant} className="w-full justify-start" asChild>
      <Link {...linkProps}>
        {icon}
        <span>{label}</span>
      </Link>
    </Button>
  );
}
