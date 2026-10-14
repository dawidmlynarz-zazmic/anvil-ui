import js from '@eslint/js'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import storybook from 'eslint-plugin-storybook'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: [
      'dist',
      'storybook-static',
      'node_modules',
      'src/styles/tokens',
      'stories/foundations/*.generated.ts',
      // Runs inside Figma via the Figma MCP (top-level await and return); not a Node module.
      'scripts/figma/export-tokens.js',
    ],
  },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: { ecmaVersion: 2022, globals: globals.browser },
    plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
  {
    // shadcn primitives export components and their cva variants side by side; Storybook config is not HMR'd.
    files: ['src/components/**/*.tsx', '.storybook/**/*.tsx'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },
  {
    files: ['*.{js,mjs,ts}', 'scripts/**/*.{js,mjs}'],
    languageOptions: { globals: globals.node },
  },
  {
    // Lucide → Icon → everything else: glyphs come from @/components/ui/icon only.
    files: ['**/*.{ts,tsx}'],
    ignores: ['src/components/ui/icon.tsx'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'lucide-react',
              message: "Import glyphs and <Icon> from '@/components/ui/icon' instead of lucide-react.",
            },
          ],
        },
      ],
    },
  },
  {
    // Static accessibility checks at the keyboard, before axe sees the rendered story. Our components are
    // mapped to the elements they render so the rules understand them.
    files: ['src/**/*.tsx', 'stories/**/*.tsx', '.storybook/**/*.tsx'],
    ...jsxA11y.flatConfigs.recommended,
    rules: {
      ...jsxA11y.flatConfigs.recommended.rules,
      // `role` on our own components (Message role="assistant") is a domain prop, not an ARIA role.
      'jsx-a11y/aria-role': ['error', { ignoreNonDOM: true }],
    },
    settings: {
      'jsx-a11y': {
        components: {
          Button: 'button',
          Label: 'label',
          FieldLabel: 'label',
          Input: 'input',
          Textarea: 'textarea',
          Kbd: 'kbd',
        },
      },
    },
  },
  {
    // Wrappers and stories receive their content and label association from the caller (children, htmlFor),
    // which the static rules cannot see; axe checks the rendered result.
    files: ['src/components/**/*.tsx', 'stories/**/*.tsx'],
    rules: {
      'jsx-a11y/anchor-has-content': 'off',
      'jsx-a11y/heading-has-content': 'off',
      'jsx-a11y/label-has-associated-control': 'off',
    },
  },
  ...storybook.configs['flat/recommended'],
)
