# Agent Teams Protocol (Claude Code)

Generated from team `engrammonitor`. Claude agent files are synced to `./.claude/agents/`.

## Delegation via Engram

- Write durable task context to Engram before delegating. Agents must reconstruct state from Engram, not from shared chat history.
- Single handoff: write `handoff:{taskId}` for the top-level assessment when handing a task to one orchestrator.
- Sub-task dispatch: write `task:{taskId}:subtask:{agentId}` and then call the `dispatch_task` MCP tool with `{ agentId, taskId, description }`.
- Sub-task completion: after persisting `task:{taskId}:subtask:{agentId}:result`, call the `complete_subtask` MCP tool with `{ taskId, agentId, summary }`.
- Final aggregation: the aggregator recalls all `task:{taskId}:subtask:*:result` entries and writes the unified outcome to `task:{taskId}:result`.

## Available Claude Agents

- `engram-release-dashboard` (worker) → `./.claude/agents/engram-release-dashboard.md`

---

# Architecture

> High-level overview of the engram-monitor React SPA.

## Purpose

engram-monitor is a single-page application dashboard for monitoring and exploring observations stored by the Engram memory service. It connects to a local Engram HTTP server (default `http://127.0.0.1:7437`) and provides search, browsing, and management of AI agent observations, sessions, and stats.

## Key Files & Paths

| Path | Role |
|---|---|
| `src/app/main.tsx` | Application entry point; mounts React root |
| `src/app/app.tsx` | Root component; wraps providers (QueryClient, Router) |
| `src/app/Router.tsx` | Route definitions via React Router |
| `src/config/engram.ts` | Axios instance configured for the Engram API |
| `src/config/axios.ts` | Global Axios defaults |
| `src/config/react-query.ts` | TanStack Query client configuration |
| `src/models/engram.ts` | TypeScript interfaces for all Engram domain types |
| `src/services/engram.ts` | All API calls to the Engram backend |
| `src/pages/engram-dashboard/` | Main dashboard page (page + view + types) |
| `src/hooks/` | Custom React hooks encapsulating state and data fetching |
| `src/components/` | Atomic design component hierarchy |
| `vite.config.ts` | Vite config with dev proxy, path aliases, and plugins |

## Entry Points

1. `src/app/main.tsx` — start here for app initialization
2. `src/app/Router.tsx` — understand available routes
3. `src/models/engram.ts` — understand data shape before touching services or hooks

## Key Concepts

**Engram API proxy**: Vite proxies `/engram-api` to `http://127.0.0.1:7437` in dev. All service calls use the `engramApi` Axios instance from `src/config/engram.ts`.

**Data fetching pattern**: Services in `src/services/engram.ts` wrap raw API calls. Hooks in `src/hooks/` compose services with TanStack Query (`useQuery`, `useMutation`) and expose clean interfaces to components.

**Atomic design components**: Components are organized as `atoms → molecules → organisms → templates`. Pages consume templates and organisms. Path aliases (`@atoms`, `@organisms`, etc.) are defined in `vite.config.ts`.

**Session derivation**: Sessions are not a first-class API concept — they are derived client-side in `engramService.sessions()` by grouping observations by `session_id` and parsing the session ID string for agent name and date.

**State management**: Zustand is available for global UI state (theme, loading). TanStack Query manages server state.

---

# Conventions

> Coding style, tooling setup, and naming conventions for engram-monitor.

## Purpose

Establishes consistent practices across the codebase so agents and contributors produce coherent, idiomatic code.

## Key Files & Paths

| Path | Role |
|---|---|
| `biome.json` | Biome linter/formatter configuration (replaces ESLint + Prettier) |
| `lefthook.yml` | Git hook configuration (pre-commit runs biome + tsc) |
| `tsconfig.json` | TypeScript compiler options |
| `vite.config.ts` | Path alias definitions |

## Tooling

- **Formatter/Linter**: Biome (`pnpm run biome-all` for full check+write, `biome-staged` for pre-commit)
- **Type checking**: `tsc` (strict mode; run via `pnpm run build` or `tsc` directly)
- **Package manager**: pnpm
- **Git hooks**: Lefthook — pre-commit runs `biome-staged` then `tsc` then `git add -A`

