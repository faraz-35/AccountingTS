# Common

This directory contains shared utilities, components, and configurations used across all features.

## Structure

- `lib/` - Global configurations and third-party library setups
- `components/` - Reusable UI component library
- `utils/` - Shared utility functions and helpers
- `hooks/` - Global custom hooks
- `store/` - Global state management (Zustand stores)
- `styles/` - Global styles and theme configurations

## Guidelines

- Components should be generic and reusable
- Utilities should be pure functions when possible
- Store state should be limited to truly global data
- Avoid feature-specific code in the common directory