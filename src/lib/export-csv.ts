export type CsvColumn<T> = {
  header: string;
  value: (row: T) => string | number | null | undefined;
};

export interface ProductCsvRow {
  itemNo?: string | number;
  itemName?: string;
  productShortDescription?: string;
  itemCode?: string;
  brandProductId?: string | number;
  quantity?: number;
  unitQuantity?: number;
  invoiceQuantity?: number;
  invoicedQty?: number;
  unitListPrice?: number;
  basePrice?: number;
  unitPrice?: number;
  discountPercentage?: number;
  discount?: number;
  igstPercentage?: number;
  tax?: number;
  igst?: number;
  amount?: number;
  totalPrice?: number;
  itemTaxableAmount?: number;
  productTaxes?: Array<{
    compound?: boolean;
    taxName?: string;
    taxPercentage?: number;
  }>;
}

export function toCsv<T>(rows: T[], columns: CsvColumn<T>[]): string {
  const escape = (val: unknown): string => {
    if (val === null || val === undefined) return "";
    const str = String(val);
    // Escape quotes by doubling them and wrap fields containing commas/newlines/quotes in quotes
    const needsWrapping = /[",\n\r]/.test(str);
    const cleaned = str.replace(/"/g, '""');
    return needsWrapping ? `"${cleaned}"` : cleaned;
  };

  const header = columns.map(c => escape(c.header)).join(",");
  const data = rows
    .map(row => columns.map(c => escape(c.value(row))).join(","))
    .join("\r\n");
  return `${header}\r\n${data}`;
}

export function downloadCsv(filename: string, csv: string) {
  // Prepend BOM for Excel compatibility
  const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function firstDefined<T>(...values: Array<T | null | undefined>): T | null {
  for (const value of values) {
    if (value !== null && value !== undefined) return value as T;
  }
  return null;
}

export function exportProductsToCsv(
  products: ProductCsvRow[],
  filename: string
) {
  const columns: CsvColumn<ProductCsvRow>[] = [
    { header: "Item No", value: r => firstDefined(r.itemNo) },
    {
      header: "Product Name",
      value: r => firstDefined(r.itemName, r.productShortDescription),
    },
    {
      header: "Item Code",
      value: r => firstDefined<string | number>(r.itemCode, r.brandProductId),
    },
    {
      header: "Quantity",
      value: r =>
        firstDefined(
          r.quantity,
          r.unitQuantity,
          r.invoiceQuantity,
          r.invoicedQty
        ),
    },
    {
      header: "Unit List Price",
      value: r => firstDefined(r.unitListPrice, r.basePrice),
    },
    { header: "Unit Price", value: r => firstDefined(r.unitPrice) },
    { header: "Discount %", value: r => firstDefined(r.discountPercentage) },
    { header: "Discount", value: r => firstDefined(r.discount) },
    {
      header: "Tax %",
      value: r => {
        // Extract tax percentage from productTaxes array (from API) or fallback to existing fields
        if (
          r.productTaxes &&
          Array.isArray(r.productTaxes) &&
          r.productTaxes.length > 0
        ) {
          const firstTax = r.productTaxes[0];
          return firstTax?.taxPercentage || 0;
        }
        return firstDefined(r.igstPercentage);
      },
    },
    { header: "Tax", value: r => firstDefined(r.tax, r.igst) },
    {
      header: "Amount",
      value: r => firstDefined(r.amount, r.totalPrice, r.itemTaxableAmount),
    },
  ];

  const csv = toCsv(products, columns);
  downloadCsv(filename, csv);
}
