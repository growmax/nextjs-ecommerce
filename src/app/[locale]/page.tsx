"use client";

import { useTranslations } from "next-intl";
import { ButtonDemo } from "@/components/Button";
import TabsDemo from "@/components/TabButton";
import { AccordionDemo } from "@/components/accordion";
import Sonner from "@/components/sonner";
import { CardDemo } from "@/components/card_template";
import SearchInput from "@/components/search_box";
import MenubarDemo from "@/components/menu";
import { CarouselDemo } from "@/components/media_card";
import { ThemeTestComponent } from "@/components/theme-test";
import { ResponsiveTestComponent } from "@/components/responsive-test";

export default function Home() {
  const t = useTranslations();

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile-First Hero Section */}
      <div className="container mx-auto px-4 py-6 sm:py-8 lg:py-12">
        <h1 className="mb-6 text-center text-2xl font-bold sm:mb-8 sm:text-3xl lg:text-4xl">
          {t("messages.welcome")}
        </h1>

        <div className="mb-6 text-center sm:mb-8">
          <h2 className="mb-3 text-lg font-semibold sm:mb-4 sm:text-xl lg:text-2xl">
            {t("demo.components")}
          </h2>
        </div>
      </div>

      {/* Mobile-First Demo Sections */}
      <div className="space-y-6 sm:space-y-8">
        {/* Menu Demo */}
        <section className="container mx-auto px-4">
          <MenubarDemo />
        </section>

        {/* Search Demo */}
        <section>
          <div className="container mx-auto px-4">
            <h3 className="mb-3 text-base font-medium sm:mb-4 sm:text-lg">
              {t("demo.searchDemo")}
            </h3>
          </div>
          <SearchInput />
        </section>

        {/* Carousel Demo */}
        <section>
          <div className="container mx-auto px-4">
            <h3 className="mb-3 text-base font-medium sm:mb-4 sm:text-lg">
              {t("demo.carouselDemo")}
            </h3>
          </div>
          <div className="overflow-hidden">
            <CarouselDemo />
          </div>
        </section>

        {/* Card Demo */}
        <section>
          <div className="container mx-auto px-4">
            <h3 className="mb-3 text-base font-medium sm:mb-4 sm:text-lg">
              {t("demo.cardDemo")}
            </h3>
          </div>
          <div className="container mx-auto px-4">
            <CardDemo />
          </div>
        </section>

        {/* Button Demo */}
        <section>
          <div className="container mx-auto px-4">
            <h3 className="mb-3 text-base font-medium sm:mb-4 sm:text-lg">
              {t("demo.buttonDemo")}
            </h3>
          </div>
          <div className="container mx-auto px-4">
            <ButtonDemo />
          </div>
        </section>

        {/* Accordion Demo */}
        <section>
          <div className="container mx-auto px-4">
            <h3 className="mb-3 text-base font-medium sm:mb-4 sm:text-lg">
              {t("demo.accordionDemo")}
            </h3>
          </div>
          <div className="container mx-auto px-4">
            <AccordionDemo />
          </div>
        </section>

        {/* Tabs Demo */}
        <section>
          <div className="container mx-auto px-4">
            <h3 className="mb-3 text-base font-medium sm:mb-4 sm:text-lg">
              {t("demo.tabsDemo")}
            </h3>
          </div>
          <div className="container mx-auto px-4">
            <TabsDemo />
          </div>
        </section>

        {/* Notification Demo */}
        <section>
          <div className="container mx-auto px-4">
            <h3 className="mb-3 text-base font-medium sm:mb-4 sm:text-lg">
              {t("demo.notificationDemo")}
            </h3>
          </div>
          <div className="container mx-auto px-4">
            <Sonner />
          </div>
        </section>

        {/* TweakCN Theme Test */}
        <section>
          <div className="container mx-auto px-4">
            <h3 className="mb-3 text-base font-medium sm:mb-4 sm:text-lg">
              Theme Customization Test
            </h3>
          </div>
          <div className="container mx-auto px-4">
            <ThemeTestComponent />
          </div>
        </section>

        {/* Mobile-First Responsive Test */}
        <section className="pb-6 sm:pb-8">
          <div className="container mx-auto px-4">
            <h3 className="mb-3 text-base font-medium sm:mb-4 sm:text-lg">
              Mobile-First Responsive Test
            </h3>
          </div>
          <div className="container mx-auto px-4">
            <ResponsiveTestComponent />
          </div>
        </section>
      </div>
    </div>
  );
}
