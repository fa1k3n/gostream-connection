import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    rules: { 
      "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  { ignores: ["dist/*", "coverage/*"] },
  { 
    files: ["src/**/*.{ts}"],  
    plugins: { js }, 
    extends: ["js/recommended"],
  },
  { 
    files: ["src/**/*.{ts}"], 
    languageOptions: { globals: globals.browser } 
  },

  tseslint.configs.recommended,
]);
