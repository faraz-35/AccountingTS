# CLAUDE.md - Next.js Production Starter Template

A comprehensive documentation for the production-ready Next.js starter template built with modern architecture principles and AI agent-first design.

## 🏗️ Project Architecture

### Core Philosophy
- **AI Agent-First**: Structure optimized for context engineering for AI agents to understand and modify
- **Feature-Centric**: Self-contained features with clear boundaries
- **Production Ready**: Built with scalability, maintainability, and performance in mind
- **Type Safety**: Full TypeScript integration throughout
- **Complete Context Containment**: Feature directories contain 100% of necessary code

### 🎯 Critical Architectural Principle: Adaptive Self-Containment

**This is the most important concept in our architecture:**

> **Proceed with self-containment UNTIL code duplication occurs, then move ONLY the duplicated portions to parent common directories.**

**The Self-Containment Rule:**
1. **Build features with complete self-containment initially**
2. **Identify actual code duplication as it naturally occurs**
3. **Extract ONLY duplicated code to parent common directories**
4. **Keep unique business logic within feature directories**

**No hard percentages or artificial rules** - architecture evolves naturally based on real duplication patterns.

### Architecture Benefits for AI Agent Development

**1. Complete Feature Self-Containment**
Every feature contains ALL its code:
- **All components** for that feature live in the feature directory
- **All hooks** for that feature live in the feature directory  
- **All actions** for that feature live in the feature directory
- **All types** for that feature live in the feature directory
- **All API routes** for that feature live in the feature directory
- **All constants** and **utils** for that feature live in the feature directory
- No need to navigate outside feature directories for feature-specific code
- Clear feature boundaries prevent cross-contamination

**2. Predictable Context Engineering**
AI agents can easily understand:
- Where to find feature-specific code (everything is in the feature directory)
- How to extend existing features (follow the same patterns within the feature)
- What patterns to follow for new features (look at existing features as complete examples)
- How APIs relate to their features (API code is in the same feature directory)

**3. Minimal Parent Directory Usage**
- **Root `app/(common)/`**: Contains ONLY truly shared utilities (UI primitives, global types, base configurations)
- **Feature `common/` directories**: Contain ONLY shared components within that specific feature
- **80/20 Rule**: 80% of code should be in specific feature directories, 20% in shared utilities
- **Parent directories are configuration-only**: Layout files, route groups, and minimal shared utilities

**4. Context Engineering Guarantee**
- When providing a feature directory to an AI agent, you're providing 100% of the necessary context
- No missing components, hooks, or logic that lives outside the feature
- No need for agents to "guess" or "assume" where code might be located
- Complete examples and patterns within each feature

**5. Hierarchical Common Directory Strategy**
- **Root `app/(common)/`**: Truly shared utilities (UI primitives, global types, base configurations)
- **Feature `app/feature/(common)/`**: Shared components within that specific feature (anti-duplication)
- **Shared components move UP only when actually duplicated across sub-features**

**6. Proxy Pattern Benefits**
- Feature APIs live in feature directories (`app/feature/api/`)
- Minimal proxy boilerplate in `app/api/feature/` (just import/export)
- Type-safe import/export maintains IDE support
- Zero runtime overhead
- Complete API logic remains in feature directory
- **Layout Proxy Pattern**: Root layout exports from `@/(common)/layout` to maintain architecture while respecting Next.js requirements

**7. Three-Tier Data Strategy**
- **Server Actions**: Feature-specific mutations (90% of cases) - live in feature `actions/`
- **Server Components**: Initial page loads and static content - live in feature
- **React Query**: Complex caching and shared data - feature hooks use shared utilities
- Clear decision guidelines for each approach

**8. Minimal Configuration**
- Works with native Next.js routing
- No custom middleware or rewrites
- Leverages existing Next.js patterns
- Reduces cognitive load for AI agents

### Directory Structure
**🎯 CRITICAL: No file or directory exists outside either `common` or a feature folder**

