# @bitcode/styling

Tailwind CSS styling utilities for the Bitcode platform. Provides optimized class composition with duplicate resolution and Tailwind CSS integration.

## Core Function

- **cn()**: Tailwind-aware class composition utility

## Usage

```typescript
import { cn } from '@bitcode/styling';

// Compose classes with conflict resolution
const buttonClasses = cn(
 'px-4 py-2 rounded',
 'bg-blue-500 hover:bg-blue-600',
 'text-white font-medium',
 isActive && 'bg-blue-700',
 className // external classes
);

// Conditional styling
const cardClasses = cn(
 'p-6 rounded-lg border',
 {
 'border-red-500 bg-red-50': hasError,
 'border-green-500 bg-green-50': isSuccess,
 'border-gray-200': !hasError && !isSuccess
 }
);
```

## Features

- **Conflict Resolution**: Automatically resolves Tailwind class conflicts
- **Conditional Classes**: Support for conditional class application
- **Type Safety**: Full TypeScript support with ClassValue types
- **Performance**: Optimized for Tailwind CSS purging and tree-shaking

## Dependencies

Built on:
- **clsx**: Conditional class composition
- **tailwind-merge**: Tailwind-specific class merging and conflict resolution

## Architecture

Combines `clsx` for flexible class composition with `tailwind-merge` for Tailwind-specific duplicate resolution. Ensures final class strings work optimally with Tailwind's purging system.
