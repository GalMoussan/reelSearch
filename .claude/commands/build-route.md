# Build API Route

Input: Route path (e.g., /api/reels, /api/tags)

## Process

1. **Understand Requirements**
   - Resource name and HTTP methods needed
   - Request body schema (Zod)
   - Response format

2. **Explore Existing Patterns**
   Read routes in `src/app/api/` to understand:
   - Route handler patterns (GET, POST, PUT, DELETE)
   - Zod validation usage
   - Prisma query patterns
   - Error handling approach
   - Auth checks via getServerSession

3. **Scaffold Route**
   Create `src/app/api/{resource}/route.ts`:
   ```typescript
   import { NextRequest, NextResponse } from 'next/server'
   import { z } from 'zod'
   import { prisma } from '@/lib/prisma'
   import { getServerSession } from '@/lib/auth-utils'

   export async function GET(request: NextRequest) {
     // Implementation
   }
   ```

4. **Conventions**
   - Always validate with Zod
   - Always check auth with getServerSession
   - Return JSON: `{ data, error, meta }`
   - Use proper HTTP status codes
   - Handle errors with try/catch
