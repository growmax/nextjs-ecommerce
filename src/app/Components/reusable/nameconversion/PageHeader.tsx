"use client";

import { cn } from "@/lib/utils";

interface HeaderBarProps {
  title: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export default function HeaderBar({
  title,
  actions,
  className,
  style,
}: HeaderBarProps) {
  return (
    <header
      className={cn(
        "flex-shrink-0 bg-white shadow-md border-b z-10",
        className
      )}
      style={{
        paddingLeft: "16px",
        paddingRight: "16px",
        ...style,
      }}
    >
      {/* Toolbar container */}
      <div className="flex items-center justify-between relative w-full min-h-[48px] px-4 py-2">
        <div className="flex flex-1">
          <div className="flex items-center gap-2 truncate">
            <div className="flex items-center">
              <h4
                className="text-sm font-normal truncate text-foreground" // smaller font
                title={title}
                style={{
                  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
                  fontWeight: 400,
                  lineHeight: 1.2,
                  letterSpacing: "0.00735em",
                }}
              >
                {title}
              </h4>
            </div>

            {/* Empty divs for spacing (like MUI) */}
            <div className="flex-shrink-0"></div>
            <div className="flex-shrink-0"></div>
            <div className="flex-shrink-0"></div>
            <div className="flex-grow"></div>
          </div>
        </div>

        {/* Right: optional actions */}
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}
