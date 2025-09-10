import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={cn("border-t bg-background")}>
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Left section */}
          <div className="text-sm text-muted-foreground">
            © {currentYear} Your Company. All rights reserved.
          </div>

          {/* Middle section - Links using Button component */}
          <div className="flex items-center gap-2">
            <Button variant="link" size="sm" asChild>
              <Link href="/about">About</Link>
            </Button>
            <Separator orientation="vertical" className="h-4" />
            <Button variant="link" size="sm" asChild>
              <Link href="/privacy">Privacy</Link>
            </Button>
            <Separator orientation="vertical" className="h-4" />
            <Button variant="link" size="sm" asChild>
              <Link href="/terms">Terms</Link>
            </Button>
            <Separator orientation="vertical" className="h-4" />
            <Button variant="link" size="sm" asChild>
              <Link href="/contact">Contact</Link>
            </Button>
            <Separator orientation="vertical" className="h-4" />
            <Button variant="link" size="sm" asChild>
              <Link href="/check_out">checkout</Link>
            </Button>
            <Separator orientation="vertical" className="h-4" />
            <Button variant="link" size="sm" asChild>
              <Link href="/card_page">card_page</Link>
            </Button>
            <Separator orientation="vertical" className="h-4" />
            <Button variant="link" size="sm" asChild>
              <Link href="/orders">orders</Link>
            </Button>
          </div>

          {/* Right section */}
          <div className="text-sm text-muted-foreground">Made with ❤️</div>
        </div>
      </div>
    </footer>
  );
}
