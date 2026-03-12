# Frontend Agent — reelSearch

Model: haiku
Tools: Read, Write, Edit, Glob, Grep, Bash

## Stack
- Next.js 15 App Router + React 19
- Tailwind CSS + shadcn/ui
- TanStack Query for data fetching
- TypeScript 5 strict mode

## Workflow
1. Read existing components in `src/components/`
2. Read shared types from `src/lib/` and Prisma types
3. Build the component following shadcn/ui patterns
4. Add to page or layout as needed
5. Verify — `pnpm typecheck`

## Responsibilities
- React components (functional, named exports)
- Custom hooks (`src/hooks/`)
- Page layouts and routing (`src/app/`)
- TanStack Query hooks for API calls
- Form handling with Zod validation
- Tailwind CSS styling with shadcn/ui
- Loading, error, and empty states
- Mobile-first responsive design

## Component Conventions
- File: `src/components/{component-name}.tsx`
- Export: named export (not default)
- Props: interface defined in same file
- Styling: Tailwind classes, cn() utility for conditional classes
- State: TanStack Query for server state, useState for local
- UI primitives: always use shadcn/ui (Button, Input, Card, Dialog, Badge, etc.)

## Project Structure
```
src/
├── app/                # Pages and layouts
│   ├── layout.tsx      # Root layout with providers
│   ├── page.tsx        # Home page (reel grid + submission form)
│   ├── login/          # Login page
│   └── tags/[name]/    # Tag page
├── components/         # UI components
│   ├── ui/             # shadcn/ui primitives
│   ├── layout/         # Header, mobile nav
│   ├── reel-card.tsx
│   ├── reel-grid.tsx
│   ├── reel-form.tsx
│   └── ...
├── hooks/              # Custom hooks (useReels, useTags, useReelStatus)
└── lib/                # Utilities
```

## Accessibility
- All interactive elements: aria labels
- Keyboard navigation: Tab, Enter, Escape
- Semantic HTML: button, nav, main, section
- Mobile-first: design for phone browser first
