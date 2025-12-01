# SPRForm Component

A React component for collecting Special Price Request (SPR) customer information including end customer name, project name, competitors, and price justification.

## Overview

The `SPRForm` component is used in quote summary pages to collect customer information required for Special Price Requests. It provides form fields for:
- End Customer Name
- Project Name
- Competitors (with multi-select functionality)
- Price Justification

## Props

```typescript
interface SPRFormProps {
  sellerCompanyId?: number;                    // Seller company ID to fetch competitors
  customerName?: string;                        // Initial customer name value
  projectName?: string;                        // Initial project name value
  competitors?: string[];                      // Array of selected competitor names
  priceJustification?: string;                 // Initial price justification text
  onCustomerNameChange?: (value: string) => void;
  onProjectNameChange?: (value: string) => void;
  onCompetitorsChange?: (value: string[]) => void;
  onPriceJustificationChange?: (value: string) => void;
}
```

## Usage

### Basic Usage

```tsx
import SPRForm from "@/components/sales/SPRForm/SPRForm";

function QuoteSummaryPage() {
  const [customerName, setCustomerName] = useState("");
  const [projectName, setProjectName] = useState("");
  const [competitors, setCompetitors] = useState<string[]>([]);
  const [priceJustification, setPriceJustification] = useState("");

  return (
    <SPRForm
      sellerCompanyId={123}
      customerName={customerName}
      projectName={projectName}
      competitors={competitors}
      priceJustification={priceJustification}
      onCustomerNameChange={setCustomerName}
      onProjectNameChange={setProjectName}
      onCompetitorsChange={setCompetitors}
      onPriceJustificationChange={setPriceJustification}
    />
  );
}
```

### With Initial Values

```tsx
<SPRForm
  sellerCompanyId={123}
  customerName="ABC Corporation"
  projectName="Project X"
  competitors={["Competitor 1", "Competitor 2"]}
  priceJustification="Market competitive pricing required"
  onCustomerNameChange={(value) => console.log(value)}
  onProjectNameChange={(value) => console.log(value)}
  onCompetitorsChange={(value) => console.log(value)}
  onPriceJustificationChange={(value) => console.log(value)}
/>
```

## Features

### 1. Customer Information Fields
- **End Customer Name**: Text input for customer name
- **Project Name**: Text input for project name
- **Price Justification**: Textarea for detailed justification

### 2. Competitors Management
- **Multi-select**: Users can select multiple competitors from a dropdown
- **Dynamic Loading**: Competitors are fetched based on `sellerCompanyId`
- **Selected Display**: Selected competitors are displayed as removable badges
- **Duplicate Prevention**: Prevents adding the same competitor twice

### 3. Loading States
- Shows loading message when competitors are being fetched
- Disables select dropdown during loading
- Handles empty competitor lists gracefully

### 4. Internationalization
- All labels and placeholders are internationalized using `next-intl`
- Translation keys:
  - `customerInformation`
  - `endCustomerName`
  - `enterCustomerName`
  - `projectName`
  - `enterProjectName`
  - `competitors`
  - `selectCompetitors`
  - `loadingCompetitors`
  - `noCompetitorsAvailable`
  - `removeCompetitor`
  - `priceJustification`
  - `enterPriceJustification`

## Dependencies

- **next-intl**: For internationalization
- **@/hooks/useGetManufacturerCompetitors**: Hook to fetch competitors list
- **@/components/ui/card, input, label, select, textarea**: UI components

## Competitor Data Structure

The component expects competitor data in the following format:

```typescript
interface CompetitorDetail {
  id?: number;
  name?: string;
  competitorName?: string;
  manufacturerCompanyId?: number;
  createdDate?: string;
  lastUpdatedDate?: string;
}
```

The component uses `name` or `competitorName` field (whichever is available) to display and store competitor values.

## Behavior

### Competitor Selection
- When a competitor is selected from the dropdown, it's added to the `competitors` array
- The competitor appears as a badge below the select dropdown
- Each badge has a remove button (×) to remove the competitor

### Competitor Removal
- Clicking the × button removes the competitor from the list
- Calls `onCompetitorsChange` with the updated array

### Duplicate Prevention
- If a competitor is already in the list, selecting it again won't add a duplicate
- The `handleCompetitorSelect` function checks if the competitor already exists before adding

## Testing

See `SPRForm.test.tsx` for comprehensive test coverage including:
- Component rendering
- User interactions
- Competitor management
- Loading states
- Edge cases
- Accessibility

## Mock Data

See `SPRForm.mocks.tsx` for mock data and test utilities.

