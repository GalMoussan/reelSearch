# Build Component

Input: Component name (e.g., ReelCard, TagFilterBar)

## Process

1. **Understand Requirements**
   Infer from component name or use provided description.

2. **Explore Existing Patterns**
   Read components in `src/components/` to understand:
   - shadcn/ui usage patterns
   - Tailwind styling conventions
   - Hook usage (TanStack Query, custom hooks)
   - Loading/error/empty state patterns

3. **Scaffold Component**
   Create `src/components/{component-name}.tsx`:
   ```tsx
   import { cn } from '@/lib/utils'

   interface {ComponentName}Props {
     // props
   }

   export function {ComponentName}({ ...props }: {ComponentName}Props) {
     return (
       // JSX
     )
   }
   ```

4. **Follow Conventions**
   - Named exports only
   - Props interface in same file
   - Mobile-first responsive (Tailwind breakpoints)
   - Use cn() for conditional classes
   - shadcn/ui primitives for all UI elements
   - Accessibility: aria labels, keyboard nav, semantic HTML

5. **Integration Notes**
   - Where to use this component
   - Required data fetching hooks
