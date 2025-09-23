"use client";

import { useState, useCallback, useMemo } from "react";

interface UseBulkSelectionOptions<T> {
  /** Array of all items */
  items: T[];
  /** Function to get unique ID from item */
  getItemId: (item: T) => string;
  /** Maximum number of items that can be selected */
  maxSelection?: number;
  /** Initial selected item IDs */
  initialSelection?: string[];
}

interface BulkSelectionState {
  selectedIds: Set<string>;
  isAllSelected: boolean;
  isPartiallySelected: boolean;
  selectedCount: number;
}

interface BulkSelectionActions<T> {
  selectItem: (itemId: string) => void;
  unselectItem: (itemId: string) => void;
  toggleItem: (itemId: string) => void;
  selectAll: () => void;
  unselectAll: () => void;
  toggleAll: () => void;
  selectItems: (itemIds: string[]) => void;
  getSelectedItems: () => T[];
  isItemSelected: (itemId: string) => boolean;
  canSelectMore: () => boolean;
}

/**
 * Custom hook for managing bulk selection state
 *
 * Provides comprehensive selection management for tables, lists, and other
 * components that need to handle multiple item selection.
 */
export function useBulkSelection<T>({
  items,
  getItemId,
  maxSelection,
  initialSelection = [],
}: UseBulkSelectionOptions<T>) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(initialSelection)
  );

  // Memoized state calculations
  const state: BulkSelectionState = useMemo(() => {
    const allItemIds = items.map(getItemId);
    const selectedCount = selectedIds.size;
    const isAllSelected =
      allItemIds.length > 0 && allItemIds.every(id => selectedIds.has(id));
    const isPartiallySelected = selectedCount > 0 && !isAllSelected;

    return {
      selectedIds,
      isAllSelected,
      isPartiallySelected,
      selectedCount,
    };
  }, [selectedIds, items, getItemId]);

  // Actions
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const actions: BulkSelectionActions<T> = {
    selectItem: useCallback(
      (itemId: string) => {
        setSelectedIds(prev => {
          if (maxSelection && prev.size >= maxSelection && !prev.has(itemId)) {
            return prev; // Don't add if at max capacity
          }
          const newSet = new Set(prev);
          newSet.add(itemId);
          return newSet;
        });
      },
      [maxSelection]
    ),

    unselectItem: useCallback((itemId: string) => {
      setSelectedIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }, []),

    toggleItem: useCallback(
      (itemId: string) => {
        setSelectedIds(prev => {
          const newSet = new Set(prev);
          if (newSet.has(itemId)) {
            newSet.delete(itemId);
          } else if (!maxSelection || newSet.size < maxSelection) {
            newSet.add(itemId);
          }
          return newSet;
        });
      },
      [maxSelection]
    ),

    selectAll: useCallback(() => {
      const allItemIds = items.map(getItemId);
      const idsToSelect = maxSelection
        ? allItemIds.slice(0, maxSelection)
        : allItemIds;
      setSelectedIds(new Set(idsToSelect));
    }, [items, getItemId, maxSelection]),

    unselectAll: useCallback(() => {
      setSelectedIds(new Set());
    }, []),

    toggleAll: useCallback(() => {
      if (state.isAllSelected) {
        setSelectedIds(new Set());
      } else {
        const allItemIds = items.map(getItemId);
        const idsToSelect = maxSelection
          ? allItemIds.slice(0, maxSelection)
          : allItemIds;
        setSelectedIds(new Set(idsToSelect));
      }
    }, [state.isAllSelected, items, getItemId, maxSelection]),

    selectItems: useCallback(
      (itemIds: string[]) => {
        const idsToSelect = maxSelection
          ? itemIds.slice(0, maxSelection)
          : itemIds;
        setSelectedIds(new Set(idsToSelect));
      },
      [maxSelection]
    ),

    getSelectedItems: useCallback(() => {
      return items.filter(item => selectedIds.has(getItemId(item)));
    }, [items, selectedIds, getItemId]),

    isItemSelected: useCallback(
      (itemId: string) => {
        return selectedIds.has(itemId);
      },
      [selectedIds]
    ),

    canSelectMore: useCallback(() => {
      return !maxSelection || selectedIds.size < maxSelection;
    }, [maxSelection, selectedIds.size]),
  };

  // Convenience handlers for React components
  const handlers = {
    onItemSelect: useCallback(
      (itemId: string, checked: boolean) => {
        if (checked) {
          actions.selectItem(itemId);
        } else {
          actions.unselectItem(itemId);
        }
      },
      [actions]
    ),

    onSelectAll: useCallback(
      (checked: boolean) => {
        if (checked) {
          actions.selectAll();
        } else {
          actions.unselectAll();
        }
      },
      [actions]
    ),

    onToggleItem: actions.toggleItem,
    onToggleAll: actions.toggleAll,
    onUnselectAll: actions.unselectAll,
  };

  // Selection statistics
  const stats = {
    selectedCount: state.selectedCount,
    totalCount: items.length,
    selectedPercentage:
      items.length > 0
        ? Math.round((state.selectedCount / items.length) * 100)
        : 0,
    remainingSlots: maxSelection
      ? Math.max(0, maxSelection - state.selectedCount)
      : Number.POSITIVE_INFINITY,
    isAtMaxCapacity: maxSelection ? state.selectedCount >= maxSelection : false,
  };

  return {
    // State
    state,
    stats,

    // Actions
    actions,

    // Convenience handlers
    handlers,

    // Selected data
    selectedItems: actions.getSelectedItems(),
    selectedIds: Array.from(selectedIds),
  };
}

export type { BulkSelectionState, BulkSelectionActions };
