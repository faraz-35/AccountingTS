# Types

This directory contains shared TypeScript type definitions used throughout the application.

## Structure

- `supabase.ts` - Auto-generated Supabase database types
- `global.ts` - Global shared types used across features
- `api.ts` - API request/response types
- `auth.ts` - Authentication-related types

## Guidelines

- Export types with clear naming conventions
- Use interfaces for object shapes
- Use type aliases for unions, primitives, and computed types
- Keep types DRY and reusable across features