// Main Components
export { ClientOnly } from "@/components/ClientOnly";
export { ConditionalFooter } from "@/components/ConditionalFooter";
export { ErrorBoundary, withErrorBoundary } from "@/components/ErrorBoundary";
export { default as Footer } from "@/components/footer";
export { default as ImageWithFallback } from "@/components/ImageWithFallback";
export { default as MenubarDemo } from "@/components/menu";
export { default as NavBar } from "@/components/nav-bar";
export { NavMain } from "@/components/nav-main";
export { NavProjects } from "@/components/nav-projects";
export { NavSecondary } from "@/components/nav-secondary";
export { NavUser } from "@/components/nav-user";
export { default as NoSSR } from "@/components/NoSSR";
export { default as NotificationDropdown } from "@/components/notifications";
export { default as PricingFormat } from "@/components/PricingFormat";
export { RoutePrefetcher } from "@/components/RoutePrefetcher";
export { SearchForm } from "@/components/search-form";
export { SiteHeader } from "@/components/site-header";
export { TenantDataProvider } from "@/components/TenantDataProvider";
export { ViewportScaler } from "@/components/ViewportScaler";

// UI Components
export {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
export { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
export { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
export { Badge, badgeVariants } from "@/components/ui/badge";
export type { BadgeProps } from "@/components/ui/badge";
export {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
export { Button, buttonVariants } from "@/components/ui/button";
export { Calendar, CalendarDayButton } from "@/components/ui/calendar";
export {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
export {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
export {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
export type { ChartConfig } from "@/components/ui/chart";
export { Checkbox } from "@/components/ui/checkbox";
export {
  Collapsible,
  CollapsibleContent,
  CollapsibleSection,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
export {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
export { CustomPagination } from "@/components/ui/custom-pagination";
export type { CustomPaginationProps } from "@/components/ui/custom-pagination";
export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
export {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
export { Input } from "@/components/ui/input";
export { Label } from "@/components/ui/label";
export {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarPortal,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/ui/menubar";
export {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
export {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
export { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
export { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
export { Separator } from "@/components/ui/separator";
export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
export { Skeleton } from "@/components/ui/skeleton";
export { Slider } from "@/components/ui/slider";
export { Toaster } from "@/components/ui/sonner";
export { Switch } from "@/components/ui/switch";
export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
export { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
export type { TabsTriggerProps } from "@/components/ui/tabs";
export { Textarea } from "@/components/ui/textarea";
export { Toggle, toggleVariants } from "@/components/ui/toggle";
export { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
export {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
export {
  Info,
  Subtitle,
  Title,
  TypographyLarge,
  TypographyMuted,
  TypographySmall,
} from "@/components/ui/typography";

// Forms Components
export { AutoCompleteField } from "@/components/forms/AutoCompleteField";
export { FormField } from "@/components/forms/FormField";
export { ImageUpload } from "@/components/forms/ImageUpload";
export { PhoneInput } from "@/components/forms/PhoneInput";

// Homepage Components
export { default as BannerSlider } from "@/components/homepage/BannerSlider";
export { default as BuyerFooter } from "@/components/homepage/BuyerFooter";
export { default as CollectionSlider } from "@/components/homepage/CollectionSlider";
export { default as CustomImageLink } from "@/components/homepage/CustomImageLink";
export { default as HomepageClient } from "@/components/homepage/HomepageClient";
export { default as ProductSection } from "@/components/homepage/ProductSection";
export { default as TitleComponent } from "@/components/homepage/TitleComponent";

// Product Components
export { default as AddToCartSectionWrapper } from "@/components/product/AddToCartSectionWrapper";
export { default as ColorVariantSelector } from "@/components/product/ColorVariantSelector";
export { default as MobileCartAction } from "@/components/product/MobileCartAction";
export { default as ProductBreadcrumb } from "@/components/product/ProductBreadcrumb";
export { default as ProductImageGallery } from "@/components/product/ProductImageGallery";
export { default as ProductImageGalleryClient } from "@/components/product/ProductImageGalleryClient";
export { default as ProductInfo } from "@/components/product/ProductInfo";
export { default as ProductLayout } from "@/components/product/ProductLayout";
export { default as ProductPageClient } from "@/components/product/ProductPageClient";
export { default as ProductPageClientContainer } from "@/components/product/ProductPageClientContainer";
export { default as ProductPricing } from "@/components/product/ProductPricing";
export { default as RelatedProducts } from "@/components/product/ProductRelated";
export { default as ProductVariants } from "@/components/product/ProductVariants";
export type { VariantSelection } from "@/components/product/ProductVariants";
export { default as SizeVariantSelector } from "@/components/product/SizeVariantSelector";
export { default as SpecificationsTable } from "@/components/product/SpecificationsTable";
export { default as VariantDebugInfo } from "@/components/product/VariantDebugInfo";
export { default as VariantInventoryUpdater } from "@/components/product/VariantInventoryUpdater";
export { default as VariantPriceUpdater } from "@/components/product/VariantPriceUpdater";
export { default as VariantProductDisplay } from "@/components/product/VariantProductDisplay";
export { default as VariantSelector } from "@/components/product/VariantSelector";

// Profile Components
export { OTPDialog } from "@/components/profile/OTPDialog";
export { PasswordChangeDialog } from "@/components/profile/PasswordChangeDialog";
export { default as ProfileDropdown } from "@/components/profile/ProfileButton";
export { ProfileCard } from "@/components/profile/ProfileCard";
export { default as ProfileMenu } from "@/components/profile/ProfileMenu";
export { UserPreferencesCard } from "@/components/profile/UserPreferencesCard";

// Providers Components
export { CartProviderWrapper } from "@/components/providers/CartProviderWrapper";

// Search Components
export { default as ProductSearchResults } from "@/components/search/ProductSearchResults";

// Cart Components
export { default as CartProceedButton } from "@/components/cart/CartProceedButton";
export { default as CartProductCard } from "@/components/cart/CartProductCard";
export { default as CartSnackBar } from "@/components/cart/CartSnackBar";
export { default as MultipleSellerCards } from "@/components/cart/MultipleSellerCards";

// Custom Components
export { ActionToolbar, pluralize } from "@/components/custom/action-toolbar";
export type {
  ActionToolbarProps,
  ActionToolbarRef,
  SelectionCount,
} from "@/components/custom/action-toolbar";
export { DashboardToolbar } from "@/components/custom/dashboard-toolbar";
export type {
  DashboardToolbarProps,
  DashboardToolbarRef,
} from "@/components/custom/dashboard-toolbar";
export {
  GlobalLoader,
  LogoutLoader,
  ProcessingLoader,
  SubmittingLoader,
} from "@/components/custom/global-loader";
export { LoadingButton } from "@/components/custom/loading-button";
export { default as Logo } from "@/components/custom/logo";
export { default as SearchBox } from "@/components/custom/search";

// Dialogs Components
export { AddressDetailsDialog } from "@/components/dialogs/AddressDetailsDialog";
export { EditOrderNameDialog } from "@/components/dialogs/EditOrderNameDialog";
export type { EditOrderNameDialogProps } from "@/components/dialogs/EditOrderNameDialog";
export { RequestEditDialog } from "@/components/dialogs/RequestEditDialog";
export type { RequestEditDialogProps } from "@/components/dialogs/RequestEditDialog";
export { VersionsDialog } from "@/components/dialogs/VersionsDialog";
export type {
  Version,
  VersionsDialogProps,
} from "@/components/dialogs/VersionsDialog";

// Auth Components
// NOTE: Server components should be imported directly, not through barrel, to avoid server-only dependencies in client bundles
// - AuthAwareHeader (server component - imports from auth-server.server.ts)
// - AuthAwareHeaderWithClient (server component - imports from auth-server.server.ts)
// - AuthAwareHomepage (server component - imports from auth-server.server.ts)
// Use type-only imports from @/lib/auth-types for client code instead
export { AuthAwareContent } from "@/components/auth/AuthAwareContent";
export { AuthAwareNav } from "@/components/auth/AuthAwareNav";
export {
  AuthGuard,
  AuthenticatedOnly,
  UnauthenticatedOnly,
  withAuthGuard,
} from "@/components/auth/AuthGuard";

// App Components
export { AppHeader } from "@/components/AppHeader/app-header";
export { AppSidebar } from "@/components/AppSideBar/app-sidebar";

// Avatar Components
export { AvatarCard } from "@/components/AvatarCard/AvatarCard";

// Language Components
export { LanguageSwitcher } from "@/components/LanguageSwitcher/LanguageSwitcher";

// Loaders Components
export { PageLoader } from "@/components/Loaders/PageLoader/page-loader";

// SEO Components
export {
  OrganizationStructuredData,
  ProductStructuredData,
  WebSiteStructuredData,
} from "@/components/seo/ProductStructuredData";

// Global Components
export { DataTable } from "@/components/Global/DataTable/DataTable";
export { DataTablePagination } from "@/components/Global/DataTable/DataTablePagination";
export { DraggableRow } from "@/components/Global/DataTable/DraggableRow";
export { DragHandle } from "@/components/Global/DataTable/DragHandle";
export { SkeletonRow } from "@/components/Global/DataTable/SkeletonRow";

// Global Utilities
export {
  createActionsColumn,
  createDragHandleColumn,
  createSelectionColumn,
  injectOptionalColumns,
} from "@/components/Global/DataTable/columnHelpers";

// Global Types
export type {
  DataTablePaginationConfig,
  DataTableProps,
  DataTableTab,
} from "@/components/Global/DataTable/types";
export { default as HeaderBar } from "@/components/Global/HeaderBar/HeaderBar";
export { default as AddMoreProducts } from "@/components/Global/Products/AddMoreProducts";
export { SectionToolbar } from "@/components/Global/SectionToolbar/SectionToolbar";
export type {
  SectionToolbarProps,
  SectionToolbarRef,
} from "@/components/Global/SectionToolbar/SectionToolbar";
export { ApplicationLayout } from "@/components/layout/ApplicationLayout";
export { LandingLayout } from "@/components/layout/LandingLayout";
export {
  CenteredLayout,
  FullWidthLayout,
  PageContent,
} from "@/components/layout/PageContent";
export type { LayoutType } from "@/components/layout/PageContent";
export { PageLayout } from "@/components/layout/PageLayout";
export { FilterSection } from "@/components/ProductList/FilterSection";
export { MobileFilterSheet } from "@/components/ProductList/MobileFilterSheet";
export { ProductCard } from "@/components/ProductList/ProductCard";
export { ProductCardSkeleton } from "@/components/ProductList/ProductCardSkeleton";
export { ProductGrid } from "@/components/ProductList/ProductGrid";
export { ProductGridSkeleton } from "@/components/ProductList/ProductGridSkeleton";
export { SearchBar } from "@/components/ProductList/SearchBar";
export { ViewToggle } from "@/components/ProductList/ViewToggle";
export { default as CartPriceDetails } from "@/components/sales/CartPriceDetails";
export { default as CashDiscountCard } from "@/components/sales/CashDiscountCard";
export { default as OrderContactDetails } from "@/components/sales/contactdetails";
export { default as CustomerInfoCard } from "@/components/sales/customer-info-card";
export { default as DetailsSkeleton } from "@/components/sales/DetailsSkeleton";
export { default as FilterDrawer } from "@/components/sales/FilterDrawer";
export { default as OrderPriceDetails } from "@/components/sales/order-price-details";
export { default as OrderProductsTable } from "@/components/sales/order-products-table";
export type {
  OrderProductsTableProps,
  ProductItem,
} from "@/components/sales/order-products-table";
export { default as OrderStatusTracker } from "@/components/sales/order-status-tracker";
export type {
  OrderStatusStep,
  OrderStatusTrackerProps,
} from "@/components/sales/order-status-tracker";
export { default as ProductSearchInput } from "@/components/sales/ProductSearchInput";
export type {
  ProductSearchInputProps,
  ProductSearchResult,
} from "@/components/sales/ProductSearchInput";
export { default as QuoteFilterForm } from "@/components/sales/QuoteFilterForm";
export type {
  FormMethods,
  QuoteFilterFormData,
  StatusOption,
} from "@/components/sales/QuoteFilterForm";
export { default as SalesHeader } from "@/components/sales/sales-header";
export type {
  SalesHeaderButton,
  SalesHeaderMenuOption,
  SalesHeaderProps,
} from "@/components/sales/sales-header";
export { default as SPRForm } from "@/components/sales/SPRForm";
export { default as OrderTermsCard } from "@/components/sales/terms-card";
export { default as SummaryActions } from "@/components/summary/SummaryActions";
export { default as SummaryAdditionalInfo } from "@/components/summary/SummaryAdditionalInfo";
export { default as SummaryAddressSection } from "@/components/summary/SummaryAddressSection";
export { default as SummaryNameCard } from "@/components/summary/SummaryNameCard";
export { default as SummaryPriceDetails } from "@/components/summary/SummaryPriceDetails";
export { default as SummaryProductsTable } from "@/components/summary/SummaryProductsTable";
export { default as SummaryTermsSection } from "@/components/summary/SummaryTermsSection";
