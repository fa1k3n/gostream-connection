import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config([
  { ignores: ["dist/*", "coverage/*"] },
  { 
    files: ["src/**/*.{ts}"], 
    languageOptions: { globals: globals.browser } 
  },

  tseslint.configs.strict,
  tseslint.configs.stylistic,
    {
    rules: { 
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["error", { 
        "args": "all",
        "argsIgnorePattern": "^_",
        "caughtErrors": "all",
        "caughtErrorsIgnorePattern": "^_",
        "destructuredArrayIgnorePattern": "^_",
        "varsIgnorePattern": "^_",
        "ignoreRestSiblings": true
      }],
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
]);
