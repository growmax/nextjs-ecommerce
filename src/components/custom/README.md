# Dashboard Toolbar Components

A comprehensive set of modern, TypeScript-based dashboard toolbar components built for Next.js 15 applications. These components provide enterprise-grade functionality with excellent performance, accessibility, and mobile responsiveness.

## Components Overview

### 1. DashboardToolbar

The main toolbar component that provides search, filtering, actions, and view controls for dashboard pages.

### 2. ActionToolbar

A contextual toolbar that appears for bulk actions or form operations.

### 3. Supporting Hooks

- `useDashboardToolbar` - State management for dashboard toolbar
- `useBulkSelection` - Selection state management for tables/lists

## Installation & Setup

All components are already included in your project. Import them from:

```typescript
import { DashboardToolbar, ActionToolbar } from "@/components/custom";
import { useDashboardToolbar, useBulkSelection } from "@/hooks";
```

## Component Features

### DashboardToolbar Features

- ✅ Search functionality with debouncing
- ✅ Filter controls with active indicators
- ✅ Primary and secondary action buttons
- ✅ View mode toggles (list/grid/board)
- ✅ Settings and more options menus
- ✅ Refresh functionality
- ✅ Loading states and skeletons
- ✅ Mobile-responsive design
- ✅ Custom positioning (sticky/fixed/relative)
- ✅ Filter chips display
- ✅ Labels and links support

### ActionToolbar Features

- ✅ Bulk action support
- ✅ Form mode (save/cancel)
- ✅ Smooth animations
- ✅ Selection count display
- ✅ Mobile-optimized layout
- ✅ Loading states
- ✅ Customizable actions

## Basic Usage

### Simple DashboardToolbar

```tsx
import { DashboardToolbar } from "@/components/custom";

export function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <DashboardToolbar
      title="Products"
      showSearch={{
        condition: true,
        placeholder: "Search products...",
        searchTextValue: searchQuery,
        handleSearch: setSearchQuery,
        handleClearAll: () => setSearchQuery(""),
      }}
      primary={{
        condition: true,
        value: "Add Product",
        startIcon: <Plus className="h-4 w-4" />,
      }}
      refresh={{
        condition: true,
      }}
    />
  );
}
```

### ActionToolbar for Bulk Actions

```tsx
import { ActionToolbar } from "@/components/custom";

export function ProductsList() {
  const [selectedItems, setSelectedItems] = useState(new Set());

  return (
    <ActionToolbar
      show={selectedItems.size}
      mode="bulk"
      itemName="product"
      onUncheckAll={() => setSelectedItems(new Set())}
      primaryAction={{
        condition: true,
        text: "Delete Selected",
        variant: "destructive",
        icon: <Trash2 className="h-4 w-4" />,
      }}
    />
  );
}
```

## Advanced Usage with Hooks

### Using useDashboardToolbar Hook

```tsx
import { useDashboardToolbar } from "@/hooks/useDashboardToolbar";

export function AdvancedDashboard() {
  const toolbar = useDashboardToolbar({
    enableSearch: true,
    enableFilters: true,
    enableViewToggle: true,
    searchDebounce: 300,
  });

  return (
    <DashboardToolbar
      ref={toolbar.toolbarRef}
      title="Advanced Dashboard"
      showSearch={toolbar.getSearchConfig()}
      filter={toolbar.getFilterConfig()}
      toggleButton={toolbar.getToggleButtonConfig()}
      // ... other props
    />
  );
}
```

### Using useBulkSelection Hook

```tsx
import { useBulkSelection } from "@/hooks/useBulkSelection";

export function SelectableTable() {
  const selection = useBulkSelection({
    items: products,
    getItemId: item => item.id,
    maxSelection: 50,
  });

  return (
    <>
      {/* Table with selection */}
      <DataTable
        data={products}
        onRowSelect={selection.handlers.onItemSelect}
        selectedIds={selection.selectedIds}
      />

      {/* Action toolbar */}
      <ActionToolbar
        show={selection.state.selectedCount}
        itemName="product"
        onUncheckAll={selection.handlers.onUnselectAll}
        // ... actions
      />
    </>
  );
}
```

## Complete Integration Example

```tsx
import { useQuery, useMutation } from "@tanstack/react-query";
import { DashboardToolbar, ActionToolbar } from "@/components/custom";
import { useDashboardToolbar, useBulkSelection } from "@/hooks";

export function CompleteDashboard() {
  // Toolbar state management
  const toolbar = useDashboardToolbar({
    enableSearch: true,
    enableFilters: true,
    searchDebounce: 300,
  });

  // Data fetching
  const {
    data: products,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["products", toolbar.debouncedSearch],
    queryFn: () => fetchProducts({ search: toolbar.debouncedSearch }),
  });

  // Selection management
  const selection = useBulkSelection({
    items: products || [],
    getItemId: item => item.id,
  });

  // Mutations
  const deleteProducts = useMutation({
    mutationFn: (ids: string[]) => deleteProductsApi(ids),
    onSuccess: () => {
      selection.actions.unselectAll();
      refetch();
    },
  });

  return (
    <div className="space-y-6">
      {/* Main toolbar */}
      <DashboardToolbar
        ref={toolbar.toolbarRef}
        title="Products"
        showSearch={toolbar.getSearchConfig()}
        filter={toolbar.getFilterConfig()}
        primary={{
          condition: true,
          value: "Add Product",
          handleClick: () => createProduct(),
          startIcon: <Plus className="h-4 w-4" />,
        }}
        refresh={{
          condition: true,
          handleRefresh: refetch,
          loading: isLoading,
        }}
        loading={isLoading}
      />

      {/* Data table */}
      <ProductTable
        products={products}
        selection={selection}
        loading={isLoading}
      />

      {/* Bulk actions */}
      <ActionToolbar
        show={selection.state.selectedCount}
        mode="bulk"
        itemName="product"
        onUncheckAll={selection.handlers.onUnselectAll}
        primaryAction={{
          condition: true,
          text: "Delete Selected",
          clickAction: () => deleteProducts.mutate(selection.selectedIds),
          loading: deleteProducts.isPending,
          variant: "destructive",
          icon: <Trash2 className="h-4 w-4" />,
        }}
      />
    </div>
  );
}
```

