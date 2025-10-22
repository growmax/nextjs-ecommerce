import { ReactNode } from "react";

export interface FilterAction {
  condition: boolean;
  handleClick?: () => void;
  isActive?: boolean;
  count?: number;
}

export interface ToolbarAction {
  condition: boolean;
  value?: string;
  handleClick?: () => void;
  isLoading?: boolean;
  loadingButton?: boolean;
  startIcon?: ReactNode;
  id?: string;
  disabled?: boolean;
}

export interface SearchConfig {
  condition: boolean;
  placeholder?: string;
  searchTextValue?: string;
  handleSearch?: (value: string) => void;
  handleClearAll?: () => void;
}

export interface LabelConfig {
  condition: boolean;
  value?: string;
  color?: string;
  bgColor?: string;
  variant?: "default" | "secondary" | "outline" | "destructive";
  gutterBottom?: boolean;
}

export interface LinkConfig {
  condition: boolean;
  value?: string;
  text?: string;
  handleLink?: () => void;
}

export interface ToggleButtonConfig {
  condition: boolean;
  value?: "list" | "grid" | "board";
  handleClick?: (value: string | null) => void;
}

export interface SettingsConfig {
  condition: boolean;
  handleClick?: () => void;
}

export interface MoreOptionsConfig {
  condition: boolean;
  moreOptionsClick?: () => void;
}

export interface RefreshConfig {
  condition: boolean;
  handleRefresh?: () => void;
  loading?: boolean;
}

export interface CloseConfig {
  condition: boolean;
  handleClick?: () => void;
}

export interface SubheaderConfig {
  condition: boolean;
  value?: ReactNode;
}

export interface FilterChipsConfig {
  condition: boolean;
  value?: ReactNode;
}

export interface SectionToolbarProps {
  /** Main title displayed in the toolbar */
  title?: string;

  /** Child components (typically for more options menu) */
  children?: ReactNode;

  /** Custom search component */
  customSearch?: ReactNode;

  /** Filter configuration */
  filter?: FilterAction;

  /** Primary action button configuration */
  primary?: ToolbarAction;

  /** Secondary action button configuration */
  secondary?: ToolbarAction;

  /** Search functionality configuration */
  showSearch?: SearchConfig;

  /** Label display configuration */
  label?: LabelConfig;

  /** Link display configuration */
  link?: LinkConfig;

  /** View toggle buttons configuration */
  toggleButton?: ToggleButtonConfig;

  /** Settings button configuration */
  settings?: SettingsConfig;

  /** More options menu configuration */
  moreOptions?: MoreOptionsConfig;

  /** Refresh button configuration */
  refresh?: RefreshConfig;

  /** Close button configuration */
  close?: CloseConfig;

  /** Subheader content configuration */
  subheader?: SubheaderConfig;

  /** Filter chips display configuration */
  filterChips?: FilterChipsConfig;

  /** Loading state for the entire toolbar */
  loading?: boolean;

  /** Custom CSS classes */
  className?: string;

  /** Whether title should wrap or not */
  noWrap?: boolean;

  /** Custom positioning */
  position?: "fixed" | "sticky" | "relative" | "static";

  /** Custom z-index */
  zIndex?: number;

  /** Toolbar width */
  width?: string | Record<string, string>;

  /** Whether to show on mobile */
  showOnMobile?: boolean;

  /** Mobile-specific configuration */
  mobileProps?: {
    title?: string;
    showTitle?: boolean;
    actions?: ("search" | "filter" | "more")[];
  };
}

export interface FilterTab {
  filter_index: number;
  filter_name: string;
  filter_data?: Record<string, unknown>;
}

export interface SectionToolbarRef {
  refresh: () => void;
  focus: () => void;
}
