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

// Extend jest types for SpyInstance
declare module "@jest/globals" {
  namespace jest {
    interface SpyInstance<T = unknown, Y extends unknown[] = unknown[]> {
      (...args: Y): T;
      mockResolvedValue(value: T | Promise<T>): this;
      mockRejectedValue(value: unknown): this;
      mockRestore(): void;
    }
  }
}

export { };

