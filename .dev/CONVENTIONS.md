# Coding Conventions
## Detected Stack
Next.js + TypeScript + Tailwind CSS
## Dev Tools
ESLint
## Guidelines
- Use strict TypeScript — avoid `any`, prefer `unknown` for untyped values
- Prefer function components with hooks
- Use named exports for components
- Co-locate component files (tsx, css, test)
- Use `@apply` in co-located CSS files with BEM naming
- Use `@reference` for Tailwind class resolution
- Use App Router patterns: layout.tsx, loading.tsx, error.tsx
- Fetch data in Server Components when possible