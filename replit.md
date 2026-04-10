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

### WSCSS Algemon – Math Battle v5.0 (`artifacts/algemon-battle`)
- Preview path: `/`
- Pure React + Vite (no backend, no database)
- Full game loop: Start → Hub → Battle → Result → (Evolution) → Hub
- Data layer: `src/data/gameData.ts` (ALGE_DB 10 topics, GYM_DATA 8 gyms, EVOLUTION_DATA, SPECIES_LIST 24)
- Main game: `src/pages/Game.tsx` (all screens + state)
- Screens: start, hub, gymSelect, shop, changeAlgemon, status, library, evolution, battle, result
- Features:
  - 8-type registry: Fire/Water/Grass/Ice/Flying/Ground/Fighting/Electric
  - 24-species Algemon Dex: each type has 3 evolution stages (Stage 0→11→21)
  - All 8 types have base-form starters (4×2 grid on start screen)
  - Answer shuffling: every MC question randomises A/B/C/D via ShuffledQ
  - Dynamic damage: BASE_DAMAGE=34; playerDmg = 34×(playerLv/foeLv); at equal levels 2 hits → 32% HP
  - Defense bonus: Stage 1 = 10% damage reduction; Stage 2 = 20%
  - Wild battles: foeLv = playerLv (always balanced); 50 XP/correct answer
  - 8 Gyms with fixed foeLevels (4→6→8→10→12→14→17→20); 100 XP/correct
  - Elite Four (unlock after 8 badges); foeLevels 22→24→26→28; 150 XP/correct
  - XP level cap: 30; evolution triggers at Level 11 (Stage 1) and Level 21 (Stage 2)
  - Evolution screen shown post-battle when level crosses threshold
  - Party system up to 6; caught Algemon store baseType only (name/emoji from player level)
  - Status screen: accuracy %, Dex collection 24/24, save code, bag contents
  - Alge-Library: 10 study topics with formulas + HKDSE traps
  - Economy: Tuck Shop sells Hints (50AC), Algaballs (50AC), Potions (30AC)
  - 10 topics: factorization, changeOfSubject, inequalities, indices, simultaneous, polynomials, quadratic, functions, coordinates, ratios
