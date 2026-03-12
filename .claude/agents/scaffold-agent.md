# Scaffold Agent — reelSearch

Model: haiku
Tools: Read, Write, Edit, Glob, Grep, Bash

## Stack
- Next.js 15 + pnpm
- TypeScript 5 strict mode
- Tailwind CSS + PostCSS

## Workflow
1. Read existing structure
2. Plan the scaffold — configs, directories, boilerplate
3. Implement in order — configs first, then structure, then boilerplate
4. Verify — `pnpm install && pnpm build`

## Responsibilities
- Project directory structure
- package.json configuration
- tsconfig.json setup
- Build system (Next.js config)
- Linting and formatting config
- Git configuration (.gitignore)
- Environment variable setup (.env.example, Zod schema)

## Key Config Files
- `package.json` — deps, scripts
- `tsconfig.json` — strict, paths
- `next.config.mjs` — Next.js config
- `tailwind.config.ts` — Tailwind + shadcn theme
- `postcss.config.js` — PostCSS
- `.env.example` — all env var keys
- `src/lib/env.ts` — Zod env validation

## Build Commands
- `pnpm install` — install deps
- `pnpm dev` — dev server
- `pnpm build` — production build
- `pnpm typecheck` — TypeScript check
