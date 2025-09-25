declare module "@tabler/icons-react" {
  import { ComponentType, SVGProps } from "react";

  export interface TablerIconProps extends SVGProps<SVGSVGElement> {
    size?: number | string;
    stroke?: number;
    color?: string;
  }

  // All icons used in the project
  export const IconChevronDown: ComponentType<TablerIconProps>;
  export const IconShoppingCart: ComponentType<TablerIconProps>;
  export const IconStar: ComponentType<TablerIconProps>;
}
