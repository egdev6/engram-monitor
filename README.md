<a name="readme-top"></a>

<div align="center">

[![Stars][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![LinkedIn][linkedin-shield]][linkedin-url]

</div>

# Engram Monitor

<img src='/public/images/monitor.png'>

A single-page dashboard for monitoring and exploring observations stored by the [Engram](https://github.com/egdev6/engram) memory service. Search, browse, and manage AI agent sessions, observations, prompts, and stats from a local Engram HTTP server.

---

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li><a href="#built-with">Built With</a></li>
    <li><a href="#prerequisites">Prerequisites</a></li>
    <li><a href="#installation">Installation</a></li>
    <li><a href="#scripts">Scripts</a></li>
    <li><a href="#architecture">Architecture</a></li>
    <li><a href="#features">Features</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>

---

## Built With

<div align="center" id="built-with">

![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![React Query](https://img.shields.io/badge/-React%20Query-FF4154?style=for-the-badge&logo=react%20query&logoColor=white)
![Zustand](https://img.shields.io/badge/zustand-brown?style=for-the-badge&logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![Biome](https://img.shields.io/badge/Biome-60A5FA?style=for-the-badge&logo=biome&logoColor=white)
![PNPM](https://img.shields.io/badge/Pnpm-gray?style=for-the-badge&logo=pnpm&logoColor=white)
![Lefthook](https://img.shields.io/badge/lefthook-c90e14?style=for-the-badge&logo=lefthook&logoColor=white)

</div>

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## Prerequisites

<div id="prerequisites">

- **Node.js** `>=20` (use `nvm use` if you have an `.nvmrc`)
- **pnpm** `>=9` — `npm install -g pnpm`
- **Engram** `>= v1.12.0` and running locally on `http://127.0.0.1:7437`
  - The dev script will attempt to start Engram automatically if it is not already running
  - Install Engram: `go install github.com/egdev6/engram@latest` (or see its own README)

</div>

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## Installation

<div id="installation">

**1. Clone the repository**

```bash
git clone https://github.com/egdev6/engram-monitor.git
cd engram-monitor
```

**2. Use the correct Node version**

```bash
nvm use
```

**3. Install dependencies**

```bash
pnpm install
```

**4. Start the dev server**

```bash
pnpm dev
```

This command runs two processes concurrently:
- Waits for Engram on `http://127.0.0.1:7437/health` (starts `engram serve` if not reachable)
- Starts Vite once Engram is healthy

The app will be available at `http://localhost:5173`.

> **Tip:** If Engram is already running separately, `pnpm dev` will skip starting it and go straight to Vite.

</div>

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## Scripts

<div id="scripts">

| Command | Description |
|---|---|
| `pnpm dev` | Start Engram (if needed) + Vite dev server concurrently |
| `pnpm build` | Type-check with `tsc` then build with Vite |
| `pnpm preview` | Preview the production build locally |
| `pnpm reinstall` | Clean all deps/dist and reinstall from scratch |
| `pnpm biome-all` | Run Biome linter + formatter across the entire project |
| `pnpm pre-commit` | Run staged Biome check + `tsc` + `git add -A` (runs via Lefthook) |

</div>

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## Architecture

<div id="architecture">

The project follows **Atomic Design** with a container/presentational split for pages.

```
src/
├── app/                    # Entry point, router, providers
├── components/
│   ├── atoms/              # BackButton, EmptyState, FilterSelect, IconButton,
│   │                       # SearchInput, StatCard, Text, TypeBadge
│   ├── molecules/          # ClearFiltersBar, MarkdownPanel, ObservationRow, TabBar
│   ├── organisms/          # EmptySessionsTab, Footer, Header, MemoriesTab,
│   │                       # PromptsTab, SessionCard, SessionDetailCard,
│   │                       # SessionsTab
│   └── templates/          # Layout
├── config/                 # Axios instances, React Query client
├── hooks/                  # use-engram, use-theme, use-loading
├── models/                 # TypeScript interfaces for Engram domain types
├── pages/
│   ├── engram-dashboard/   # Main dashboard (Sessions, Memories, Prompts, Empty tabs)
│   └── session-detail/     # Session drill-down with observation list
├── services/               # All Engram API calls (engramService)
├── styles/                 # Global CSS: base, theme tokens, fonts, utilities
└── utils/
    ├── constants/          # TYPE_COLORS, PROJECT_COLORS, INPUT_CLS
    └── helpers/            # timeAgo(), projectColor()
```

**Key concepts:**

- **API proxy** — Vite proxies `/engram-api` → `http://127.0.0.1:7437` in dev. All calls use the `engramApi` Axios instance.
- **Session derivation** — Active sessions (with observations) are derived client-side by grouping observations by `session_id`. Empty sessions are fetched directly from the `GET /sessions` endpoint.
- **Data fetching** — Services wrap raw API calls. Hooks compose services with TanStack Query and expose clean interfaces to components.
- **Global state** — Zustand for UI state (theme, loading overlay). TanStack Query for all server state.

**Path aliases** (defined in `vite.config.ts`):

| Alias | Path |
|---|---|
| `@` | `src/` |
| `@atoms` | `src/components/atoms/` |
| `@molecules` | `src/components/molecules/` |
| `@organisms` | `src/components/organisms/` |
| `@templates` | `src/components/templates/` |
| `@hooks` | `src/hooks/` |
| `@services` | `src/services/` |
| `@models` | `src/models/` |
| `@pages` | `src/pages/` |
| `@config` | `src/config/` |
| `@constants` | `src/utils/constants/` |
| `@helpers` | `src/utils/helpers/` |
| `@styles` | `src/styles/` |

</div>

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## Features

<div id="features">

- **Sessions tab** — grid view of all agent sessions with agent name, project, type badges, latest title, topic key, and date. Filterable by project, type, and date range.
- **Memories tab** — grid view of individual observations. Filterable by project, type, scope, and limit. Click any row to open a Markdown detail panel.
- **Prompts tab** — list of saved user prompts with inline search and per-row delete.
- **Empty sessions tab** — dedicated list of sessions with no observations, with inline search and per-row delete to clean up stale entries.
- **Session detail** — drill into a session to see all its observations in order, with inline search and type filtering.
- **Live health indicator** — header shows online/offline status with auto-polling every 2 seconds.
- **Stats bar** — projects, sessions, observations, prompts, and empty session counts at a glance.
- **Delete support** — delete individual prompts or empty sessions directly from the dashboard.
- **Dark theme** — dark-only UI with Geist font and a magenta accent.

</div>

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## Contact

<div align="center" id="contact">

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/egdev/)
[![Instagram](https://img.shields.io/badge/Instagram-purple?style=for-the-badge&logo=instagram&logoColor=white)](https://www.instagram.com/egdev6/)
![Discord](https://img.shields.io/badge/Egdev5285-8C9EFF?style=for-the-badge&logo=discord&logoColor=white)
[![Gmail](https://img.shields.io/badge/Gmail-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:egdev6@gmail.com)

</div>

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS -->
[stars-shield]: https://img.shields.io/github/stars/egdev6/engram-monitor.svg?style=for-the-badge
[stars-url]: https://github.com/egdev6/engram-monitor/stargazers
[issues-shield]: https://img.shields.io/github/issues/egdev6/engram-monitor.svg?style=for-the-badge
[issues-url]: https://github.com/egdev6/engram-monitor/issues
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/egdev6