```
├── app/                           # Next.js App Router
│   ├── (common)/                  # TRULY shared utilities ONLY (20% of code) 
│   │   ├── components/ui/         # Reusable UI primitives (Button, Input, etc.)
│   │   ├── components/icons/      # Icon components
│   │   ├── hooks/                 # GLOBAL custom hooks ONLY (useZodForm, etc.)
│   │   ├── lib/                   # Third-party library configurations
│   │   ├── store/                 # Zustand state management
│   │   ├── styles/                # Global styles and theme
│   │   ├── utils/                 # UNIVERSAL utility functions ONLY
│   │   ├── types/                 # SHARED TypeScript types ONLY
│   │   │   ├── database.ts        # Database type definitions
│   │   │   └── global.ts          # Global shared types
│   │   └── layout.tsx             # Root layout implementation (exported to app/layout.tsx)
│   │   
│   ├── auth/                      # Multi-page authentication feature
│   │   ├── (common)/              # Shared components ONLY when duplicated across login/register
│   │   │   ├── components/        # Shared auth components
│   │   │   └── layout.tsx         # Auth feature layout
│   │   ├── login/                 # Login sub-feature (unique business logic)
│   │   │   ├── page.tsx           # /auth/login
│   │   │   └── components/        # Login-specific components
│   │   └── register/              # Register sub-feature
│   │       ├── page.tsx           # /auth/register
│   │       └── components/        # Register-specific components
│   │       
│   ├── dashboard/                 # Feature with nested sub-features -> NEEDS (root)
│   │   ├── (common)/              # Shared components WITHIN dashboard only
│   │   ├── (root)/                # Main dashboard view (isolated from container)
│   │   │   ├── page.tsx           # /dashboard (main page)
│   │   │   ├── components/        # Components specific to the main dashboard view
│   │   │   └── api/               # API specific to the main dashboard view
│   │   └── settings/              # Settings sub-feature
│   │       ├── page.tsx           # /dashboard/settings
│   │       └── components/        # Settings-specific components
│   │       
│   ├── simple-feature/            # Single-page feature -> NO (root) needed
│   │   ├── page.tsx               # /simple-feature
│   │   ├── components/            # Feature components
│   │   └── api/                   # Feature API
│   │       
│   └── api/                       # API proxy routes (MINIMAL - just import/export)
│       ├── auth/
│       │   └── route.ts           // export * from '@/auth/api/route'
│       └── dashboard/
│           └── route.ts           // export * from '@/dashboard/(root)/api/route'
│           
├── layout.tsx                     # Root layout proxy (exports from @/(common)/layout)
└── public/                        # Static assets
```

### 🎯 Adaptive Self-Containment Rules

**1. The `(root)` Directory Pattern**
- **Use `(root)` ONLY when a feature has nested sub-features** (e.g., `dashboard/settings`).
- **Why?** It separates the "main view" logic from the "feature container" logic.
- **If a feature is single-page**, put `page.tsx` directly in the feature folder.

**2. Build with Self-Containment First**
- Start each feature completely self-contained
- Keep all business logic within feature directories
- Don't pre-emptively create shared components

**3. Extract Only When Duplication Occurs**
- Move ACTUALLY duplicated code to `feature/(common)/` directories
- Keep unique business logic within sub-feature directories


### 🎯 Real-World Examples

**Extracted to `app/auth/(common)/`:**
- `AuthFormField`: Used by login, register, forgot password
- `SocialLoginButtons`: Used by login and register
- `useAuthForm`: Shared form state management pattern
- `isValidEmail`: Common validation utility

**Kept in Feature Directories:**
- `loginAction`: Login-specific authentication logic
- `useLogin`: Login-specific business logic hooks
- `LOGIN_REDIRECTS`: Login-specific configuration
- Remember me functionality: Login-specific feature

## 🧪 Testing Strategy for AI Agents

### 🚨 AI Agent Testing Detection Protocol

**Critical Rule**: AI agents must identify and flag complex business logic that requires unit testing. When a file or function is complex, business logic impact.


### 🛠️ Testing Configuration & Conventions

#### **Testing Setup**
```bash
# Install testing dependencies
pnpm add -D vitest @testing-library/react @testing-library/jest-dom jsdom
pnpm add -D @supabase/supabase-js @vitest/coverage-v8
```

#### **Test File Location Convention**
```
app/
├── (common)/
│   ├── lib/
│   │   ├── safe-action.ts
│   │   └── safe-action.test.ts      # Test alongside source file
├── auth/
│   ├── actions/
│   │   ├── login.ts
│   │   └── login.test.ts            # Feature actions tests
│   ├── hooks/
│   │   ├── use-auth.tsx
│   │   └── use-auth.test.tsx        # Hook tests
│   └── utils/
│       ├── email-validator.ts
│       └── email-validator.test.ts  # Utility tests
```

#### **Test File Naming Convention**
- **Source**: `my-function.ts` → **Test**: `my-function.test.ts`
- **Source**: `use-my-hook.tsx` → **Test**: `use-my-hook.test.tsx`
- **Source**: `MyComponent.tsx` → **Test**: `MyComponent.test.tsx`

#### **Testing Patterns**

**1. Server Actions Testing Pattern**:
```typescript
// app/feature/actions/complex-action.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { complexAction } from './complex-action'

describe('complexAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should handle success scenario', async () => {
    // Mock supabase, external APIs, etc.
    const result = await complexAction(validData, mockContext)
    expect(result).toEqual(expectedResult)
  })

  it('should handle edge cases', async () => {
    // Test error scenarios, edge cases
  })
})
```


#### **AI Agent Testing Checklist**

**Before Writing Tests**:
1. ✅ Identify the function complexity (lines, async ops, branches)
2. ✅ Determine business impact (financial, user data, integrations)
3. ✅ Mock all external dependencies (Supabase, APIs, services)
4. ✅ Define test scenarios (success, error, edge cases)

**Test Coverage Requirements**:
- **Happy Path**: Normal operation success
- **Error Paths**: All error handling branches
- **Edge Cases**: Boundary conditions, empty data, invalid inputs
- **Integration Points**: External API failures, database errors
- **Business Logic**: Complex calculations, validations, permissions

