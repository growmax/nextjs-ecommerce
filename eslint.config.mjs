import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Base Next.js + TypeScript recommended rules
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    // Global rule overrides for this project.
    // Goal: keep linting useful (catch real issues) without blocking on legacy style noise.
    rules: {
      // --- Allow debug noise for now (no-console completely disabled) ---
      "no-console": "off",
      "no-debugger": "off", // Enable as "error" once codebase is cleaner

      // --- TypeScript: be permissive while refactoring ---
      "@typescript-eslint/no-explicit-any": "off", // Allow "any" for now; tighten gradually
      "@typescript-eslint/no-var-requires": "off", // Allow require() in legacy code

      // --- General style preferences (safe to ignore short-term) ---
      "prefer-const": "off",
      "no-var": "off",
      "object-shorthand": "off",
      "prefer-template": "off",

      // --- Correctness / quality signals (keep as warnings for now) ---
      "no-unused-vars": "off", // Use TS version instead
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],

      "react/jsx-key": "warn",
      "react-hooks/exhaustive-deps": "warn",

      // --- React / JSX rules relaxed (can improve later) ---
      "react/no-array-index-key": "off",
      "react/no-unescaped-entities": "off",

      // --- Accessibility rules (currently off to avoid noise) ---
      "jsx-a11y/alt-text": "off",
      "jsx-a11y/anchor-is-valid": "off",

      // --- Next.js specific rules ---
      "@next/next/no-html-link-for-pages": "warn",
      "@next/next/no-img-element": "off",
    },

    // Paths ESLint should ignore entirely
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      ".pnp.cjs",
      "coverage/**",
    ],
  },
];

export default eslintConfig;
