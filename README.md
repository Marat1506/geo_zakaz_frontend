# Food Ordering Frontend

A modern, geo-fenced food ordering application built with Next.js 16, React 19, and TypeScript.

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **UI**: React 19, Tailwind CSS 4
- **State Management**: Zustand, TanStack Query
- **Forms**: React Hook Form with Zod validation
- **HTTP Client**: Axios
- **TypeScript**: Full type safety

## Project Structure

```
src/
├── app/              # Next.js App Router pages
├── components/       # React components
│   ├── ui/          # shadcn/ui components
│   ├── layout/      # Layout components
│   ├── features/    # Feature-specific components
│   └── shared/      # Shared components
├── lib/             # Core utilities
│   ├── api/         # API client & endpoints
│   ├── hooks/       # Custom React hooks
│   ├── store/       # Zustand stores
│   ├── utils/       # Utility functions
│   └── validations/ # Zod schemas
└── types/           # TypeScript type definitions
```

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables:

```bash
cp .env.example .env.local
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## Environment Variables

- `NEXT_PUBLIC_API_URL` - Backend API URL (default: http://localhost:3000/api)

## Features

- User authentication (login/register)
- Geolocation verification
- Menu browsing and ordering
- Shopping cart management
- Order tracking
- Admin dashboard
- Service zone management
- Menu management

## Backend Integration

This frontend integrates with a backend API running at `http://localhost:3000/api`. Make sure the backend is running before starting the frontend.