## File & Directory Naming

- Component files: PascalCase (`Text.tsx`, `Layout.tsx`)
- Hook directories: kebab-case with `use-` prefix (`use-engram/`, `use-theme/`)
- Each hook is a directory containing `hook.ts`, `index.ts`, `types.ts`, and optionally `store.ts`
- Page directories: kebab-case (`engram-dashboard/`), containing `Page.tsx`, `View.tsx`, `index.ts`, `types.ts`
- Barrel exports via `index.ts` in each feature directory

## Path Aliases

All aliases are defined in `vite.config.ts` and resolve to `./src/`:

| Alias | Resolves to |
|---|---|
| `@` | `src/` |
| `@app` | `src/app/` |
| `@atoms` | `src/components/atoms/` |
| `@molecules` | `src/components/molecules/` |
| `@organisms` | `src/components/organisms/` |
| `@templates` | `src/components/templates/` |
| `@config` | `src/config/` |
| `@services` | `src/services/` |
| `@hooks` | `src/hooks/` |
| `@models` | `src/models/` |
| `@pages` | `src/pages/` |
| `@styles` | `src/styles/` |
| `@helpers` | `src/utils/helpers/` |
| `@constants` | `src/utils/constants/` |

Always use aliases for cross-directory imports; never use long relative paths.

## TypeScript

- Strict mode enabled; avoid `any`
- Use `type` imports when importing only types: `import type { Foo } from '@models/engram'`
- Interfaces over types for object shapes; types for unions and aliases

## Styling

- TailwindCSS v4 (configured via `@tailwindcss/vite` plugin, no `tailwind.config` file)
- Use `clsx` + `tailwind-merge` (via `tailwind-variants` or directly) for conditional classes
- Global styles in `src/styles/` (base, fonts, theme, utilities, global)

---

# Frontend

> React component hierarchy, pages, hooks, and state management for the dashboard UI.

## Purpose

Renders the Engram monitoring dashboard: search, observation browsing, session grouping, stats display, and observation management (delete/reset).

## Key Files & Paths

| Path | Role |
|---|---|
| `src/components/atoms/` | Primitive UI elements (e.g., `Text`) |
| `src/components/molecules/` | Composed atoms (currently empty, being built) |
| `src/components/organisms/header/` | App header organism |
| `src/components/organisms/footer/` | App footer organism |
| `src/components/templates/layout/` | Page layout wrapper template |
| `src/pages/engram-dashboard/` | Main and only dashboard page |
| `src/hooks/use-engram/` | Data fetching hook for Engram API (observations, sessions, stats, health) |
| `src/hooks/use-loading/` | Global loading state hook backed by Zustand store |
| `src/hooks/use-theme/` | Theme (light/dark) toggle hook backed by Zustand store |
| `src/styles/` | Global CSS files (base, fonts, theme tokens, utilities) |

## Entry Points

1. `src/pages/engram-dashboard/EngramDashboardPage.tsx` — data-fetching container
2. `src/pages/engram-dashboard/EngramDashboardView.tsx` — presentational view
3. `src/hooks/use-engram/hook.ts` — main data hook

## Key Concepts

**Page = Page + View split**: Each page is split into a `Page` (container: fetches data, handles mutations) and a `View` (presentational: receives props, no side effects). Types for props live in `types.ts`.

**Atomic design**: Build components bottom-up: atom → molecule → organism → template → page. Never import a higher-level component into a lower-level one.

**useEngram hook**: Wraps TanStack Query calls to `engramService`. Exposes observations, sessions, stats, health, search, and mutation helpers. This is the primary interface between pages and the API layer.

**Loading state**: `use-loading` provides a global loading overlay controlled by Zustand. Use it for long-running operations (e.g., reset all).

**Theme**: `use-theme` persists light/dark mode in Zustand and applies a CSS class to the document root. Theme tokens are defined in `src/styles/theme.css`.

## Conventions

- Component props types are co-located in the same directory as the component (`types.ts`)
- Organisms and templates export from `index.tsx` / `index.ts` barrel files
- SVG assets are imported as React components via `vite-plugin-svgr` (use `?react` suffix or the default import)
