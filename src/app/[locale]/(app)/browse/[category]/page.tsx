import { redirect } from "next/navigation";
import { PageProps } from "@/types";

/**
 * Legacy Browse Route - Redirects to new category structure
 * 
 * Old: /browse/[category]
 * New: /[...categories]
 * 
 * This maintains backward compatibility during migration
 */
export default async function LegacyBrowsePage({ params }: PageProps) {
  const { category, locale } = await params;
  
  // Redirect to new category structure
  // If category is "all", redirect to home or categories list
  if (category === "all" || !category) {
    redirect(`/${locale}`);
  }

  // Redirect to new category route
  redirect(`/${locale}/${category}`);
}
