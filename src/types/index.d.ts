// Global type declarations

// Image imports
declare module "*.png" {
  const content: import("next/image").StaticImageData;
  export default content;
}

declare module "*.jpg" {
  const content: import("next/image").StaticImageData;
  export default content;
}

declare module "*.jpeg" {
  const content: import("next/image").StaticImageData;
  export default content;
}

declare module "*.webp" {
  const content: import("next/image").StaticImageData;
  export default content;
}

declare module "*.gif" {
  const content: import("next/image").StaticImageData;
  export default content;
}

declare module "*.svg" {
  const content: import("next/image").StaticImageData;
  export default content;
}

// Slugify type declaration
declare module "slugify" {
  function slugify(
    text: string,
    options?: {
      replacement?: string;
      remove?: RegExp;
      lower?: boolean;
      strict?: boolean;
      locale?: string;
      trim?: boolean;
    }
  ): string;
  export default slugify;
}

export {};
