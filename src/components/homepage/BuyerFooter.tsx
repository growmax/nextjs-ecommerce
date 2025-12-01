"use client";

import React, { useState, useEffect } from "react";
import { useHomepageConfig, HomepageConfig } from "@/hooks/useHomepageConfig";
import find from "lodash/find";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Image from "next/image";
import { ChevronUp } from "lucide-react";

interface BuyerFooterProps {
  initialConfig?: HomepageConfig | null;
  domain: string;
  isMobile?: boolean;
}

/**
 * Buyer-fe style Footer component
 * Fetches footer data from StoreFrontdata (FOOTER property)
 * Matches the buyer-fe Footer.jsx implementation
 */
export default function BuyerFooter({
  initialConfig,
  domain,
  isMobile: propIsMobile,
}: BuyerFooterProps) {
  const { data: homepageConfig } = useHomepageConfig(domain);
  const [isMobile, setIsMobile] = useState(propIsMobile || false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  const config = initialConfig || homepageConfig;

  // Detect mobile
  useEffect(() => {
    if (propIsMobile !== undefined) {
      setIsMobile(propIsMobile);
      return;
    }
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [propIsMobile]);

  // Handle scroll for back-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Get footer data from StoreFrontdata
  const footerData = React.useMemo(() => {
    if (!config?.StoreFrontdata) return null;

    const footerEntry = find(
      config.StoreFrontdata,
      item => item.storeFrontProperty === "FOOTER"
    );

    if (!footerEntry?.dataJson) return null;

    try {
      return typeof footerEntry.dataJson === "string"
        ? JSON.parse(footerEntry.dataJson)
        : footerEntry.dataJson;
    } catch (error) {
      console.error("Failed to parse footer data:", error);
      return null;
    }
  }, [config?.StoreFrontdata]);

  // If no footer data, don't render
  if (!footerData) {
    return null;
  }

  // CONTENT ONLY from API. Styling is removed.
  const {
    copyRight = {},
    backToTop,
    showCopyRightMob = false,
    showCopyRight = false,
    isCollapsedViewMob,
    listOfItems = [],
    showBrowsePages: _showBrowsePages,
    showBrowsePagesMob: _showBrowsePagesMob,
    showWABrowsePages: _showWABrowsePages,
    showWhatsappButton,
    whatsappMessage,
    whatsappNumber,
    whatsappAlign = "right",
  } = footerData;

  const {
    // CRbgColor, CRbgColorMob, textColor, textColorMob are removed
    title,
    titleMob,
  } = copyRight;

  // Only show footer on homepage (buyer-fe behavior)
  const showFooter = true; // Always show on homepage

  if (!showFooter) {
    return null;
  }

  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleWhatsApp = () => {
    if (!whatsappNumber) return;
    const message = encodeURIComponent(whatsappMessage || "");
    if (isMobile) {
      window.open(
        `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${message}&forceIntent=true&load=loadInIOSExternalSafari`,
        "_blank"
      );
    } else {
      window.open(
        `https://web.whatsapp.com/send?phone=${whatsappNumber}&text=${message}`,
        "_blank"
      );
    }
  };

  return (
    <>
      <div
        className="w-full relative"
        id="scroll-Footer"
        style={{
          paddingBottom: isMobile ? 0 : 0,
        }}
      >
        {/* Main Footer Container */}
        <div className="w-full">
          {/* Mobile Accordion View */}
          {isMobile &&
            isCollapsedViewMob &&
            listOfItems &&
            listOfItems.length > 0 && (
              <div className="w-full bg-muted text-muted-foreground">
                <Accordion type="multiple" className="w-full">
                  {listOfItems.slice(0, 4).map((list: any, indexP: number) => {
                    const showColumn =
                      list.showColumnMob !== undefined
                        ? list.showColumnMob
                        : list.showColumn !== false;

                    if (!showColumn) return null;

                    const columnTitle =
                      list?.innerList
                        ?.map((item: any) => item.title)
                        .filter(Boolean)
                        .join(", ") || "More Information";

                    return (
                      <AccordionItem
                        key={indexP}
                        value={`footer-${indexP}`}
                        className="border-b border-border m-0"
                      >
                        <AccordionTrigger className="px-4 py-3">
                          <span className="text-base font-medium">
                            {columnTitle}
                          </span>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="p-0">
                            <FooterColumnContent
                              list={list}
                              isMobile={isMobile}
                              indexP={indexP}
                            />
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </div>
            )}

          {/* Desktop/Non-Collapsed View - Match buyer-fe exact structure */}
          {(!isMobile || !isCollapsedViewMob) &&
            listOfItems &&
            listOfItems.length > 0 && (
              <div
                className="w-full bg-muted text-muted-foreground"
                // Inline style for color removed
              >
                <div className="flex flex-col">
                  {listOfItems.slice(0, 4).map((list: any, indexP: number) => {
                    const showColumn =
                      list.showColumnMob !== undefined
                        ? isMobile
                          ? list.showColumnMob
                          : list.showColumn
                        : list.showColumn !== false;

                    if (!showColumn) return null;

                    return (
                      <FooterColumnContent
                        key={indexP}
                        list={list}
                        isMobile={isMobile}
                        indexP={indexP}
                      />
                    );
                  })}
                </div>
              </div>
            )}
        </div>

        {/* Copyright Section - Match buyer-fe exact positioning and colors */}
        {(isMobile ? showCopyRightMob : showCopyRight) && (
          <div
            className={cn(
              "w-full bg-background text-foreground", // Color classes applied
              isMobile
                ? "flex flex-col items-center"
                : "flex flex-row items-center"
            )}
            style={{
              // backgroundColor and color removed, padding kept
              padding: "16px",
            }}
          >
            {/* Left text with flexGrow - match buyer-fe flexGrow="0.97" */}
            <div
              className={cn(
                "text-sm",
                isMobile ? "text-center mb-2" : "text-left",
                !isMobile && "flex-[0.97]"
              )}
            >
              {isMobile ? titleMob : title}
            </div>
            {/* Right "Powered by" section - match buyer-fe alignment */}
            <div
              className={cn(
                "flex items-center",
                isMobile ? "justify-center" : "justify-end"
              )}
            >
              <span className="text-sm mr-1">Powered by</span>
              <a
                href="https://growmax.io"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center"
              >
                <Image
                  src="/images/growmax-logo.svg"
                  alt="growmax"
                  width={120}
                  height={20}
                  quality={100}
                  className="h-5 w-auto object-contain"
                />
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Back to Top Button - Match buyer-fe position exactly */}
      {!isMobile && backToTop && showBackToTop && (
        <button
          onClick={handleBackToTop}
          className="fixed z-50 rounded-full h-12 w-12 p-0 shadow-lg bg-card text-card-foreground hover:bg-accent transition-colors"
          style={{
            bottom: "48px",
            right: "18px",
          }}
          aria-label="Back to top"
        >
          <ChevronUp className="h-6 w-6 mx-auto" />
        </button>
      )}

      {/* WhatsApp Button - Match buyer-fe position and colors exactly */}
      {showWhatsappButton && whatsappNumber && (
        <button
          onClick={handleWhatsApp}
          className="fixed z-[100] rounded-full h-14 w-14 p-0 shadow-lg transition-colors text-white bg-[#25D366] hover:bg-[#128C7E]"
          style={{
            // backgroundColor removed, positioning kept
            bottom: isMobile
              ? "85px"
              : whatsappAlign === "right"
                ? backToTop
                  ? "118px"
                  : "48px"
                : "48px",
            right:
              whatsappAlign === "right" ? (isMobile ? "8px" : "18px") : "auto",
            left:
              whatsappAlign === "left" ? (isMobile ? "8px" : "18px") : "auto",
          }}
          aria-label="WhatsApp"
        >
          <Image
            src="/images/whatsapp-icon.png"
            alt="whatsapp"
            width={32}
            height={32}
            className="w-8 h-8 mx-auto"
          />
        </button>
      )}
    </>
  );
}

/**
 * Footer Column Content Component
 * Renders the inner list items for each footer column
 * Matches buyer-fe Footercolumns.js structure exactly
 */
function FooterColumnContent({
  list,
  isMobile,
  indexP: _indexP,
}: {
  list: any;
  isMobile: boolean;
  indexP: number;
}) {
  // Color and border properties are removed from destructuring
  const { borderWidth = 0, borderWidthMob = 0 } = list;

  return (
    <div
      className={cn(
        "w-full bg-muted text-muted-foreground", // Color classes applied
        isMobile ? "flex flex-col" : "flex flex-row"
      )}
      style={{
        // backgroundColor, color, and borderColor removed. Padding and borderWidth kept.
        padding: "16px",
        borderBottom: `${isMobile ? borderWidthMob : borderWidth}px solid var(--border)`,
      }}
    >
      {list?.innerList?.map((innerItem: any, indexC: number) => {
        const blockWidth = innerItem.blockWidth || (isMobile ? 100 : 25);

        return (
          <div
            key={indexC}
            className={cn(
              isMobile ? "w-full mb-2" : "pr-2",
              !isMobile && "flex-shrink-0"
            )}
            style={{
              width: isMobile ? "100%" : `${blockWidth}%`,
            }}
          >
            {innerItem.title && (
              <h3
                className="text-lg font-semibold mb-3 leading-tight" // Replaced inline style with classes
                // style={{ lineHeight: "30px", marginBottom: "12px" }}
              >
                {innerItem.title}
              </h3>
            )}
            {innerItem.description && (
              <div
                className="text-sm prose prose-sm dark:prose-invert" // Added prose classes for better rendering
                // style={{ fontSize: "0.875rem" }}
                dangerouslySetInnerHTML={{
                  __html: innerItem.description,
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
