"use client";

import {
  HomepageConfig,
  useHomepageConfig,
} from "@/hooks/useHomepageConfig/useHomepageConfig";
import find from "lodash/find";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import BannerSlider from "@/components/homepage/BannerSlider";
import CollectionSlider from "@/components/homepage/CollectionSlider";
import CustomImageLink from "@/components/homepage/CustomImageLink";
import ProductSection from "@/components/homepage/ProductSection";

interface HomepageClientProps {
  initialConfig?: HomepageConfig | null;
  domain: string;
}

/**
 * Main homepage client component
 * Dynamically renders sections based on HomePageList configuration
 */
export default function HomepageClient({
  initialConfig,
  domain,
}: HomepageClientProps) {
  const { data: homepageConfig, isLoading } = useHomepageConfig(domain);
  const [isMobile, setIsMobile] = useState(false);

  // Use initial config if available, otherwise use fetched config
  const config = initialConfig || homepageConfig;

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Get HomePageList from config - match buyer-fe logic exactly
  const homePageList = useMemo(() => {
    if (!config?.HomePageList) return [];
    // Ensure it's an array
    const list = Array.isArray(config.HomePageList) ? config.HomePageList : [];
    return list;
  }, [config]);

  // Get theme data
  const themeData = useMemo(() => {
    return config?.ThemeData || {};
  }, [config]);

  const placeholderImage = themeData?.placeholderImage as string | undefined;
  const elasticIndex = config?.ELASTIC_INDEX;

  // Filter sections based on mobile/desktop visibility - match buyer-fe logic
  // In buyer-fe: isMobile ? (isUndefined(o.showSectionMob) ? true : o.showSectionMob) : o.showSection
  const visibleSections = useMemo(() => {
    return homePageList.filter(section => {
      if (isMobile) {
        // If showSectionMob is undefined, show it (default true)
        return section.showSectionMob === undefined
          ? true
          : section.showSectionMob;
      }
      // For desktop, check showSection (defaults to true if undefined in buyer-fe)
      return section.showSection !== false;
    });
  }, [homePageList, isMobile]);

  // Get StoreFrontdata for section data
  const storeFrontData = useMemo(() => {
    return config?.StoreFrontdata || [];
  }, [config]);

  // Helper to get section data
  const getSectionData = (storeFrontProperty: string) => {
    const entry = find(
      storeFrontData,
      item => item.storeFrontProperty === storeFrontProperty
    );
    if (!entry?.dataJson) return {};

    try {
      return typeof entry.dataJson === "string"
        ? JSON.parse(entry.dataJson)
        : entry.dataJson;
    } catch (error) {
      console.error("Failed to parse section data:", error);
      return {};
    }
  };

  // Debug logging (remove in production)
  // Must be called before any early returns to follow rules of hooks
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("Homepage Config:", {
        homePageListLength: homePageList.length,
        visibleSectionsLength: visibleSections.length,
        homePageList,
        config: config ? "exists" : "null",
      });
    }
  }, [homePageList, visibleSections, config]);

  if (isLoading && !initialConfig) {
    return (
      <div className="container mx-auto p-8">
        <div className="space-y-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  // Empty state - match buyer-fe check: !HomePageList?.length
  // Only show empty state if HomePageList itself is empty, not just visibleSections
  if (!homePageList.length) {
    return (
      <div className="container mx-auto p-8">
        <div className="relative mx-auto w-full md:w-[70%] h-[80%] min-h-[400px]">
          <Image
            src="/images/empty-section.png"
            alt="Home page is empty"
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 70vw"
          />
        </div>
        <h2 className="text-center text-3xl font-semibold mt-4">
          Home page is empty
        </h2>
      </div>
    );
  }

  return (
    <div className="w-full">
      {visibleSections.map((section, index) => {
        const sectionData = getSectionData(section.storeFrontProperty);

        // Debug logging
        if (process.env.NODE_ENV === "development") {
          console.log(`Rendering section ${index}:`, {
            componentName: section.componentName,
            sectionType: section.sectionType,
            storeFrontProperty: section.storeFrontProperty,
            sectionDataKeys: Object.keys(sectionData),
          });
        }

        // BannerSliderSectionCard
        if (section.componentName === "BannerSliderSectionCard") {
          return (
            <BannerSlider key={index} data={sectionData} isMobile={isMobile} />
          );
        }

        // SubcategoryProductgroupSectionCard or ProductsBrandSectionCard (collection)
        if (
          (section.componentName === "SubcategoryProductgroupSectionCard" ||
            section.componentName === "ProductsBrandSectionCard") &&
          (section.sectionType === "subcategory" ||
            section.sectionType === "productgroup" ||
            section.sectionType === "brands")
        ) {
          return (
            <CollectionSlider
              key={index}
              data={sectionData}
              sectionType={section.sectionType}
              isMobile={isMobile}
              placeholderImage={placeholderImage}
            />
          );
        }

        // ProductsBrandSectionCard (products)
        if (
          section.componentName === "ProductsBrandSectionCard" &&
          section.sectionType === "products"
        ) {
          return (
            <ProductSection
              key={index}
              data={sectionData}
              isMobile={isMobile}
              placeholderImage={placeholderImage}
              elasticIndex={elasticIndex}
            />
          );
        }

        // CustomImageLinkSectionCard
        if (section.componentName === "CustomImageLinkSectionCard") {
          return (
            <CustomImageLink
              key={index}
              data={sectionData}
              isMobile={isMobile}
              placeholderImage={placeholderImage}
            />
          );
        }

        // Unknown component type
        if (process.env.NODE_ENV === "development") {
          console.warn("Unknown component type:", section.componentName);
        }
        return null;
      })}
    </div>
  );
}