**After Writing Tests**:
1. ✅ Tests should be readable and self-documenting
2. ✅ Mocks should be realistic and consistent
3. ✅ Test file should be located next to source file
4. ✅ Update CLAUDE.md if new testing patterns emerge

#### **Configuration Files**

**vitest.config.ts**:
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./app/(common)/lib/test-setup.ts'],
    coverage: {
      reporter: ['text', 'html'],
      exclude: [
        'node_modules/',
        '.next/',
        '**/*.d.ts',
        '**/*.config.*',
        'app/(common)/lib/test-setup.ts'
      ]
    }
  },
  resolve: {
    alias: {
      '@/(common)': path.resolve(__dirname, './app/(common)'),
      '@/': path.resolve(__dirname, './app/')
    }
  }
})
```

**Test Setup**:
```typescript
// app/(common)/lib/test-setup.ts
import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/',
}))

// Mock Supabase
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
    })),
    auth: {
      getUser: vi.fn()
    }
  }))
}))
```

### 🎯 AI Agent Testing Workflow

1. **Identify**: Scan code for complexity triggers
2. **Flag**: Alert user with specific reasoning
3. **Propose**: Suggest test file location and scenarios
4. **Create**: Write tests following established patterns
5. **Verify**: Ensure tests provide meaningful coverage

This approach ensures critical business logic is properly tested while avoiding over-testing simple components and utilities.

## 🚨 Error Handling Standards

### **Critical Rule**: Never lose error context. Always wrap errors, don't replace them.

#### **Error Structure**
```typescript
// All errors must follow this structure:
{
  code: 'ERROR_TYPE',           // Machine-readable code
  message: 'Human readable',    // User-friendly message
  details: {},                  // Additional context
  timestamp: 'ISO string',      // When error occurred
  requestId: 'uuid',           // For tracing
  retryable: boolean           // Can user retry?
}
```

#### **Error Types**
- **NetworkError**: API failures, timeouts (retryable)
- **ValidationError**: Form validation (inline display)
- **AuthorizationError**: Auth failures (modal + redirect)
- **BusinessLogicError**: Domain violations (modal)
- **DatabaseError**: Constraint violations (modal)
- **ExternalServiceError**: Third-party APIs (retryable)
- **SystemError**: Unexpected errors (modal)

#### **Try/Catch Patterns**
```typescript
// ❌ WRONG: Loses error context
try {
  await someOperation()
} catch (error) {
  throw new Error('Something went wrong') // ❌ Lost original error!
}

// ✅ RIGHT: Preserve and enhance context
try {
  await someOperation()
} catch (error) {
  if (error instanceof AppError) {
    throw error // Already structured
  } else {
    throw new SystemError('OPERATION_FAILED', error.message, {
      originalError: error,
      context: { action: 'someOperation' }
    })
  }
}
```

#### **Layered Error Handling**
1. **Server Actions**: Convert raw errors to structured errors
2. **React Query**: Route to global error handler
3. **Components**: Minimal catching, let error manager handle display

#### **Error Display Routing**
- **Validation Errors**: Inline form fields
- **Auth Errors**: Modal + redirect to login
- **Network Errors**: Toast + retry option
- **Critical Errors**: Modal with recovery actions

**Full documentation**: See `docs/error-conventions.md` for complete error handling patterns.

## 🛠️ Technology Stack

### Core Technologies
- **Next.js 16**: React framework with App Router
- **React 19**: UI library with latest features
- **TypeScript**: Strict type safety throughout
- **Tailwind CSS v4**: Modern utility-first CSS framework

### Backend & Database
- **Supabase**: Authentication, database, Storage and real-time features
- **Supabase CLI**: Database management and migrations

### State Management & Forms
- **Zustand**: Lightweight, performant state management
- **TanStack Query (React Query)**: Server-state fetching, caching, background updates and mutation management for robust client-server sync
- **React Hook Form**: Optimized form handling
- **Zod**: TypeScript-first schema validation
- **Safe Action Client**: Type-safe server actions

### UI & Styling
- **Radix UI**: Accessible component primitives
- **Lucide React**: Modern icon library
- **Tailwind CSS v4**: CSS-based configuration
- **Class Variance Authority**: Variant-based component styling

### Development Tools
- **ESLint**: Code quality and consistency
- **TypeScript**: Static type checking
- **PostCSS**: CSS processing

## 📁 Actions vs Hooks

- actions/ should expose server actions implemented and invoked via the Safe Action Client (type-safe, validated server calls).
- hooks/ should contain the feature's React Query (TanStack Query) logic — queries and mutations (e.g. useFeatureQuery, useCreateFeatureMutation) — and wrap or compose shared hooks as needed to provide a consistent client-side API for data fetching, caching, and optimistic updates.


## 🎨 Styling & UI System

### Tailwind CSS v4 Configuration
Theme configuration is in `app/(common)/styles/globals.css`:

```css
@import "tailwindcss";

@theme {
  --color-primary: #3b82f6;
  --color-secondary: #64748b;
  /* Custom theme variables */
}

