"use client";

import { useState, useCallback, useRef } from "react";
import type { DashboardToolbarRef } from "@/types/dashboard-toolbar";

interface UseDashboardToolbarOptions {
  /** Initial search query */
  initialSearch?: string;
  /** Initial view mode */
  initialViewMode?: "list" | "grid" | "board";
  /** Enable search functionality */
  enableSearch?: boolean;
  /** Enable view mode toggle */
  enableViewToggle?: boolean;
  /** Enable filters */
  enableFilters?: boolean;
  /** Debounce delay for search in milliseconds */
  searchDebounce?: number;
}

interface DashboardToolbarState {
  searchQuery: string;
  viewMode: "list" | "grid" | "board";
  showFilters: boolean;
  activeFilters: Record<string, unknown>;
  isLoading: boolean;
}

interface DashboardToolbarActions {
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;
  setViewMode: (mode: "list" | "grid" | "board") => void;
  toggleFilters: () => void;
  setFilters: (filters: Record<string, unknown>) => void;
  clearFilters: () => void;
  setLoading: (loading: boolean) => void;
  refresh: () => void;
}

/**
 * Custom hook for managing dashboard toolbar state
 *
 * Provides state management and actions for the DashboardToolbar component,
 * including search, filters, view modes, and loading states.
 */
export function useDashboardToolbar(options: UseDashboardToolbarOptions = {}) {
  const {
    initialSearch = "",
    initialViewMode = "list",
    enableSearch = true,
    enableViewToggle = true,
    enableFilters = true,
    searchDebounce = 300,
  } = options;

  const toolbarRef = useRef<DashboardToolbarRef>(null);

  // State
  const [state, setState] = useState<DashboardToolbarState>({
    searchQuery: initialSearch,
    viewMode: initialViewMode,
    showFilters: false,
    activeFilters: {},
    isLoading: false,
  });

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);

  const setSearchQuery = useCallback(
    (query: string) => {
      setState(prev => ({ ...prev, searchQuery: query }));

      // Debounce search
      if (searchDebounce > 0) {
        setTimeout(() => {
          setDebouncedSearch(query);
        }, searchDebounce);
      } else {
        setDebouncedSearch(query);
      }
    },
    [searchDebounce]
  );

  const clearSearch = useCallback(() => {
    setState(prev => ({ ...prev, searchQuery: "" }));
    setDebouncedSearch("");
  }, []);

  const setViewMode = useCallback((mode: "list" | "grid" | "board") => {
    setState(prev => ({ ...prev, viewMode: mode }));
  }, []);

  const toggleFilters = useCallback(() => {
    setState(prev => ({ ...prev, showFilters: !prev.showFilters }));
  }, []);

  const setFilters = useCallback((filters: Record<string, unknown>) => {
    setState(prev => ({ ...prev, activeFilters: filters }));
  }, []);

  const clearFilters = useCallback(() => {
    setState(prev => ({ ...prev, activeFilters: {}, showFilters: false }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, isLoading: loading }));
  }, []);

  const refresh = useCallback(() => {
    toolbarRef.current?.refresh();
  }, []);

  // Actions
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const actions: DashboardToolbarActions = {
    setSearchQuery,
    clearSearch,
    setViewMode,
    toggleFilters,
    setFilters,
    clearFilters,
    setLoading,
    refresh,
  };

  // Computed values
  const activeFiltersCount = Object.values(state.activeFilters).filter(
    value => value !== undefined && value !== "" && value !== null
  ).length;

  const hasActiveFilters = activeFiltersCount > 0;

  // Toolbar configuration helpers
  const getSearchConfig = useCallback(() => {
    if (!enableSearch) return { condition: false };

    return {
      condition: true,
      placeholder: "Search...",
      searchTextValue: state.searchQuery,
      handleSearch: actions.setSearchQuery,
      handleClearAll: actions.clearSearch,
    };
  }, [
    enableSearch,
    state.searchQuery,
    actions.setSearchQuery,
    actions.clearSearch,
  ]);

  const getFilterConfig = useCallback(() => {
    if (!enableFilters) return { condition: false };

    return {
      condition: true,
      handleClick: actions.toggleFilters,
      isActive: state.showFilters,
      count: activeFiltersCount,
    };
  }, [
    enableFilters,
    actions.toggleFilters,
    state.showFilters,
    activeFiltersCount,
  ]);

  const getToggleButtonConfig = useCallback(() => {
    if (!enableViewToggle) return { condition: false };

    return {
      condition: true,
      value: state.viewMode,
      handleClick: (value: string | null) => {
        if (value) {
          actions.setViewMode(value as "list" | "grid" | "board");
        }
      },
    };
  }, [enableViewToggle, state.viewMode, actions]);

  return {
    // State
    state,
    debouncedSearch,
    activeFiltersCount,
    hasActiveFilters,

    // Actions
    actions,

    // Ref
    toolbarRef,

    // Configuration helpers
    getSearchConfig,
    getFilterConfig,
    getToggleButtonConfig,

    // Common handlers
    handlers: {
      onSearch: actions.setSearchQuery,
      onClearSearch: actions.clearSearch,
      onViewModeChange: actions.setViewMode,
      onToggleFilters: actions.toggleFilters,
      onSetFilters: actions.setFilters,
      onClearFilters: actions.clearFilters,
      onRefresh: actions.refresh,
    },
  };
}

export type { DashboardToolbarState, DashboardToolbarActions };
