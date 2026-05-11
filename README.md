# Intelligent Incident Agent — Frontend

Enterprise-grade React + TypeScript dashboard for the Intelligent Incident & Service Desk Agent.

## Tech Stack

- **Build**: Vite 5 · **Framework**: React 18 · **Language**: TypeScript 5 (strict)
- **Styling**: Tailwind CSS + CSS custom properties (full light/dark/system theming)
- **State**: Zustand · **Server state**: TanStack Query · **Routing**: React Router v6
- **Forms**: React Hook Form + Zod · **Animations**: Framer Motion · **Charts**: Recharts
- **HTTP**: Axios with JWT interceptors and single-flight refresh
- **Testing**: Vitest + React Testing Library · **E2E-ready**: Playwright

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy env template
cp .env.example .env

# 3. Start dev server (proxies /api to http://localhost:8000)
npm run dev

# Other scripts
npm run build       # production build
npm run preview     # preview production build
npm run typecheck   # tsc --noEmit
npm run lint        # eslint
npm run test        # vitest
```

App runs at **http://localhost:5173**

## Demo Accounts

| Email | Password | Role |
|---|---|---|
| `admin@example.com` | `admin1234` | admin |
| `engineer@example.com` | `engineer123` | engineer |
| `user@example.com` | `user12345` | user |

## Highlights

- **Flash-free theme initialization**: a synchronous script in `index.html` reads localStorage before first paint, so users never see the wrong theme flicker.
- **Token-based design system**: every color is a CSS custom property in `src/styles/tokens.css`. Switching themes is a single attribute change on `<html>`.
- **Single-flight token refresh**: 401 responses queue concurrent requests and refresh once, replaying them on success.
- **Lazy-loaded routes**: every page is a `React.lazy` import behind `<Suspense>`, with role-aware `PrivateRoute` guards.
- **Zod-validated forms**: schemas in `src/utils/validators.ts` mirror the backend Pydantic models for full-stack parity.

## Folder Structure

```
src/
├── components/
│   ├── ui/         Base design system (Button, Input, Card, Badge, Modal, Toast, …)
│   ├── layout/     Header, Sidebar, Footer, PageWrapper
│   └── shared/     Reusable feature pieces (MetricCard, StatusBadge, ErrorBoundary)
├── config/         app / api / theme configuration
├── context/        ThemeContext (light/dark/system) · AuthContext
├── hooks/          useTheme, useDebounce, useLocalStorage, useFetch, useToast
├── pages/          Login, Dashboard, IncidentQueue, IncidentDetails, Runbooks,
│                   KnowledgeBase, Escalations, AutomatedActions, Settings, NotFound
├── routes/         AppRouter, PrivateRoute, routes.config.ts
├── services/
│   ├── api/        client (axios + interceptors), endpoints (typed wrappers)
│   └── storage/    localStorage abstraction
├── store/          Zustand slices + middleware
├── styles/         globals.css, tokens.css
├── types/          api.types.ts, common.types.ts
└── utils/          cn, formatters, validators (Zod)
```