## API Reference

### DashboardToolbar Props

| Prop           | Type                                | Description                        |
| -------------- | ----------------------------------- | ---------------------------------- |
| `title`        | `string`                            | Main toolbar title                 |
| `showSearch`   | `SearchConfig`                      | Search functionality configuration |
| `filter`       | `FilterAction`                      | Filter button configuration        |
| `primary`      | `ToolbarAction`                     | Primary action button              |
| `secondary`    | `ToolbarAction`                     | Secondary action button            |
| `toggleButton` | `ToggleButtonConfig`                | View mode toggle buttons           |
| `refresh`      | `RefreshConfig`                     | Refresh button configuration       |
| `loading`      | `boolean`                           | Loading state                      |
| `position`     | `'fixed' \| 'sticky' \| 'relative'` | Toolbar positioning                |

### ActionToolbar Props

| Prop              | Type                | Description                          |
| ----------------- | ------------------- | ------------------------------------ |
| `show`            | `boolean \| number` | Whether to show toolbar              |
| `mode`            | `'bulk' \| 'form'`  | Toolbar mode                         |
| `itemName`        | `string`            | Singular item name for pluralization |
| `primaryAction`   | `BulkAction`        | Primary action configuration         |
| `secondaryAction` | `BulkAction`        | Secondary action configuration       |
| `onUncheckAll`    | `() => void`        | Uncheck all handler                  |

### useDashboardToolbar Options

| Option             | Type      | Default | Description                 |
| ------------------ | --------- | ------- | --------------------------- |
| `enableSearch`     | `boolean` | `true`  | Enable search functionality |
| `enableFilters`    | `boolean` | `true`  | Enable filter functionality |
| `enableViewToggle` | `boolean` | `true`  | Enable view mode toggle     |
| `searchDebounce`   | `number`  | `300`   | Search debounce delay (ms)  |

### useBulkSelection Options

| Option             | Type                  | Description                 |
| ------------------ | --------------------- | --------------------------- |
| `items`            | `T[]`                 | Array of items              |
| `getItemId`        | `(item: T) => string` | Function to get item ID     |
| `maxSelection`     | `number`              | Maximum selectable items    |
| `initialSelection` | `string[]`            | Initially selected item IDs |

## Styling & Customization

### CSS Classes

All components use Tailwind CSS and are fully customizable through the `className` prop:

```tsx
<DashboardToolbar
  className="bg-custom-color border-custom-border"
  title="Custom Styled Toolbar"
/>
```

### Mobile Responsiveness

Components automatically adapt to mobile screens with:

- Condensed layouts
- Touch-friendly buttons
- Simplified actions
- Responsive spacing

### Dark Mode Support

Full dark mode support through CSS variables and Tailwind's dark mode utilities.

## Performance Considerations

1. **Debounced Search**: Use the `searchDebounce` option to prevent excessive API calls
2. **Memoization**: Components are optimized with React.memo and useMemo
3. **Lazy Loading**: Only render visible components
4. **Efficient Selection**: useBulkSelection uses Set for O(1) lookups

## Migration from Material-UI

If migrating from the original Material-UI version:

1. Replace MUI imports with our components
2. Update prop names (see migration guide below)
3. Update styling from emotion/styled to Tailwind classes

### Prop Migration Guide

| Old MUI Prop          | New Prop              |
| --------------------- | --------------------- |
| `Filter.handleCLick`  | `filter.handleClick`  |
| `primary.handleCLick` | `primary.handleClick` |
| `ShowSearch`          | `showSearch`          |
| `MoreOption`          | `moreOptions`         |

## Examples

See the `/src/components/examples/` directory for complete working examples:

- `dashboard-toolbar-examples.tsx` - Basic usage examples
- `dashboard-with-api-integration.tsx` - API integration examples
- `complete-dashboard-example.tsx` - Full featured example with hooks

## Troubleshooting

### Common Issues

1. **TypeScript errors**: Ensure all required props are provided
2. **Styling issues**: Check Tailwind CSS configuration
3. **Performance**: Use debouncing for search and memoization for expensive operations
4. **Mobile layout**: Test on various screen sizes

### Debug Mode

Enable debug logging by setting the environment variable:

```bash
DEBUG_TOOLBAR=true
```

## Contributing

When contributing to these components:

1. Maintain TypeScript strict mode compliance
2. Include comprehensive JSDoc comments
3. Add examples for new features
4. Test on mobile devices
5. Ensure accessibility compliance (ARIA labels, keyboard navigation)

## License

These components are part of the Next.js Performance Boilerplate project.
