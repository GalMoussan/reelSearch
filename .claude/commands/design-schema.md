# Design Schema

Input: Schema name (e.g., ReelInput, SearchQuery)

## Process

1. **Understand Requirements**
   - What data this validates
   - Where it's used (API input, response, internal)

2. **Explore Existing Patterns**
   Read schemas in `src/lib/validators.ts` to match patterns.

3. **Design Schema**
   ```typescript
   import { z } from 'zod'

   export const {schemaName}Schema = z.object({
     // fields
   })

   export type {SchemaName} = z.infer<typeof {schemaName}Schema>
   ```

4. **Export**
   Add to `src/lib/validators.ts`

5. **Conventions**
   - Zod for all validation
   - Infer TypeScript types from Zod schemas
   - Name: `{name}Schema` for schema, `{Name}` for type
   - Validate at API boundaries