@layer base {
  /* Global base styles */
}
```

### Component Library
All UI components are in `app/(common)/components/ui/`:
- Consistent design system
- Full TypeScript support
- Accessibility first (Radix UI)
- Dark mode support

### Custom Hooks
Common hooks in `app/(common)/hooks/`:
- `useZodForm`: Form handling with React Hook Form + Zod
- `useAuth`: Authentication state management
- Additional utility hooks

## 🔄 State Management

### Zustand Stores
Global state is managed with Zustand in `app/(common)/store/`:



### Server State
- Server Actions with enhanced `safe-action-client`
- Type-safe error handling with `authActionClient`
- Automatic validation with Zod schemas
- React Query for client-side data fetching and caching

## 📝 Forms & Validation

### Form Handling Pattern
Use the `useZodForm` hook for consistent form handling:

```typescript
import { useZodForm } from '@/(common)/hooks/use-zod-form'
import { mySchema } from '@/(common)/lib/schemas'

const form = useZodForm(mySchema, defaultValues)
```

### Validation Schemas
All validation schemas are in `app/(common)/lib/schemas.ts` using Zod:

```typescript
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})
```

### Server Actions

Enhanced safe actions with authentication support in feature `actions/` directories:

#### Public Actions
```typescript
import { publicAction } from '@/(common)/lib/safe-action'

export const publicAction = publicAction(mySchema, async (data) => {
  // Public server-side logic with automatic validation
})
```

#### Authenticated Actions
```typescript
import { authAction } from '@/(common)/lib/safe-action'

export const authenticatedAction = authAction(mySchema, async (data, ctx) => {
  const { supabase, authUser } = ctx
  // Authenticated server-side logic - user is guaranteed to be logged in
  // authUser contains the authenticated user object
  // supabase is a server client with the user's session
})
```

#### Action Usage Pattern
- **`publicAction`**: For operations that don't require authentication
- **`authAction`**: For operations that must be executed by logged-in users
- **`action`**: Base safe action client for custom authentication logic

## 📊 Data Fetching Patterns

### Data Fetching Strategy

We use a three-tier approach optimized for different use cases while maintaining feature self-containment:

#### **1. Server Actions (Primary)**
- **When to use**: Feature-specific data mutations, form submissions, user interactions
- **How**: `authAction` and `publicAction` in feature `actions/` directories
- **Benefits**: Type-safe, automatic validation, minimal client code, works with our architecture

```typescript
// In feature actions directory
// app/user-management/actions/create-user.ts
export const createUser = authAction(userSchemas.create, async (data, ctx) => {
  const { supabase, authUser } = ctx
  
  const { error } = await supabase
    .from('users')
    .insert({ ...data, organization_id: authUser.organization_id })
    
  if (error) throw new Error(error.message)
  
  return { success: true }
})

// In component
import { useAction } from 'next-safe-action/hooks'
import { createUser } from '@/user-management/actions/create-user'

export function CreateUserForm() {
  const create = useAction(createUser, {
    onSuccess: () => {
      // Invalidate related queries if needed
      queryClient.invalidateQueries({ queryKey: [QueryKeys.USERS] })
    }
  })
}
```

#### **2. Server Components (Initial Load)**
- **When to use**: Page initial loads, static data, SEO-critical content
- **How**: Direct Supabase calls in Server Components
- **Benefits**: No client-side JavaScript, faster initial paint, SEO friendly

```typescript
// In a Server Component
import { createSupabaseServerClient } from '@/(common)/lib/supabase-server'

export default async function DashboardPage() {
  const supabase = createSupabaseServerClient()
  const { data: user } = await supabase.from('profiles').select('*').single()
  
  return <DashboardComponent user={user} />
}
```

#### **3. React Query (Client-Side)**
- **When to use**: Real-time data, complex caching, external API calls, shared data
- **How**: `useQuery` hooks with authenticated query wrappers
- **Benefits**: Automatic caching, background refetching, optimistic updates

```typescript
// In a Client Component
import { useQuery } from '@tanstack/react-query'
import { authQuery } from '@/(common)/hooks/auth-query'
import { QueryKeys } from '@/(common)/lib/query-keys'

export function useProfile() {
  return useQuery({
    queryKey: [QueryKeys.PROFILE],
    queryFn: authQuery(async ({ supabase }) => {
      const { data, error } = await supabase.from('profiles').select('*')
      if (error) throw new Error(error.message)
      return data
    }),
  })
}
```

#### **Decision Guidelines**

**Use Server Actions when**:
- Feature-specific data mutations
- Form submissions and user inputs
- Internal business logic
- Direct user interactions
- When the operation is closely tied to a feature

**Use Server Components when**:
- Initial page loads
- Static or infrequently changing data
- SEO-critical content
- When data doesn't need client-side interactivity

**Use React Query when**:
- Real-time data updates needed
- Complex caching requirements
- External API integration
- Data shared across multiple features
- Background synchronization needed

### Query Keys and Cache Management

#### **Query Keys Pattern**
Use centralized enum for consistent cache management:

```typescript
// app/(common)/lib/query-keys.ts
export enum QueryKeys {
  // User-related
  PROFILE = 'profile',
  USER_PREFERENCES = 'user-preferences',
  
