# Project Structure

This document outlines the directory structure and organization of the Food Ordering Frontend application.

## Directory Overview

```
frontend/
├── src/                          # Source code
│   ├── app/                      # Next.js App Router
│   │   ├── (public)/            # Public routes (landing, login, register, menu)
│   │   ├── (customer)/          # Customer-only routes (orders, tracking, profile)
│   │   ├── (admin)/             # Admin-only routes (dashboard, management)
│   │   ├── layout.tsx           # Root layout with providers
│   │   ├── page.tsx             # Landing page
│   │   └── globals.css          # Global styles
│   │
│   ├── components/              # React components
│   │   ├── ui/                  # shadcn/ui base components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   └── ...
│   │   ├── layout/              # Layout components
│   │   │   ├── header.tsx
│   │   │   ├── footer.tsx
│   │   │   ├── sidebar.tsx
│   │   │   └── navigation.tsx
│   │   ├── features/            # Feature-specific components
│   │   │   ├── menu-item-card.tsx
│   │   │   ├── cart-item.tsx
│   │   │   ├── order-timeline.tsx
│   │   │   └── ...
│   │   └── shared/              # Shared/reusable components
│   │       ├── loading-spinner.tsx
│   │       ├── error-message.tsx
│   │       └── ...
│   │
│   ├── lib/                     # Core utilities and logic
│   │   ├── api/                 # API client and endpoints
│   │   │   ├── client.ts        # Axios instance with interceptors
│   │   │   └── endpoints/
│   │   │       ├── auth.ts      # Authentication endpoints
│   │   │       ├── geo.ts       # Geolocation endpoints
│   │   │       ├── menu.ts      # Menu endpoints
│   │   │       └── orders.ts    # Order endpoints
│   │   │
│   │   ├── hooks/               # Custom React hooks
│   │   │   ├── use-auth.ts      # Authentication hooks
│   │   │   ├── use-geo.ts       # Geolocation hooks
│   │   │   ├── use-menu.ts      # Menu hooks
│   │   │   ├── use-orders.ts    # Order hooks
│   │   │   └── use-auth-guard.ts # Route protection hook
│   │   │
│   │   ├── store/               # Zustand state stores
│   │   │   ├── auth-store.ts    # Authentication state
│   │   │   ├── cart-store.ts    # Shopping cart state
│   │   │   └── geo-store.ts     # Geolocation state
│   │   │
│   │   ├── utils/               # Utility functions
│   │   │   ├── cn.ts            # Classname utility
│   │   │   ├── error-handler.ts # Error handling utilities
│   │   │   └── ...
│   │   │
│   │   └── validations/         # Zod validation schemas
│   │       ├── auth.ts          # Auth form schemas
│   │       ├── menu.ts          # Menu item schemas
│   │       ├── order.ts         # Order schemas
│   │       └── zone.ts          # Service zone schemas
│   │
│   └── types/                   # TypeScript type definitions
│       ├── auth.ts              # Authentication types
│       ├── geo.ts               # Geolocation types
│       ├── menu.ts              # Menu types
│       ├── cart.ts              # Cart types
│       └── order.ts             # Order types
│
├── public/                      # Static assets
│   ├── images/
│   └── icons/
│
├── .env.local                   # Environment variables (not in git)
├── .env.example                 # Environment variables template
├── .prettierrc                  # Prettier configuration
├── .prettierignore              # Prettier ignore patterns
├── eslint.config.mjs            # ESLint configuration
├── next.config.ts               # Next.js configuration
├── postcss.config.mjs           # PostCSS configuration
├── tsconfig.json                # TypeScript configuration
├── package.json                 # Dependencies and scripts
└── README.md                    # Project documentation
```

## Key Conventions

### Routing Structure

- **(public)**: Routes accessible without authentication
  - `/` - Landing page with location check
  - `/login` - Login page
  - `/register` - Registration page
  - `/menu` - Menu browsing

- **(customer)**: Routes requiring customer authentication
  - `/orders` - Order history
  - `/tracking/[orderId]` - Order tracking
  - `/profile` - User profile

- **(admin)**: Routes requiring admin authentication
  - `/dashboard` - Admin dashboard
  - `/zones` - Service zone management
  - `/menu-management` - Menu item management
  - `/orders-management` - Order status management

### Component Organization

- **ui/**: Base UI components from shadcn/ui, reusable across the app
- **layout/**: Components that define page structure (header, footer, sidebar)
- **features/**: Domain-specific components tied to business logic
- **shared/**: Generic reusable components not tied to specific features

### State Management

- **Zustand stores**: Client-side state (auth, cart, geo)
- **TanStack Query**: Server state caching and synchronization
- **Local Storage**: Persistent state (auth tokens, cart, location)

### API Integration

- All API calls go through the configured Axios client
- Automatic token refresh on 401 errors
- Request/response interceptors for auth and error handling
- Endpoints organized by domain (auth, geo, menu, orders)

### Form Handling

- React Hook Form for form state management
- Zod for schema validation
- Inline error messages
- Loading states during submission

### Styling

- Tailwind CSS 4 for utility-first styling
- Custom theme configuration in globals.css
- Responsive design with mobile-first approach
- Dark mode support (optional)

## Development Workflow

1. **Create types** in `src/types/` for new features
2. **Define validation schemas** in `src/lib/validations/`
3. **Create API endpoints** in `src/lib/api/endpoints/`
4. **Build custom hooks** in `src/lib/hooks/` for data fetching
5. **Create UI components** in appropriate component directories
6. **Add pages** in `src/app/` following route group conventions
7. **Test and validate** with ESLint and Prettier

## Best Practices

- Use TypeScript for all files
- Follow Next.js 16 App Router conventions
- Use server components by default, client components when needed
- Implement proper error boundaries
- Add loading states for async operations
- Ensure accessibility (ARIA labels, keyboard navigation)
- Optimize images with Next.js Image component
- Keep components small and focused
- Write reusable utility functions
- Document complex logic with comments
