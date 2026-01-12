# Copilot Instructions for Selfservice Portal

## Project Overview
- This is a React-based self-service portal, bootstrapped with Create React App, using both JavaScript and TypeScript files.
- The main entry point is `src/index.tsx`, with the root component in `src/App.jsx`.
- Major features are organized under `src/pages/`, with reusable UI components in `src/components/`.
- API and service logic is in files like `SelfServiceApiClient.js`, `GraphApiClient.js`, and `AuthService.js`.
- Context and state management use React Context (see `AppContext.jsx`, `ErrorContext.jsx`, etc.).

## Key Patterns & Conventions
- Use functional React components and hooks (see `src/hooks/`).
- CSS Modules are used for component-scoped styles (e.g., `*.module.css`).
- Contexts are defined in `src/*Context.jsx` and provided at the app or page level.
- API clients are plain JS classes or modules, not using Redux or RTK Query.
- Test files are under `tests/` and use Playwright for E2E tests.
- Constants are grouped in `src/constants/`.
- Avoid direct DOM manipulation; use React patterns.

## Developer Workflows
- **Start dev server:** `npm start` (runs on http://localhost:3000)
- **Run tests:** `npm test` (Jest/React Testing Library for unit, Playwright for E2E)
- **Build for production:** `npm run build` (outputs to `build/`)
- **Linting:** Standard Create React App linting; errors show in console during dev.
- **E2E tests:** See `tests/parallel/` and `tests/sequential/` for Playwright specs.

## Integration & Data Flow
- API calls are made via `SelfServiceApiClient.js` and `GraphApiClient.js`.
- Auth flows are handled in `auth/` and `AuthService.js`.
- Cross-component state is managed via React Context, not Redux.
- Error handling is centralized via `ErrorContext.jsx` and `ErrorDisplay.jsx`.

## Notable Files & Directories
- `src/pages/` — Main app pages (e.g., capabilities, demos, frontpage)
- `src/components/` — Reusable UI components
- `src/auth/` — Authentication templates and context
- `src/hooks/` — Custom React hooks
- `src/constants/` — Project-wide constants
- `src/tests/` — Playwright E2E and other tests

## Project-Specific Advice
- When adding new features, prefer colocating logic, styles, and tests by feature.
- Follow the existing Context and API client patterns for new data flows.
- Use CSS Modules for all new styles.
- Reference `README.md` for standard scripts and troubleshooting.

---
For more, see `README.md` and the main entry files in `src/`.
