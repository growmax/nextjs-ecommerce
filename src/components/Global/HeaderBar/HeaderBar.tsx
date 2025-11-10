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
    <>
      {/* Fixed Header */}
      <header
        className={cn(
          "flex top-[32px] left-64 right-0 flex-shrink-0 bg-background border-b border-border shadow-sm z-50",
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
                  className="text-sm font-bold truncate text-black"
                  title={title}
                  style={{
                    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
                    fontWeight: 700,
                    lineHeight: 2.0,
                    letterSpacing: "0.00735em",
                  }}
                >
                  {title}
                </h4>
              </div>
            </div>
          </div>

          {/* Right: optional actions */}
          {actions && (
            <div className="flex items-center gap-2 text-black">{actions}</div>
          )}
        </div>
      </header>
      {/* Automatic Spacer - pushes content below the fixed header
          Keep the spacer in sync with header height: 48px mobile, 64px desktop.
          Adjust if your header's min-height changes. */}
      {/* <div className="h-[24px] md:h-[32px]" /> */}
    </>
  );
}