  // Dashboard
  DASHBOARD_STATS = 'dashboard-stats',
  ANALYTICS = 'analytics',
  
  // Feature-specific
  ITEMS = 'items',
  ITEM_DETAIL = 'item-detail',
}
```

#### **Key Construction**
- **Simple queries**: `[QueryKeys.PROFILE]`
- **Parameterized**: `[QueryKeys.ITEM_DETAIL, itemId]`
- **Complex filters**: `[QueryKeys.ITEMS, { category, status }]`

#### **Cache Invalidation**
```typescript
// In mutations
queryClient.invalidateQueries({ queryKey: [QueryKeys.ITEMS] })

// Precise invalidation
queryClient.invalidateQueries({ 
  queryKey: [QueryKeys.ITEM_DETAIL, itemId] 
})
```

### Authenticated Query Hooks

#### **authQuery Wrapper**
Centralizes authentication and validation for client-side queries:

```typescript
// app/(common)/hooks/auth-query.ts
export function authQuery<TParams, TResult>(
  queryFn: (params: { supabase: SupabaseClient; user: User; params: TParams }) => Promise<TResult>,
  options?: {
    paramsSchema?: z.ZodSchema<TParams>
    requiredRole?: string
  }
) {
  return async (params: TParams) => {
    const supabase = createSupabaseClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      throw new Error('Unauthorized')
    }
    
    // Optional role check
    if (options?.requiredRole && user.user_metadata.role !== options.requiredRole) {
      throw new Error('Insufficient permissions')
    }
    
    // Optional input validation
    if (options?.paramsSchema) {
      const validatedParams = options.paramsSchema.parse(params)
      return queryFn({ supabase, user, params: validatedParams })
    }
    
    return queryFn({ supabase, user, params })
  }
}
```

### Data Mutations

#### **Server Actions vs React Query**
- **Server Actions**: Database writes, form submissions, file uploads
- **React Query Mutations**: Complex operations, external API calls

#### **Server Action Pattern**
```typescript
// In actions directory
export const updateProfile = authAction(profileUpdateSchema, async (data, ctx) => {
  const { supabase, authUser } = ctx
  
  const { error } = await supabase
    .from('profiles')
    .update(data)
    .eq('id', authUser.id)
    
  if (error) throw new Error(error.message)
  
  return { success: true }
})
```

#### **Client-Side Usage**
```typescript
// In component
import { useAction } from 'next-safe-action/hooks'
import { updateProfile } from './actions/update-profile'

export function ProfileForm() {
  const updateProfileAction = useAction(updateProfile, {
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: [QueryKeys.PROFILE] })
      toast.success('Profile updated successfully')
    },
    onError: (error) => {
      toast.error(error.message)
    }
  })
  
  return (
    <form onSubmit={form.handleSubmit(updateProfileAction.execute)}>
      {/* Form fields */}
    </form>
  )
}
```

## 🔐 Authentication

### Supabase Integration
- Client and server-side Supabase configurations
- Session management with Next.js middleware
- Protected routes handling

### Auth Feature Structure
`app/auth/` contains complete authentication system:
- Login/Register forms
- Session management hooks
- Server Actions for auth operations
- Type-safe user management

## 🎯 Development Guidelines

### Adding New Features

1. **Determine Feature Type**:
   - Single page → Create `app/feature_name/`
   - Multiple related pages → Create `app/combined_feature/`

2. **Follow Structure**:
   - Use established directory patterns
   - Include all necessary subdirectories
   - Keep features self-contained

3. **Use Shared Utilities**:
   - Import from `@/(common)/components/ui` for UI components
   - Import from `@/(common)/utils` for utility functions
   - Import from `@/(common)/hooks` for shared hooks

### Code Organization Principles

1. **Feature Boundaries**:
   - Keep feature-specific code within feature directory
   - Use shared utilities for cross-feature functionality
   - Maintain clear import/export boundaries

2. **Type Safety**:
   - Define types in feature `types/` directories
   - Use shared types from `types/` directory
   - Maintain strict TypeScript configuration

3. **Component Design**:
   - Build reusable components in `app/(common)/components/ui/`
   - Feature-specific components in feature directories
   - Follow consistent naming conventions

### Import Path Guidelines

```typescript
// UI Components
import { Button, Input } from '@/(common)/components/ui'

// Feature Components
import { LoginForm } from './components/login-form'

// Shared Hooks
import { useZodForm } from '@/(common)/hooks/use-zod-form'

// Feature Hooks
import { useAuth } from '@/auth/hooks/use-auth'

// Utilities
import { formatDate } from '@/(common)/utils/helpers'

