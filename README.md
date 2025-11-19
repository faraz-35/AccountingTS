# Next.js Production Starter Template

A modern, production-ready Next.js starter template built with the latest technologies and following AI agent-first architecture principles.

## 🚀 Features

- **Modern Stack**: Next.js 16 (App Router), Supabase, React Hook Form, Zod, Zustand
- **Type Safety**: Full TypeScript integration with strict configuration
- **Beautiful UI**: Tailwind CSS with Radix UI primitives and custom component library
- **Authentication**: Complete auth system with Supabase
- **State Management**: Zustand for global state with persistence
- **Form Handling**: React Hook Form with Zod validation
- **Server Actions**: Safe action client with error handling
- **Developer Experience**: ESLint, TypeScript strict mode, hot reloading

## 📁 Project Structure

```
├── features/               # Feature-centric modules
│   ├── auth/              # Authentication feature
│   │   ├── components/    # Auth-specific components
│   │   ├── pages/         # Auth pages
│   │   ├── actions/       # Server Actions
│   │   ├── hooks/         # Custom hooks
│   │   └── types/         # TypeScript types
│   └── dashboard/         # Dashboard feature
│       ├── components/    # Dashboard components
│       └── pages/         # Dashboard pages
├── common/                # Shared utilities and components
│   ├── components/ui/     # Reusable UI components
│   ├── hooks/             # Global custom hooks
│   ├── lib/               # Third-party library configs
│   ├── store/             # Zustand stores
│   ├── styles/            # Global styles
│   └── utils/             # Utility functions
├── types/                 # Shared TypeScript types
└── app/                   # Next.js App Router pages
```

## 🛠 Technologies Used

### Core
- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety

### Backend & Database
- **Supabase** - Authentication, database, and real-time subscriptions

### Styling & UI
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library

### State Management & Forms
- **Zustand** - Lightweight state management
- **React Hook Form** - Form library with performance focus
- **Zod** - TypeScript-first schema validation

### Development Tools
- **ESLint** - Code linting
- **Supabase CLI** - Database management

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd starter
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. Set up environment variables
   ```bash
   cp .env.local.example .env.local
   ```

4. Configure Supabase
   - Create a new Supabase project
   - Run the provided SQL to create the profiles table
   - Add your Supabase URL and keys to `.env.local`

5. Run the development server
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📝 Environment Variables

Create a `.env.local` file with the following:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 🗄 Database Setup

Run the following SQL in your Supabase SQL editor to create the profiles table:

```sql
create table public.profiles (
  id uuid not null primary key,
  created_at timestamp with time zone null,
  updated_at timestamp with time zone null,
  email text null,
  first_name text null,
  last_name text null,
  avatar_url text null
);

create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

## 🏗 Architecture Principles

### AI Agent-First Design
- Each feature is self-contained with all its components, pages, actions, hooks, and types
- Clear separation between feature-specific and shared code
- Easy for AI agents to understand and work with individual features

### Feature Structure
Every feature follows this pattern:
- `components/` - React components specific to the feature
- `pages/` - Next.js pages/routes for the feature  
- `actions/` - Server Actions for the feature
- `hooks/` - Custom hooks specific to the feature
- `types/` - TypeScript types specific to the feature

### Global Standards
- Shared utilities in `common/`
- Consistent styling with Tailwind CSS
- Type-safe development throughout
- Comprehensive error handling

## 📚 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm run db:push` - Push database changes to Supabase
- `npm run db:diff` - Show database differences
- `npm run db:reset` - Reset database
- `npm run db:generate-types` - Generate TypeScript types from database

## 🧪 Development

### Adding New Features

1. Create a new feature directory under `features/`
2. Follow the established structure (components, pages, actions, hooks, types)
3. Use shared utilities from `common/`
4. Keep feature-specific code within the feature boundary

### Working with Forms

The template uses React Hook Form with Zod validation:

```typescript
import { useZodForm } from '@/common/hooks/use-zod-form'
import { mySchema } from '@/common/lib/schemas'

const form = useZodForm(mySchema, defaultValues)
```

### Server Actions

All server actions use the safe-action client:

```typescript
import { action } from '@/common/lib/safe-action'
import { mySchema } from '@/common/lib/schemas'

export const myAction = action(mySchema, async (data) => {
  // Server-side logic here
})
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Auth powered by [Supabase](https://supabase.com/)
- UI components from [Radix UI](https://www.radix-ui.com/)