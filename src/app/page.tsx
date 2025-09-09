import { ButtonDemo } from "@/app/Components/Button";
import TabsDemo from "./Components/TabButton";
import { AccordionDemo } from "@/app/Components/accordion";
import Sonner from "@/app/Components/sonner";
import { CardDemo } from "./Components/card_template";
import SearchInput from "./Components/search_box";
import MenubarDemo from "./Components/menu";
import { CarouselDemo } from "./Components/media_card";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <MenubarDemo />
      <br />
      <SearchInput />
      <br />

      <CarouselDemo />
      <br />

      <CardDemo />
      <br />
      <ButtonDemo />
      <br />
      <AccordionDemo />
      <br />

      <TabsDemo />
      <br />
      <Sonner />
      <br />
    </div>
  );
}
