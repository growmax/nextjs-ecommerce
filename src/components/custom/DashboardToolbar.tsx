"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useMediaQuery } from "@/hooks/use-media-query/use-media-query";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import {
  Filter,
  LayoutGrid,
  List,
  Loader2,
  MoreVertical,
  RefreshCw,
  Search,
  Settings,
  X,
} from "lucide-react";
import React, { ReactNode } from "react";

interface FilterConfig {
  condition: boolean;
  handleClick?: () => void;
}

interface ButtonConfig {
  condition: boolean;
  value?: string;
  handleClick?: () => void;
  isLoading?: boolean;
  loadingButton?: boolean;
  startIcon?: ReactNode;
  id?: string;
}

interface RefreshConfig {
  condition: boolean;
  handleRefresh?: () => void;
  loading?: boolean;
}

interface CloseConfig {
  condition: boolean;
  handleClick?: () => void;
}

interface MoreOptionConfig {
  condition: boolean;
  moreOptionsClick?: () => void;
}

interface LabelConfig {
  condition: boolean;
  value?: string;
  color?: string;
  bgColor?: string;
  variant?: "default" | "secondary" | "destructive" | "outline";
  gutterBottom?: boolean;
}

interface LinkConfig {
  condition: boolean;
  value?: string;
  text?: string;
  handleLink?: () => void;
}

interface SubheaderConfig {
  condition: boolean;
  value?: ReactNode;
}

interface SearchConfig {
  condition: boolean;
  placeholder?: string;
  searchTextValue?: string;
  handleSearch?: (value: string) => void;
  handleClearAll?: () => void;
}

interface FilterChipsConfig {
  condition: boolean;
  value?: ReactNode;
}

interface SettingsConfig {
  condition: boolean;
  handleClick?: () => void;
}

interface ToggleButtonConfig {
  condition: boolean;
  checked?: string;
  label?: string;
  handleClick?: (value: string) => void;
}

interface DashboardToolbarProps {
  children?: ReactNode;
  title?: string;
  top?: string;
  mobileTop?: string;
  noWrap?: boolean;
  filter?: FilterConfig;
  primary?: ButtonConfig;
  secondary?: ButtonConfig;
  refresh?: RefreshConfig;
  close?: CloseConfig;
  moreOption?: MoreOptionConfig;
  loading?: boolean;
  label?: LabelConfig;
  link?: LinkConfig;
  subheader?: SubheaderConfig;
  showSearch?: SearchConfig;
  filterChips?: FilterChipsConfig;
  width?: string | Record<string, string>;
  settings?: SettingsConfig;
  toggleButton?: ToggleButtonConfig;
  customSearch?: ReactNode;
  zIndex?: string;
  toolbarWidth?: string;
  className?: string;
  sticky?: boolean;
}

