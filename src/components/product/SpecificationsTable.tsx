import { cn } from "@/lib/utils";
import { ProductSpecification } from "@/types/product/product-detail";

interface SpecificationsTableProps {
  specifications: ProductSpecification[];
  className?: string;
}

export default function SpecificationsTable({
  specifications,
  className,
}: SpecificationsTableProps) {
  if (!specifications || specifications.length === 0) {
    return null;
  }

  // Filter out invalid specifications
  const validSpecifications = specifications.filter(spec => 
    spec && 
    typeof spec.name === 'string' && 
    spec.name.trim().length > 0 &&
    typeof spec.value === 'string'
  );

  if (validSpecifications.length === 0) {
    return null;
  }

  // Group specifications by first letter or category for better organization
  const groupedSpecs = validSpecifications.reduce((acc, spec) => {
    // Skip specs without valid names
    if (!spec.name || typeof spec.name !== 'string') {
      return acc;
    }
    
    const firstLetter = spec.name.charAt(0).toUpperCase();
    if (!acc[firstLetter]) {
      acc[firstLetter] = [];
    }
    acc[firstLetter].push(spec);
    return acc;
  }, {} as Record<string, ProductSpecification[]>);

  // If grouping failed, fallback to single group
  if (Object.keys(groupedSpecs).length === 0) {
    groupedSpecs['SPECS'] = validSpecifications;
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Desktop Table View */}
      <div className="hidden md:block border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground border-b">
                Specification
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground border-b">
                Value
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {validSpecifications.map((spec, index) => (
              <tr
                key={spec.id || index}
                className={cn(
                  "transition-colors hover:bg-muted/30",
                  index % 2 === 0 ? "bg-background" : "bg-muted/20"
                )}
              >
                <td className="px-6 py-4 text-sm font-medium text-foreground w-1/2">
                  {spec.name}
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span>{spec.value}</span>
                    {spec.unit && (
                      <span className="text-xs text-muted-foreground/70 font-medium">
                        {spec.unit}
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {Object.entries(groupedSpecs).map(([letter, specs]) => (
          <div key={letter} className="border rounded-lg overflow-hidden">
            <div className="bg-muted/50 px-4 py-3 border-b">
              <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                {letter}
              </h4>
            </div>
            <div className="divide-y divide-border">
              {specs.map((spec, index) => (
                <div
                  key={spec.id || index}
                  className="p-4 bg-background hover:bg-muted/30 transition-colors"
                >
                  <div className="space-y-2">
                    <dt className="text-sm font-medium text-foreground">
                      {spec.name}
                    </dt>
                    <dd className="text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <span>{spec.value}</span>
                        {spec.unit && (
                          <span className="text-xs text-muted-foreground/70 font-medium">
                            {spec.unit}
                          </span>
                        )}
                      </div>
                    </dd>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t">
        <span>
          {validSpecifications.length} specification{validSpecifications.length !== 1 ? "s" : ""}
        </span>
        <span className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Verified
        </span>
      </div>
    </div>
  );
}
