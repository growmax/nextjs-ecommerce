"use client";

import { useSafeTranslation } from "@/hooks/use-safe-translation";
import { ButtonDemo } from "@/app/Components/Button";
import TabsDemo from "../Components/TabButton";
import { AccordionDemo } from "@/app/Components/accordion";
import Sonner from "@/app/Components/sonner";
import { CardDemo } from "../Components/card_template";
import SearchInput from "../Components/search_box";
import MenubarDemo from "../Components/menu";
import { CarouselDemo } from "../Components/media_card";

export default function Home() {
  const { t } = useSafeTranslation();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">
          {t("messages.welcome", "Welcome to our store")}
        </h1>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            {t("demo.components", "Component Demos")}
          </h2>
        </div>
      </div>

      <MenubarDemo />
      <br />

      <div className="container mx-auto px-4">
        <h3 className="text-lg font-medium mb-2">
          {t("demo.searchDemo", "Search Demo")}
        </h3>
      </div>
      <SearchInput />
      <br />

      <div className="container mx-auto px-4">
        <h3 className="text-lg font-medium mb-2">
          {t("demo.carouselDemo", "Carousel Demo")}
        </h3>
      </div>
      <CarouselDemo />
      <br />

      <div className="container mx-auto px-4">
        <h3 className="text-lg font-medium mb-2">
          {t("demo.cardDemo", "Card Demo")}
        </h3>
      </div>
      <CardDemo />
      <br />

      <div className="container mx-auto px-4">
        <h3 className="text-lg font-medium mb-2">
          {t("demo.buttonDemo", "Button Demo")}
        </h3>
      </div>
      <ButtonDemo />
      <br />

      <div className="container mx-auto px-4">
        <h3 className="text-lg font-medium mb-2">
          {t("demo.accordionDemo", "Accordion Demo")}
        </h3>
      </div>
      <AccordionDemo />
      <br />

      <div className="container mx-auto px-4">
        <h3 className="text-lg font-medium mb-2">
          {t("demo.tabsDemo", "Tabs Demo")}
        </h3>
      </div>
      <TabsDemo />
      <br />

      <div className="container mx-auto px-4">
        <h3 className="text-lg font-medium mb-2">
          {t("demo.notificationDemo", "Notification Demo")}
        </h3>
      </div>
      <Sonner />
      <br />
    </div>
  );
}
