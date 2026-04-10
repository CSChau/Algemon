# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Artifacts

### WSCSS Algemon – Math Battle v3.0 (`artifacts/algemon-battle`)
- Preview path: `/`
- Pure React + Vite (no backend, no database)
- Full game loop: Start → Hub → Battle → Result → Hub
- Data layer: `src/data/gameData.ts` (ALGE_DB 8 topics, GYM_DATA 8 gyms, constants)
- Main game: `src/pages/Game.tsx` (all screens + state)
- Screens: start, hub, gymSelect, shop, changeAlgemon, battle, result
- Features:
  - 5-button Hub/Main Menu
  - 8 Tai Po-themed Gyms with ordered progression (beat 1→unlock 2, etc.)
  - Wild battles (easy questions, 30 AC reward) vs Gym battles (HKDSE-level, 100 AC + badge)
  - Algecoin economy: WSCSS Tuck Shop sells Hint Tools (50 AC each)
  - Party system (up to 6 caught Algemons), Change Algemon screen
  - HINT button: free at Lv5+, or uses 1 Hint Tool from inventory
  - XP/Level system (Level 1–10, 100 XP/level)
  - CATCH phase (short-answer) when enemy HP < 30%
  - Battle Log, Save Code (WSCSS-ALGE2-...) auto-generated
  - 8 topics: factorization, changeOfSubject, inequalities, indices, simultaneous, polynomials, quadratic, functions
