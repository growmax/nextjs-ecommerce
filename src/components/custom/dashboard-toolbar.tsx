"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import type {
  DashboardToolbarProps,
  DashboardToolbarRef,
} from "@/types/dashboard-toolbar";
import {
  Columns3,
  Filter,
  Grid3X3,
  List,
  MoreVertical,
  RefreshCw,
  Settings,
  X,
} from "lucide-react";
import { forwardRef, useImperativeHandle, useRef } from "react";
import { LoadingButton } from "./loading-button";
import SearchBox from "./search";
const DashboardToolbar = forwardRef<DashboardToolbarRef, DashboardToolbarProps>(
  (
    {
      title,
      children,
      customSearch,
      filter = { condition: false },
      primary = { condition: false },
      secondary = { condition: false },
      showSearch = { condition: false },
      label = { condition: false },
      link = { condition: false },
      toggleButton = { condition: false },
      settings = { condition: false },
      moreOptions = { condition: false },
      refresh = { condition: false },
      close = { condition: false },
      subheader = { condition: false },
      filterChips = { condition: false },
      loading = false,
      className,
      noWrap = true,
      position = "sticky",
      zIndex = 10,
      width = "100%",
      showOnMobile = true,
      mobileProps,
      ...props
    },
    ref
  ) => {
    const isMobile = useIsMobile();
    const searchRef = useRef<HTMLInputElement>(null);
    const refreshHandlerRef = useRef<() => void>(() => {});

    // Store refresh handler
    refreshHandlerRef.current = refresh.handleRefresh || (() => {});

    useImperativeHandle(ref, () => ({
      refresh: () => {
        refreshHandlerRef.current();
      },
      focus: () => {
        searchRef.current?.focus();
      },
    }));

    // Don't render on mobile if explicitly disabled
    if (isMobile && !showOnMobile) {
      return null;
    }

    // Mobile action filtering
    const mobileActions = mobileProps?.actions || ["search", "filter", "more"];
    const shouldShowOnMobile = (action: string) =>
      !isMobile ||
      mobileActions.includes(action as "search" | "filter" | "more");

    const ToolbarContent = () => (
      <>
        {loading ? (
          <div className="flex justify-between gap-4 flex-1">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-8 w-20" />
          </div>
        ) : (
          <>
            {/* Left Section - Title and Info */}
            <div className="flex justify-between flex-1">
              {/* Title */}
              {title && (
                <div className={cn("min-w-0", noWrap && "max-w-[300px]")}>
                  <h1
                    className={cn(
                      "font-semibold text-foreground",
                      isMobile ? "text-lg" : "text-xl",
                      noWrap && "truncate"
                    )}
                    title={title}
                  >
                    {isMobile && mobileProps?.title ? mobileProps.title : title}
                  </h1>
                </div>
              )}

              {/* Label */}
              {label.condition && label.value && (
                <Badge
                  variant={label.variant || "default"}
                  className={cn(
                    label.color && `text-${label.color}`,
                    label.bgColor && `bg-${label.bgColor}`,
                    !isMobile && "hidden sm:inline-flex"
                  )}
                >
                  {label.value}
                </Badge>
              )}

              {/* Link */}
              {link.condition && link.value && !isMobile && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={link.handleLink}
                      className="text-primary h-auto p-0 font-normal"
                    >
                      {link.value}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Click to see your {link.text}</TooltipContent>
                </Tooltip>
              )}

              {/* Filter Button */}
              {filter.condition && shouldShowOnMobile("filter") && (
                <div className="relative">
                  <Button
                    variant="outline"
                    size={isMobile ? "sm" : "default"}
                    onClick={filter.handleClick}
                    className={cn(
                      "gap-2",
                      filter.isActive && "bg-primary/10 border-primary/50"
                    )}
                  >
                    <div className="relative">
                      <Filter className="h-4 w-4" />
                      {filter.count && filter.count > 0 && (
                        <Badge
                          variant="destructive"
                          className="absolute -top-2 -right-2 h-4 w-4 p-0 text-xs"
                        >
                          {filter.count > 9 ? "9+" : filter.count}
                        </Badge>
                      )}
                    </div>
                    {!isMobile && "Filters"}
                  </Button>
                </div>
              )}

              {/* Custom Search or Built-in Search */}
              {customSearch ||
              (showSearch.condition && shouldShowOnMobile("search")) ? (
                <div
                  className={cn("flex-1 max-w-md", isMobile && "max-w-none")}
                >
                  {customSearch || (
                    <SearchBox
                      ref={searchRef}
                      placeholder={showSearch.placeholder || "Search..."}
                      defaultValue={showSearch.searchTextValue || ""}
                      onSearch={showSearch.handleSearch || (() => {})}
                      onChange={showSearch.handleSearch || (() => {})}
                      size={isMobile ? "sm" : "md"}
                      variant="outlined"
                      className="w-full"
                    />
                  )}
                </div>
              ) : null}

              {/* Filter Chips */}
              {filterChips.condition && filterChips.value && !isMobile && (
                <div className="flex justify-center gap-2">
                  {filterChips.value}
                </div>
              )}
            </div>

            {/* Right Section - Actions */}
            <div className="flex justify-center gap-2">
              {/* Secondary Action */}
              {secondary.condition &&
                (secondary.loadingButton ? (
                  <LoadingButton
                    loading={secondary.isLoading || false}
                    onClick={secondary.handleClick}
                    disabled={secondary.disabled || false}
                    variant="outline"
                    size="sm"
                    className="gap-1 h-7"
                  >
                    {secondary.startIcon}
                    {!isMobile && secondary.value}
                  </LoadingButton>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={secondary.handleClick}
                    disabled={secondary.disabled}
                    className="gap-1 h-7"
                  >
                    {secondary.startIcon}
                    {!isMobile && secondary.value}
                  </Button>
                ))}

              {/* Primary Action */}
              {primary.condition &&
                (primary.loadingButton ? (
                  <LoadingButton
                    loading={primary.isLoading || false}
                    onClick={primary.handleClick}
                    disabled={primary.disabled || false}
                    size="sm"
                    className="gap-1 h-7"
                  >
                    {primary.startIcon}
                    {!isMobile && primary.value}
                  </LoadingButton>
                ) : (
                  <Button
                    size="sm"
                    onClick={primary.handleClick}
                    disabled={primary.disabled}
                    className="gap-1 h-7"
                  >
                    {primary.startIcon}
                    {!isMobile && primary.value}
                  </Button>
                ))}

              {/* Toggle View Buttons */}
              {toggleButton.condition && !isMobile && (
                <div className="flex rounded-md border">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={
                          toggleButton.value === "list" ? "default" : "ghost"
                        }
                        size="sm"
                        onClick={() => toggleButton.handleClick?.("list")}
                        className="rounded-r-none border-r"
                      >
                        <List className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>List view</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={
                          toggleButton.value === "grid" ? "default" : "ghost"
                        }
                        size="sm"
                        onClick={() => toggleButton.handleClick?.("grid")}
                        className="rounded-none border-r"
                      >
                        <Grid3X3 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Grid view</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={
                          toggleButton.value === "board" ? "default" : "ghost"
                        }
                        size="sm"
                        onClick={() => toggleButton.handleClick?.("board")}
                        className="rounded-l-none"
                      >
                        <Columns3 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Board view</TooltipContent>
                  </Tooltip>
                </div>
              )}

              {/* Settings */}
              {settings.condition && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={settings.handleClick}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Settings</TooltipContent>
                </Tooltip>
              )}

              {/* Refresh */}
              {refresh.condition && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={refresh.handleRefresh}
                      disabled={refresh.loading}
                    >
                      <RefreshCw
                        className={cn(
                          "h-4 w-4",
                          refresh.loading && "animate-spin"
                        )}
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Refresh</TooltipContent>
                </Tooltip>
              )}

              {/* More Options */}
              {moreOptions.condition && shouldShowOnMobile("more") && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={moreOptions.moreOptionsClick}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>More options</TooltipContent>
                </Tooltip>
              )}

              {/* Close */}
              {close.condition && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={close.handleClick}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Close</TooltipContent>
                </Tooltip>
              )}

              {/* Children (typically dropdowns or menus) */}
              {children}
            </div>
          </>
        )}

        {/* Subheader */}
        {subheader.condition && subheader.value && (
          <div className="col-span-full mt-4 pt-4 border-t">
            {subheader.value}
          </div>
        )}
      </>
    );

    if (position === "static" || position === "relative") {
      return (
        <div
          className={cn(
            "bg-background/95 backdrop-blur-sm border-b",
            "transition-all duration-200",
            className
          )}
          style={{
            width: typeof width === "string" ? width : undefined,
            zIndex,
          }}
          {...props}
        >
          <div
            className={cn(
              "py-1 px-4",
              "flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-2 sm:items-center"
            )}
          >
            <ToolbarContent />
          </div>
        </div>
      );
    }

    return (
      <>
        <div
          className={cn(
            position === "fixed" ? "fixed" : "sticky",
            "top-0 left-0 right-0",
            "bg-background/95 backdrop-blur-sm border-b",
            "transition-all duration-200",
            className
          )}
          style={{
            width: typeof width === "string" ? width : undefined,
            zIndex,
          }}
          {...props}
        >
          <div
            className={cn(
              "py-1 px-4",
              "flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-2 sm:items-center"
            )}
          >
            <ToolbarContent />
          </div>
        </div>

        {/* Spacer for fixed positioning */}
        {position === "fixed" && <div className="h-10" aria-hidden="true" />}
      </>
    );
  }
);

DashboardToolbar.displayName = "DashboardToolbar";

export { DashboardToolbar };
export type { DashboardToolbarProps, DashboardToolbarRef };