// Types
import type { User } from '@/types/database'
```

### 🚨 Global Paths Convention

**Critical Rule**: Never hardcode paths anywhere in the codebase. Always use the global `paths` object.

#### **Why This Matters**
- **Type Safety**: Prevents typos and provides autocomplete
- **Maintainability**: Single source of truth when routes change
- **Refactoring Safety**: Routes update in one place only
- **Nested Route Clarity**: Hierarchy is explicitly shown (e.g., `paths.dashboard.settings`)

#### **Implementation**

```typescript
// app/(common)/lib/paths.ts
export const paths = {
  home: '/',
  auth: {
    login: '/auth/login',
    register: '/auth/register',
  },
  dashboard: {
    root: '/dashboard',
    settings: '/dashboard/settings',
  },
  api: {
    auth: '/api/auth',
    dashboard: '/api/dashboard',
  },
} as const
```

#### **Usage Patterns**

```typescript
// Import paths
import { paths } from '@/(common)/lib/paths'

// In components
<Link href={paths.dashboard.root}>Dashboard</Link>
<Link href={paths.auth.login}>Login</Link>
<Link href={paths.dashboard.settings}>Settings</Link>

// In redirects
router.push(paths.dashboard.settings)
window.location.href = paths.auth.login

// In API calls
fetch(paths.api.dashboard, { method: 'POST' })
```

#### **Rules**
1. **No hardcoded strings**: Never use `"/dashboard"` directly
2. **Import paths**: Always `import { paths } from '@/(common)/lib/paths'`
3. **Type safety**: The `as const` assertion provides complete TypeScript inference
4. **Consistency**: Follow nested object structure matching your app directory

## 🚀 Getting Started

### Environment Setup

1. **Install Dependencies**:
   ```bash
   pnpm install
   ```

2. **Environment Variables**:
   ```bash
   cp .env.local.example .env.local
   # Add your Supabase credentials
   ```

3. **Database Setup**:
   ```bash
   npm run db:push
   npm run db:generate-types
   ```

4. **Development Server**:
   ```bash
   npm run dev
   ```

### Available Scripts

- `pnpm dev`: Start development server
- `pnpm build`: Build for production
- `pnpm start`: Start production server
- `pnpm lint`: Run ESLint
- `pnpm type-check`: TypeScript type checking
- `pnpm test`: Run unit tests (vitest)
- `pnpm test:watch`: Run tests in watch mode
- `pnpm test:coverage`: Run tests with coverage report
- `pnpm db:push`: Push database changes
- `pnpm db:diff`: Show database differences
- `pnpm db:reset`: Reset database
- `pnpm db:generate-types`: Generate TypeScript types

## 🌐 API & Data Patterns

### Custom API Routes

Custom API routes are used for:
- External service integrations
- Third-party webhooks
- File processing
- Complex business logic that requires HTTP endpoints

**Primary Approach**: Use Server Actions for feature-specific operations and limit API routes to shared/external concerns.

### Layout Proxy Pattern

The root layout follows the same export/import pattern as API routes to maintain architecture integrity:

```typescript
// app/layout.tsx (Next.js requirement - minimal proxy)
export { default } from '@/(common)/layout'

// app/(common)/layout.tsx (all real layout logic)
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/(common)/styles/globals.css";

const geistSans = Geist({...});
const geistMono = Geist_Mono({...});