export function DashboardToolbar({
  children,
  title,
  noWrap = true,
  filter = { condition: false },
  primary = { condition: false },
  secondary = { condition: false },
  refresh = { condition: false },
  close = { condition: false },
  moreOption = { condition: false },
  loading = false,
  label = { condition: false, gutterBottom: true },
  link = { condition: false },
  subheader = { condition: false },
  showSearch = { condition: false },
  filterChips = { condition: false },
  settings = { condition: false },
  toggleButton = { condition: false, checked: "", label: "" },
  customSearch,
  toolbarWidth = "100%",
}: DashboardToolbarProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const t = useTranslations("toolbar");
  const tButtons = useTranslations("buttons");
  const [searchValue, setSearchValue] = React.useState(
    showSearch.searchTextValue || ""
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    if (showSearch.handleSearch) {
      showSearch.handleSearch(value);
    }
  };

  const handleSearchClear = () => {
    setSearchValue("");
    if (showSearch.handleClearAll) {
      showSearch.handleClearAll();
    }
  };

  return (
    <header className="flex h-10 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
      <div
        className="flex h-10 items-center px-4 gap-1"
        style={{ width: toolbarWidth }}
      >
        {!loading ? (
          <div className="flex-1 flex items-center gap-2">
            <div className="flex items-center gap-2">
              {title && (
                <h1
                  className={cn(
                    "text-lg font-semibold",
                    isMobile && "text-xs",
                    noWrap && "truncate max-w-[235px]"
                  )}
                  title={title}
                >
                  {title}
                </h1>
              )}

              {label.condition && label.value && (
                <Badge
                  variant={label.variant || "default"}
                  className={cn("text-xs h-5", label.gutterBottom && "mb-1")}
                >
                  {label.value}
                </Badge>
              )}

              {link.condition && link.value && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="link"
                        className="text-blue-600 hover:text-blue-700 p-0 h-auto text-xs"
                        onClick={link.handleLink}
                      >
                        {link.value}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t("clickToSee", { text: link.text ?? "" })}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              {filter.condition && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={filter.handleClick}
                  className="gap-1 h-7 text-xs px-2"
                >
                  <div className="relative">
                    <Filter className="h-3 w-3" />
                    {filterChips.condition && filterChips.value && (
                      <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full" />
                    )}
                  </div>
                  {t("filters")}
                </Button>
              )}

              {customSearch && customSearch}

              {showSearch.condition && (
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-2 top-2 h-3 w-3 text-muted-foreground" />
                  <Input
                    placeholder={showSearch.placeholder || t("search")}
                    value={searchValue}
                    onChange={handleSearchChange}
                    className="pl-7 pr-7 h-7 text-xs"
                  />
                  {searchValue && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSearchClear}
                      className="absolute right-0 top-0 h-full px-1.5 hover:bg-transparent"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              )}

              {filterChips.condition && filterChips.value && (
                <div className="flex items-center gap-2">
                  {filterChips.value}
                </div>
              )}
            </div>

            {subheader.condition && subheader.value && (
              <div className="w-full">{subheader.value}</div>
            )}
          </div>
        ) : (
          <div className="flex-1">
            <Skeleton className="h-6 w-[200px]" />
          </div>
        )}

        {!loading && (
          <div className="flex items-center gap-2 -mt-4">
            {secondary.condition && secondary.value && (
              <Button
                variant="ghost"
                size="sm"
                onClick={secondary.handleClick}
                disabled={secondary.isLoading}
                id={secondary.id}
                className="gap-1 h-6 text-xs px-3 py-0"
              >
                {secondary.isLoading && (
                  <Loader2 className="h-3 w-3 animate-spin" />
                )}
                {secondary.startIcon}
                {secondary.value}
              </Button>
            )}

            {primary.condition && primary.value && (
              <Button
                variant="default"
                size="sm"
                onClick={primary.handleClick}
                disabled={primary.isLoading}
                id={primary.id}
                className="gap-1 h-6 text-xs px-3 py-0"
              >
                {primary.isLoading && (
                  <Loader2 className="h-3 w-3 animate-spin" />
                )}
                {primary.startIcon}
                {primary.value}
              </Button>
            )}

            {toggleButton.condition && (
              <ToggleGroup
                type="single"
                value={
                  toggleButton.label || toggleButton.checked || t("listView")
                }
                onValueChange={toggleButton.handleClick || (() => {})}
                size="sm"
              >
                <ToggleGroupItem
                  value={t("listView")}
                  aria-label={t("listView")}
                >
                  <List className="h-3 w-3" />
                </ToggleGroupItem>
                <ToggleGroupItem
                  value={t("boardView")}
                  aria-label={t("boardView")}
                >
                  <LayoutGrid className="h-3 w-3" />
                </ToggleGroupItem>
              </ToggleGroup>
            )}

            {settings.condition && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={settings.handleClick}
                      aria-label="Settings"
                      className="h-7 w-7"
                    >
                      <Settings className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t("settings")}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {moreOption.condition && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={moreOption.moreOptionsClick}
                      aria-label="More options"
                      className="h-7 w-7"
                    >
                      <MoreVertical className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t("moreOptions")}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {moreOption.condition && children}

            {refresh.condition && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={refresh.handleRefresh}
                      disabled={refresh.loading}
                      aria-label="Refresh"
                      className="h-7 w-7"
                    >
                      <RefreshCw
                        className={cn(
                          "h-3 w-3",
                          refresh.loading && "animate-spin"
                        )}
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t("clickToRefresh")}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {close.condition && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={close.handleClick}
                      aria-label="Close"
                      className="h-7 w-7"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{tButtons("close")}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

export default DashboardToolbar;