export const metadata: Metadata = {...};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
```

This pattern maintains your architecture principle while respecting Next.js requirements:
- **Single Exception**: Only `app/layout.tsx` exists outside the structure, but it's just a proxy
- **Real Logic in Common**: All meaningful layout logic lives in `app/(common)/layout.tsx`
- **Server Component Benefits**: Full Next.js layout capabilities (metadata, fonts, etc.)



### Real-Time Data Patterns

#### **Supabase Real-time Subscriptions**
For features requiring real-time updates:

```typescript
// app/[common/feature]/hooks/use-realtime-subscription.ts
export function useRealtimeSubscription<T>(
  table: string,
  filter?: { column: string; value: any },
  callback: (payload: T) => void
) {
  const { data: { user } } = useAuth()
  const supabase = createSupabaseClient()

  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel(`${table}-changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          filter: filter ? `${filter.column}=eq.${filter.value}` : undefined
        },
        (payload) => callback(payload.new as T)
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, table, filter])

  return supabase
}
```

#### **Usage Pattern**
```typescript
// In a feature component
export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([])
  const { data: initialTasks } = useTasks()

  // Real-time updates
  useRealtimeSubscription('tasks', 
    { column: 'project_id', value: projectId },
    (newTask) => {
      setTasks(prev => prev.map(task => 
        task.id === newTask.id ? newTask : task
      ))
    }
  )

  return <TaskListItems tasks={tasks} />
}
```

### Data Validation & Type Safety

#### **Input Validation Layers**
1. **Zod Schemas**: Runtime validation and TypeScript inference
2. **Database Constraints**: Column types, foreign keys, check constraints
3. **RLS Policies**: Row-level security validation
4. **API Validation**: Request/response validation

#### **Schema Organization**
```typescript
// app/(common)/lib/schemas/
export const userSchemas = {
  create: z.object({
    email: z.string().email(),
    first_name: z.string().min(1),
    last_name: z.string().min(1),
    role: z.enum(['user', 'admin']).default('user'),
  }),
  
  update: z.object({
    first_name: z.string().min(1).optional(),
    last_name: z.string().min(1).optional(),
    avatar_url: z.string().url().optional().nullable(),
  }),
  
  bulkUpdate: z.object({
    user_ids: z.array(z.string().uuid()),
    updates: z.object({
      role: z.enum(['user', 'admin']).optional(),
      status: z.enum(['active', 'inactive']).optional(),
    }),
  }),
}

// Type inference
export type CreateUserInput = z.infer<typeof userSchemas.create>
export type UpdateUserInput = z.infer<typeof userSchemas.update>
export type BulkUpdateUsersInput = z.infer<typeof userSchemas.bulkUpdate>
```

### Caching Strategies

#### **Multi-Level Caching**
1. **React Query**: Client-side query caching
2. **Supabase Edge Caching**: CDN-level caching
3. **Database Indexing**: Query optimization
4. **Application Cache**: Redis for complex computations

#### **Cache Key Strategy**
```typescript
// app/(common)/lib/cache-keys.ts
export const CacheKeys = {
  // User-specific cache (never shared)
  user: (userId: string) => `user:${userId}`,
  userProfile: (userId: string) => `user:${userId}:profile`,
  
  // Organization cache (shared within org)
  orgMembers: (orgId: string) => `org:${orgId}:members`,
  orgSettings: (orgId: string) => `org:${orgId}:settings`,
  
  // Public cache (shared globally)
  systemSettings: 'system:settings',
  featureFlags: 'system:feature-flags',
} as const
```

## 🎨 UI/UX Standards

### Design System Principles

#### **Component Hierarchy**
```typescript
// app/(common)/components/ui/
// 1. Primitive Components (lowest level)
export { Button } from './button'          // Interactive elements
export { Input } from './input'            // Form inputs
export { Card } from './card'              // Layout containers
export { Badge } from './badge'            // Status indicators
export { Avatar } from './avatar'          // User representations

// 2. Composite Components (built from primitives)
export { DataTable } from './data-table'   // Data display
export { FormField } from './form-field'   // Form structure
export { Navigation } from './navigation'   // Navigation patterns
export { Modal } from './modal'            // Overlay patterns

// 3. Feature Components (business logic)
export { UserProfile } from './user-profile'
export { TaskBoard } from './task-board'
export { ChartContainer } from './chart-container'
```

#### **Component Design Guidelines**

**1. Accessibility First**
- Use semantic HTML elements
- Implement ARIA attributes correctly
- Ensure keyboard navigation
- Test with screen readers

**2. Responsive Design**
- Mobile-first approach
- Consistent breakpoint usage:
  ```typescript
  const breakpoints = {
    sm: '640px',    // Mobile landscape
    md: '768px',    // Tablet
    lg: '1024px',   // Desktop
    xl: '1280px',   // Large desktop
  }
  ```

**3. Consistent Spacing**
- Use Tailwind's spacing scale consistently
- Maintain visual rhythm (8px grid)
- Avoid magic numbers

### Visual Design Standards

#### **Color System**
```css
/* app/(common)/styles/globals.css */
@theme {
  /* Primary brand colors */
  --color-primary-50: #eff6ff;
  --color-primary-500: #3b82f6;
  --color-primary-900: #1e3a8a;
  
  /* Semantic colors */
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-info: #06b6d4;
}
```

#### **Typography Scale**
```css
@theme {
  /* Font sizes */
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;    /* 24px */
  --text-3xl: 1.875rem;  /* 30px */
  --text-4xl: 2.25rem;   /* 36px */
}
```

#### **Component Variants**
```typescript
// app/(common)/components/ui/button.tsx
const buttonVariants = cva(
  // Base styles
  "inline-flex items-center justify-center rounded-md text-sm font-medium",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        default: "h-10 px-4 py-2",
        lg: "h-11 px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
```

### State & Loading Patterns

#### **Loading States**
```typescript
// 1. Skeleton screens for content loading
export function PostSkeleton() {
  return (
    <div className="space-y-3">
      <div className="skeleton h-4 w-[250px]" />
      <div className="skeleton h-4 w-[200px]" />
      <div className="skeleton h-4 w-[300px]" />
    </div>
  )
}

// 2. Spinners for actions
export function LoadingSpinner({ size = 'sm' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8',
  }
  
  return (
    <div className={`animate-spin ${sizeClasses[size]}`}>
      <SpinnerIcon />
    </div>
  )
}

// 3. Progress bars for uploads/processing
export function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="w-full bg-secondary rounded-full h-2">
      <div 
        className="bg-primary h-2 rounded-full transition-all duration-300"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
```

#### **Error States**
```typescript
// app/(common)/components/ui/error-boundary.tsx
export function ErrorBoundary({
  children,
  fallback,
}: {
  children: React.ReactNode
  fallback?: (error: Error, reset: () => void) => React.ReactNode
}) {
  return (
    <ErrorBoundaryComponent
      fallback={({ error, reset }) => 
        fallback ? fallback(error, reset) : (
          <div className="flex flex-col items-center justify-center p-8">
            <h2 className="text-lg font-semibold mb-2">Something went wrong</h2>
            <p className="text-muted-foreground mb-4">{error.message}</p>
            <Button onClick={reset}>Try again</Button>
          </div>
        )
      }
    >
      {children}
    </ErrorBoundaryComponent>
  )
}
```

### Animation & Transitions

#### **Motion Guidelines**
- **Purposeful animations**: Only animate to draw attention or show state changes
- **Performance**: Use CSS transforms and opacity for smooth animations
- **Accessibility**: Respect `prefers-reduced-motion`

#### **Animation Utilities**
```css
/* app/(common)/styles/globals.css */
@layer utilities {
  .fade-in {
    animation: fadeIn 0.2s ease-in-out;
  }
  
  .slide-up {
    animation: slideUp 0.3s ease-out;
  }
  
  .scale-in {
    animation: scaleIn 0.2s ease-out;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideUp {
    from { 
      opacity: 0;
      transform: translateY(10px);
    }
    to { 
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes scaleIn {
    from { 
      opacity: 0;
      transform: scale(0.95);
    }
    to { 
      opacity: 1;
      transform: scale(1);
    }
  }
}
```

## 🗄️ Database & Schema Management

### Schema Design Principles


### Row Level Security (RLS)

#### **RLS Policy Patterns**
```sql
-- Enable RLS on the table
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- 1. User can see their own posts
CREATE POLICY "Users can view own posts" ON posts
  FOR SELECT USING (auth.uid() = user_id);

-- 2. User can insert their own posts
CREATE POLICY "Users can insert own posts" ON posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 3. User can update their own posts
CREATE POLICY "Users can update own posts" ON posts
  FOR UPDATE USING (auth.uid() = user_id);

-- 4. User can delete their own posts
CREATE POLICY "Users can delete own posts" ON posts
  FOR DELETE USING (auth.uid() = user_id);

-- 5. Admins can do anything (role-based)
CREATE POLICY "Admins full access" ON posts
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin'
  );
```

#### **Complex RLS with Functions**
```sql
-- Helper function for organization-based access
CREATE OR REPLACE FUNCTION user_has_organization_access(org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM organization_members 
    WHERE organization_id = org_id 
    AND user_id = auth.uid()
    AND deleted_at IS NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Use in policies
CREATE POLICY "Organization access" ON projects
  FOR ALL USING (
    user_has_organization_access(organization_id)
  );
```

### Migration Strategy

#### **Migration File Organization**
```sql
-- migrations/001_initial_schema.sql
-- migrations/002_add_user_profiles.sql  
-- migrations/003_add_audit_logs.sql
-- migrations/004_add_soft_deletes.sql
```

#### **Migration Pattern**
```sql
-- Each migration includes up and down migrations
-- Example: 003_add_audit_logs.sql

-- Up migration
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create trigger function
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (table_name, record_id, action, old_values, new_values, user_id)
  VALUES (
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END,
    auth.uid()
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Down migration
DROP TRIGGER IF EXISTS audit_trigger ON users;
DROP TRIGGER IF EXISTS audit_trigger ON posts;
DROP FUNCTION IF EXISTS audit_trigger();
DROP TABLE IF EXISTS audit_logs;
```

### Database Performance
- Create indexes on columns used in WHERE clauses
- Create indexes on columns used in JOIN clauses
- Create indexes on columns used in ORDER BY clauses
- Create indexes on columns used in GROUP BY clauses

- Use RPC functions and views where relevant

```

```

## 🔧 Configuration Files

### TypeScript Configuration
Strict TypeScript setup with path aliases in `tsconfig.json`.

### Tailwind CSS v4
CSS-based configuration in `app/(common)/styles/globals.css`.

### ESLint
Customized rules for consistent code quality.

### Supabase
Database and authentication configuration via environment variables.

## 📊 Performance Considerations

### Bundle Optimization
- Code splitting by feature
- Dynamic imports where appropriate
- Minimal dependencies

### Database Performance
- Optimized queries with Supabase
- Proper indexing strategies
- Connection pooling

### Rendering Performance
- Server Components for static content
- Client Components for interactivity
- Proper state management to avoid re-renders

## 🔒 Security

### Authentication
- Secure session management
- Protected routes implementation
- CSRF protection

### Data Validation
- Server-side validation with Zod
- Input sanitization
- Type-safe database operations

### Environment Security
- Environment variable management
- API key protection
- CORS configuration

## 🧪 Testing Strategy

### Type Safety
- Compile-time error catching
- Strict TypeScript configuration
- Schema validation testing

## 📈 Scaling Guidelines

### Feature Expansion
- Create new feature directories following established patterns
- Use shared utilities to maintain consistency
- Implement proper TypeScript types

### Team Development
- Clear feature boundaries for parallel development
- Consistent code style and patterns
- Comprehensive documentation

### Performance Scaling
- Implement caching strategies
- Database optimization
- Bundle size monitoring

## 🔄 Maintenance

### Regular Updates
- Dependency updates
- Security patches
- Performance optimizations

### Code Quality
- Regular linting
- Type checking
- Code review processes

### Documentation
- Keep documentation current
- Update README with new features
- Maintain inline code documentation

---

This template provides a solid foundation for building production applications with modern best practices, AI agent-friendly architecture, and excellent developer experience.
