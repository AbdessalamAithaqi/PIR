# Rugby Team Management Game — Project Handover & Maintenance Guide

**A web-based serious game for the INSA Toulouse business / management course, built to replace SIMGEST.**

| | |
|---|---|
| **Project** | Projet d'Initiation à la Recherche (PIR), Semester 2 |
| **Authors** | Abdessalam Aithaqi, Armand Ghionda, George Papailiopoulos, Daniel De Almeida, Domagoj Jenjic |
| **Clients / Supervisors** | Paul Scanlan (pedagogical client), Oumaima El Haddadi (technical supervisor & client), Hélène Hereng (management team) |
| **Status at handover** | V1 — complete end-to-end pedagogical loop, demo authentication, runs on SQLite |
| **Document purpose** | Everything a teacher needs to run the game in class, and everything a future student team needs to set it up, understand it, and extend it. |

---

## How to read this document

This guide is written for two different audiences. You do not need to read all of it.

- **If you are a teacher or a colleague** who wants to *use* the game in a class, read **Part A**. It is written in plain language with no code. It tells you what the game does, how to run a session, how students play, and what you can control.
- **If you are a student on next year's development team** who wants to *run, fix, or extend* the code, read **Part B**. It is the technical reference: setup, architecture, the full API, the database, every game formula, the known limitations, and a prioritised roadmap of what to build next.

Both parts are self-contained. **Part B's "Known limitations and gotchas" and "Roadmap" sections are the most important things for the next team to read first** — they describe the true state of the project, including the places where the written report describes an *intended* design that is not yet what the code actually does.

---

## Table of contents

**Part A — For teachers and colleagues**
1. What this game is, in one page
2. The learning loop it supports
3. How to run a session, step by step (teacher)
4. What students see and do
5. The teacher control panel
6. The four difficulty parameters and what they do
7. The game rules in plain language
8. Running a class debrief
9. Things a teacher should know about this first version

**Part B — For the next development team**
1. Technology stack at a glance
2. Repository layout
3. Prerequisites
4. First-time setup
5. Running it day to day
6. Environment variables
7. The database
8. System architecture
9. The round lifecycle (state machine)
10. Complete REST API reference
11. Data model reference
12. The game engine: every formula, exactly as coded
13. The frontend
14. Authentication: what exists and what is missing
15. Building and deploying for INSA (production)
16. Testing status (read this honestly)
17. Known limitations and gotchas
18. Roadmap: what future cohorts should build, in priority order
19. How to add a feature (worked example)
20. How to re-theme the game away from rugby
21. Glossary

---
---

# PART A — For teachers and colleagues

## A1. What this game is, in one page

This is a small web application that lets a class play a multi-round management game. Each game has **four teams**. Students log in, are placed into a team by the teacher, and across **six rounds** they make management decisions for that team. After every round the system simulates the matches, updates each team's money, fans and league position, and shows the results. The team that manages its resources best ends up top of the table.

The theme is **rugby team management**: the "company" is a rugby club, recruiting players is the investment decision, and marketing spend grows the fan base. But the theme is deliberately a thin layer on top of a generic engine — the underlying loop (make decisions → simulate → see results → decide again) is exactly the loop a classical business simulation uses. It is the same pedagogical idea as SIMGEST, rebuilt as a modern, web-based, INSA-hostable tool that future students can keep improving.

Everyone uses it through a normal web browser. There is nothing to install for students or teachers.

## A2. The learning loop it supports

Every round repeats the same three phases, which is the heart of the pedagogy:

1. **Decision phase** — each team decides which players to field, which new players to bid for, and how much to spend on advertising and merchandising. They do this under a budget constraint, so every choice is a trade-off.
2. **Simulation phase** — the teacher closes the round and the system plays out the matches. Results depend on team strength, fan base, marketing, and a small, controlled luck factor.
3. **Results phase** — students see the new league table and a history of what happened and why. They use that to plan the next round.

The intended learning outcomes are the same ones the management literature attributes to business simulations: practising resource allocation, weighing risk, reading consequences over several rounds, and adjusting strategy.

## A3. How to run a session, step by step (teacher)

You will need the application to be running (in this first version a developer or the next team starts it; see Part B). Once it is running and you open it in a browser:

1. **Open the home page** and choose **Teacher**. (In this first version there is no password — see A9.)
2. You land on **your dashboard**, a list of games you have created. Click the button to **create a new game** and give it a name.
3. Opening a game shows you a **join code** (a short code like `UR1ZD5`). Write it on the board. This is what students type to enter *this specific* game.
4. Ask students to open the app, choose **Student**, and enter the join code. As they join, they appear in your **Teams** tab as "unassigned".
5. In the **Teams** tab, **drag each student into one of the four teams**. (You can move them between teams, or remove an assignment, at any time.)
6. Optionally open the **Parameters** tab and adjust difficulty (see A6). The defaults are fine for a first run.
7. Go to the **Round Management** tab and press **Launch**. This opens Round 1: students can now make decisions.
8. Watch the **readiness indicator** — it shows how many of the four teams have pressed "ready". You do not have to wait for all of them; you decide when to close the round.
9. When you are ready, press **Move to next round**. The system simulates the round and you (and the students) can see the updated league table and report.
10. Press **Launch** again to open the next round, and repeat. After the sixth round is simulated, the game is marked **Finished**.

A useful rhythm in class is: launch a round, give the teams a few minutes to decide and mark ready, then close it and spend time on the results before launching the next one.

## A4. What students see and do

A student's experience is:

- **Join screen** — they enter the class join code.
- **Waiting screen** — after joining, they wait until you assign them to a team. The screen updates automatically every few seconds.
- **Game screen** — once assigned, they get a header showing their **team name, current fan count and budget**, and five tabs:
  - **Team** — the squad. They choose which players are in the starting line-up.
  - **Market** — the auction. Each round, new players appear for sale. Students place a **sealed bid** (other teams cannot see their bid). The highest bid that meets the player's price wins them when the round closes.
  - **Marketing** — they invest in **advertising** and **merchandising** (up to two steps each per round). Advertising grows fans; both feed into team performance and revenue.
  - **Leaderboard** — the league table (matches played, wins/draws/losses, points, recent form) and upcoming fixtures.
  - **Report** — a round-by-round history of every team's fans, money, results and growth.
- When they have made their choices, they press **ready**. They can change decisions until you close the round.

Decisions can only be made while a round is **open** (i.e. after you press Launch and before you move to the next round). Outside an open round the controls are locked.

## A5. The teacher control panel

The teacher's per-game page has five tabs:

- **Teams** — the drag-and-drop assignment screen (joined students on the left, the four teams on the right).
- **Parameters** — the four difficulty knobs (see A6), which you can change between rounds.
- **Round Management** — the operational centre: **Launch**, **Move to next round**, **Stop**, plus the current round number, the game state, and the team-readiness indicator.
- **Report** — the same history students see, but for all four teams at once (good for a class debrief).
- **Leaderboard** — the league table for all four teams.

**Stop** pauses a game (students can no longer submit) without advancing it. **Launch** reopens decisions for the current round.

## A6. The four difficulty parameters and what they do

In the **Parameters** tab you can adjust four values. Each is a number you can raise or lower between rounds to change the feel of the game. The defaults (shown below) produce a balanced game.

| Parameter | Default | Plain-language effect |
|---|---|---|
| **Luck factor** | 50 | How much random chance influences a match result. Higher = more upsets; lower = the stronger team wins more reliably. |
| **Fan growth** | 20 | How quickly fan bases grow from marketing and good results. Higher = fans snowball faster. |
| **Financial growth** | 8 | How much money teams earn each round from their fan base. Higher = richer teams, more to spend. |
| **Injury probability** | 12 | The chance a team suffers a small performance penalty in a match due to "injury". Higher = more volatility. |

These are good levers for tailoring the game to a class: a calmer, more skill-driven game (lower luck, lower injury) for a first session, or a more dramatic one (higher luck) for a fun final round.

## A7. The game rules in plain language

- Each game has **four teams** and runs for **six rounds**.
- Every team starts identical: **€50,000 budget, 1,000 fans**, and the same squad of players.
- Each round, every team plays matches against the others (over the six rounds, each team meets each other team twice).
- A team's match performance comes mostly from the **average skill of its starting players**, plus contributions from its **fan base** and **marketing**, plus a **luck** element. The better team usually — but not always — wins.
- Winning earns **3 league points**, a draw **1**, a loss **0**. Winning also brings a jump in fans and a cash bonus.
- **Fans** grow from marketing and good results (and shrink slightly after a loss). **More fans means more revenue** each round, and revenue funds better players. This is the deliberate feedback loop: good management compounds.
- New, stronger (and pricier) players appear on the **market** each round, sold by sealed-bid auction to the highest bidder who can afford them.
- The result is **reproducible**: the same decisions always produce the same outcome, so you can confidently explain to a student exactly why their team got the result it did.

## A8. Running a class debrief

The **Report** and **Leaderboard** tabs on the teacher side are designed for this. Because the game stores the full history and is fully reproducible, you can:

- Show the league table evolving round by round.
- Point to a specific team's report and discuss *why* it rose or fell (did they overspend early? under-invest in fans? get a strong player at auction?).
- Replay the logic with the class: the result was not arbitrary, it followed from their decisions plus the parameters you set.

## A9. Things a teacher should know about this first version

This is a solid, working first version, but it is explicitly a foundation for future students to build on. A few honest caveats:

- **There is no real login yet.** You pick "Teacher" or "Student" directly. Anyone with the link can act as a teacher. Connecting it to INSA's real login system (CAS) is the first job for next year's team. **Do not treat it as secure** in its current state.
- **It needs to be hosted to be used by a class.** In this version it is typically run on a developer's machine or a test server. Putting it on the INSA server so a whole class can reach it is part of the remaining work.
- **It uses a simple local database file** by default. That is fine for testing, but the production database (PostgreSQL on the INSA server) is not yet wired up — again, future work.
- **The market is simple**: players have a single skill number, and auctions are sealed-bid (not live). This was a deliberate choice to deliver a complete loop in one semester.
- If a student asks why a result happened, you can answer confidently: the simulation is deterministic, so identical decisions always give identical results.

If you want any of the above improved, the next section is written precisely so that a new student team can pick the project up and continue.

---
---

# PART B — For the next development team

> **Read this first:** Sections **B16 (Testing status)**, **B17 (Known limitations and gotchas)** and **B18 (Roadmap)** describe the *true* state of the project. Several things the written article presents as done (CAS integration "ready in the code", PostgreSQL, Docker) are **not actually implemented** in the repository. This guide always describes what the code really does, and flags those gaps so you do not lose time looking for things that are not there.

## B1. Technology stack at a glance

The project is **two independent applications** that talk over HTTP (a REST API). This decoupling is intentional and is the main thing to preserve.

**Backend** (`/` root of the repo)
- **Node.js** + **TypeScript**, run directly with **tsx** in development.
- **Express 4** web framework. Exposes everything under `/api`.
- **Prisma 7** ORM. A single `schema.prisma` defines the data model and generates a typed client.
- **SQLite** as the database, accessed through the **`@prisma/adapter-better-sqlite3`** driver adapter. The dev database is the file `prisma/dev.db`.

**Frontend** (`/client`)
- **React 19** single-page application.
- **Vite** dev server and bundler. Configured to **proxy `/api` to the backend** so the two feel like one app.
- **Tailwind CSS v4** (via the `@tailwindcss/vite` plugin) for styling.
- **react-router-dom v7** for client-side routing.
- A small custom **i18n** layer supporting **English and French**.

## B2. Repository layout

```text
PIR-main/
├── package.json              # Backend dependencies + scripts (dev, build, start, test)
├── tsconfig.json             # Backend TypeScript config
├── prisma.config.ts          # Prisma datasource + migrations config (reads DATABASE_URL)
├── prisma/
│   ├── schema.prisma         # THE data model (11 entities) — single source of truth
│   ├── migrations/           # SQL migrations (init, participants, game loop, parameters)
│   └── dev.db                # SQLite dev database (gitignored; created locally)
├── src/
│   ├── server.ts             # Express entry point. Mounts the games router under /api/games
│   ├── lib/
│   │   └── prisma.ts         # Single Prisma client instance (SQLite adapter)
│   ├── routes/
│   │   └── games.ts          # ~1500 lines: ALL endpoints, helpers, and game formulas
│   ├── types/cors.d.ts       # Local type shim
│   ├── test_prisma.ts        # Throwaway manual script (lists users); NOT a test suite
│   └── generated/prisma/     # Prisma client output (gitignored; created by `prisma generate`)
│
├── client/
│   ├── package.json          # Frontend dependencies + scripts (dev, build, lint, preview)
│   ├── vite.config.ts        # React + Tailwind plugins; /api proxy to localhost:3000
│   ├── index.html
│   └── src/
│       ├── main.tsx          # React root
│       ├── App.tsx           # Routes: / , /teacher , /teacher/games/:id , /student
│       ├── index.css         # Tailwind v4 import
│       ├── i18n/index.tsx    # Translation strings (en/fr) + provider + selector
│       ├── lib/auth.ts       # EMPTY placeholder (intended home of real auth)
│       ├── pages/            # Thin page wrappers used by the router
│       └── features/         # The real UI, organised by feature:
│           ├── teacher-dashboard/   # list/create/delete games
│           ├── teacher-game/        # per-game management (5 tabs)
│           └── student-game/        # join → waiting → 5-tab gameplay
│
└── wireframe/                # 17 PNG wireframes / screenshots used in the report
```

Each `features/<name>/` folder follows the same convention: `api.ts` (fetch calls), `types.ts`, `constants.ts`, `utils.ts`, `hooks/use<Feature>.ts` (all the state + logic), and `components/` (presentational React). When you extend the UI, follow this structure.

## B3. Prerequisites

- **Node.js 20 LTS or newer** (the project uses ES modules and modern TypeScript; Node 20/22 are safe choices).
- **npm** (ships with Node).
- No global installs are required — everything runs through `npx`/local scripts.

## B4. First-time setup

The backend and frontend have **separate** dependency trees, so you install twice.

```bash
# 1. Clone the public repository
git clone <https://github.com/AbdessalamAithaqi/PIR>
cd PIR-main

# 2. Backend dependencies
npm install

# 3. Generate the Prisma client (the typed DB layer). REQUIRED:
#    src/generated/prisma is gitignored, so it does not exist on a fresh clone.
npx prisma generate

# 4. Create / migrate the SQLite database
npx prisma migrate dev      # applies migrations and creates prisma/dev.db
#   (or, for a quick throwaway DB without migration history: npx prisma db push)

# 5. Frontend dependencies
cd client
npm install
cd ..
```

If you skip step 3, the backend will fail to start with an error about a missing generated client. If you skip step 4, the first API call will fail because the tables do not exist (though note B8: the app also self-creates several tables at runtime as a safety net).

## B5. Running it day to day

You need **two terminals** because the two apps run independently.

```bash
# Terminal 1 — backend API (http://localhost:3000)
npm run dev            # == tsx src/server.ts

# Terminal 2 — frontend (http://localhost:5173)  <-- open THIS in your browser
cd client
npm run dev
```

Open **http://localhost:5173**. The Vite dev server transparently forwards any request to `/api/...` to the backend on port 3000, so you never hard-code the backend URL in frontend code — always `fetch('/api/...')`.

Quick backend health check: `curl http://localhost:3000/api/health` should return `{"status":"ok",...}`.

Useful scripts (backend `package.json`): `npm run dev`, `npm run build` (compiles backend with `tsc` **and** builds the client), `npm run start` (`node dist/server.js`, runs the compiled backend), `npm test` (`vitest run` — but see B16: there are no test files yet).

Useful scripts (client `package.json`): `npm run dev`, `npm run build` (`tsc -b && vite build`), `npm run preview`, `npm run lint`.

## B6. Environment variables

There is **no committed `.env` file** (it is gitignored), and the app runs fine without one because of sensible defaults:

- **`DATABASE_URL`** — read by both `prisma.config.ts` and `src/lib/prisma.ts`. Defaults to `file:./prisma/dev.db`. Set this to point at PostgreSQL in production (but see B8/B15 — switching to Postgres is not just an env change).
- **`PORT`** — backend port, defaults to `3000`.
- **`VITE_API_TARGET`** — the proxy target used by Vite in development, defaults to `http://localhost:3000`. Useful if you run the backend on a different host/port.

Create a `.env` in the repo root if you need to override these. **Recommended next step:** add a committed `.env.example` documenting these three variables.

## B7. The database

### Provider

The schema's datasource provider is **`sqlite`** (not PostgreSQL). The Prisma client is generated to `src/generated/prisma` and instantiated in `src/lib/prisma.ts` using the **better-sqlite3 driver adapter**. This matters: moving to PostgreSQL is a real migration (change the provider, regenerate the client, swap the adapter, re-create migrations), not a one-line config change. See B15.

### Migrations vs. runtime table creation

There are two layers that create tables, and you should understand both:

1. **Prisma migrations** in `prisma/migrations/` — the canonical history: `init_sprint1_schema`, `add_game_participants`, `add_game_loop`, `add_game_parameters`. Apply with `npx prisma migrate dev`.
2. **Runtime self-healing** — `src/routes/games.ts` contains helpers (`ensureParticipantTable`, `ensureGameLoopTables`, `ensureDefaultTeams`, `ensureTeamRosters`, `ensureMarketPlayers`) that issue idempotent `CREATE TABLE IF NOT EXISTS` / `ALTER TABLE` / index statements at request time. This was added so demos could run even if migrations had not been applied. It is convenient but it means **the source of truth for the schema is effectively split** between `schema.prisma` and these raw-SQL helpers. If you change the schema, update **both** places, or you will get drift. A good clean-up task is to remove the runtime DDL once migrations are reliably applied in every environment.

### Resetting the database

Delete `prisma/dev.db` (and `prisma/dev.db-journal`) and re-run `npx prisma migrate dev`. A committed `dev.db` exists in the repo for convenience but should be treated as disposable demo data.

### Inspecting data

`npx prisma studio` opens a browser GUI over the database — very useful for debugging game state.

## B8. System architecture

### Decoupled, two-app design

```
┌────────────────────────┐         HTTP / JSON         ┌────────────────────────┐
│   React SPA (client)   │  ── fetch('/api/...') ──▶   │   Express API (src)    │
│   Vite · Tailwind      │                              │   /api/games/*         │
│   port 5173 (dev)      │  ◀── JSON documents ──       │   port 3000            │
└────────────────────────┘                              └───────────┬────────────┘
                                                                     │ Prisma (typed)
                                                          ┌──────────▼───────────┐
                                                          │   SQLite (dev.db)     │
                                                          └───────────────────────┘
```

In development, Vite proxies `/api` to port 3000 so the browser only ever talks to one origin.

### MVC inside the backend

The backend is a REST-flavoured MVC where the "view" is JSON:

- **Model** — `prisma/schema.prisma`, exposed through the single client in `src/lib/prisma.ts`.
- **Controller** — `src/routes/games.ts`: validates input, enforces rules (e.g. a bid cannot exceed budget), calls helpers, returns JSON.
- **View** — the React frontend.

### The platform / game-rules separation (the key design idea)

This is the project's central architectural bet and the reason it is a good "foundation". Two kinds of logic are deliberately kept apart:

- **Platform engine** (generic, reusable): users and roles, game instances and join codes, participants, team membership, the round-state machine (CREATED/ACTIVE/PAUSED/FINISHED), persistence, and the report/leaderboard plumbing.
- **Game rules** (rugby-specific): player generation, positions, the auction, the scoring formula, the fan/financial dynamics. These live in a set of **helper functions and constants inside `src/routes/games.ts`**.

The promise is that a future team could swap rugby for, say, a logistics or finance scenario by rewriting only the game-rules helpers, leaving the platform untouched. See B20 for how to actually do that — and note B17 for the caveat that the rules are currently *co-located in one file* with the platform rather than physically separated into their own module, which is the first refactor that would make this promise real.

### The "schema avoids theme-specific names" choice

Columns are named generically (`stats` not `tackleScore`, `pubScore` not `billboardCount`) so the same schema survives a theme change. Keep this convention.

## B9. The round lifecycle (state machine)

A `GameInstance` has a `status` and a `currentRound` (0 = not started, 1–6 = rounds). All transitions go through **one endpoint**: `POST /api/games/:gameId/round` with `{ action }`.

```
            create game
                │
                ▼
   status=CREATED, round=0
                │
         action: "launch"  ── sets round = max(round,1), status=ACTIVE,
                │              resets all teams' ready=false, generates market
                ▼
   status=ACTIVE  ◀──────────────┐   (decisions allowed ONLY in this state)
        │                         │
        │ action: "stop"          │ action: "launch" (re-open same round)
        ▼                         │
   status=PAUSED ─────────────────┘
        │
        │ action: "next"  ── simulates current round (idempotent), then:
        ▼
   if round < 6:  status=CREATED, round = round+1, generate next market
   if round = 6:  status=FINISHED, round = 6
```

Key behaviours to know:

- **Decisions (bids, marketing, line-up, ready) are only accepted while `status === "ACTIVE"`.** The relevant endpoints return `409 "Round is not open"` otherwise.
- **After `"next"`, the game returns to `CREATED` (not ACTIVE).** The teacher must press **Launch** again to open the next round. This is by design but is a common point of confusion.
- **Simulation is idempotent per round.** `simulateRound` first checks whether any `MatchResult` rows already exist for that round and returns early if so, so you cannot double-simulate the same round.
- **`"next"` does not check `status`.** Because simulation is gated only by "are there results for this round yet", pressing **Move to next round** repeatedly will fast-forward through rounds, simulating each with whatever decisions exist (often none → default line-ups). This is a useful debugging shortcut but also a footgun in class; consider guarding it (see B17/B18).

## B10. Complete REST API reference

All routes are mounted under **`/api/games`** (in `src/server.ts`) and defined in `src/routes/games.ts`. There is also a health check at `GET /api/health`. Every handler returns JSON; errors return an `{ "error": "..." }` body with an appropriate status code. There is **no authentication or authorisation on any endpoint** in this version — IDs are passed in the body/query and trusted.

| # | Method & path | Purpose |
|---|---|---|
| 1 | `GET /api/games` | List games. Optional `?ownerId=` filter (the dashboard uses `ownerId=teacher-123`). |
| 2 | `POST /api/games` | Create a game (also creates 4 teams, rosters, default parameters). |
| 3 | `GET /api/games/:gameId` | Full game state: game, enriched teams, joined participants, current-round market, bids, marketing decisions, all match results, parameters. |
| 4 | `DELETE /api/games/:gameId` | Delete a game and all related data (cascades). |
| 5 | `POST /api/games/join` | Student joins via join code; upserts the user and records a participant. |
| 6 | `GET /api/games/:gameId/assignment?studentId=` | Returns whether a student has been assigned to a team, and which. |
| 7 | `PUT /api/games/:gameId/parameters` | Save the four difficulty parameters. |
| 8 | `POST /api/games/:gameId/teams/:teamId/members` | Assign (or move) a joined student to a team. |
| 9 | `DELETE /api/games/:gameId/participants/:studentId/assignment` | Unassign a student (keeps them in the joined list). |
| 10 | `POST /api/games/:gameId/teams/:teamId/lineup` | Save the starting line-up (1–15 starters). ACTIVE only. |
| 11 | `POST /api/games/:gameId/teams/:teamId/bids` | Place/update a sealed bid for a market player. ACTIVE only. |
| 12 | `POST /api/games/:gameId/teams/:teamId/marketing` | Save advertising/merch investment (0–2 each). ACTIVE only. |
| 13 | `POST /api/games/:gameId/teams/:teamId/ready` | Mark a team ready. ACTIVE only. |
| 14 | `POST /api/games/:gameId/round` | Round lifecycle: `{ action: "launch" \| "stop" \| "next" }`. |

### Selected request/response details

**`POST /api/games`** — body `{ name, ownerId }`. Creates the game with a unique 6-char join code, four teams (`Team 1`–`Team 4`), full rosters and default parameters. If `ownerId` doesn't exist as a user it is created as a "Mock Teacher". Returns `201 { game }`.

**`POST /api/games/join`** — body `{ joinCode, studentId, studentName }`. The join code is upper-cased and trimmed. Rejects with `404` if no such game, `409` if the game's status is not `CREATED` or `ACTIVE`. Upserts the user as a `STUDENT` and inserts a `GameParticipant`. Returns `{ game }`.

**`GET /api/games/:gameId`** — the workhorse the whole UI polls. Returns `{ game, teams, participants, market, bids, marketingDecisions, results, parameters }`. `teams` are "enriched" with their members and full roster (each roster player includes a `rating` alias of `stats`).

**`POST .../bids`** — body `{ playerId, amount }`. Validates: round is ACTIVE; amount > 0; amount ≤ team budget; the player is on the current round's market and unsold; amount ≥ the player's starting price. Upserts one bid per (team, player, round). **Money is not deducted at bid time** — only reserved conceptually and charged at simulation. A team can therefore place several individually-affordable bids that collectively exceed its budget; at resolution each is checked again against the live budget and skipped if unaffordable.

**`POST .../marketing`** — body `{ pubInvestment, merchInvestment }`, each clamped to `0..2`. Upserts one marketing decision per (team, round). Cost is charged at simulation, not at submission.

**`POST .../lineup`** — body `{ starterPlayerIds: string[] }`, length 1–15, all must be owned by the team. Clears existing starters then marks the given players as starters in order.

**`POST .../round`** — see B9 for the full state machine.

## B11. Data model reference

Eleven entities (`prisma/schema.prisma`), in three conceptual layers.

**Institutional layer**

- **User** — `id` (uuid), `name`, `role` (`"TEACHER"` | `"STUDENT"`). Owns games; participates in games; belongs to teams. Role is a plain string, not an enum.
- **GameInstance** — `id`, `name`, `joinCode` (unique), `status` (`CREATED`/`ACTIVE`/`PAUSED`/`FINISHED`), `currentRound` (0–6), `ownerId` → User. Has teams, participants, parameters, players, matchResults.
- **GameParameter** — one-to-one with a game. `injuryChance` (12), `fanGain` (20), `financialGrowth` (8), `luckFactor` (50). All clamped 0–100 on write.

**Membership layer**

- **GameParticipant** — unique `(userId, gameId)`. Every student who entered a join code, *whether or not* assigned to a team. This is what powers the "joined but waiting" list in the drag-and-drop assignment screen.
- **TeamMember** — unique `(userId, teamId)`. The actual assignment of a student to one of the four teams.

**In-game state layer**

- **Team** — `name`, `budget` (default 50000), `fans` (1000), `pubScore`, `merchScore` (0–10 each), `points`, `wins`, `draws`, `losses`, `pointDiff`, `ready`. Belongs to a game.
- **Player** — `name`, `position`, `stats` (skill, int), `price`, `roundNumber`, `market` (bool), `sold` (bool). Belongs to a game, so two games are fully isolated even in the same class.
- **TeamPlayer** — junction Team↔Player, unique `(teamId, playerId)`, with `starter` (bool) and `slot` (ordering).
- **Bid** — `amount`, `roundNumber`, per (team, player); unique `(teamId, playerId, roundNumber)`.
- **MarketingDecision** — `pubInvestment`, `merchInvestment`, per round; unique `(teamId, roundNumber)`.
- **MatchResult** — closes the loop: `roundNumber`, `scoreA`, `scoreB`, `resultA`, `resultB`, `fanDeltaA/B`, `moneyDeltaA/B`, `teamAId`, `teamBId`. The Report tab is a **replay of these stored rows**, not a recomputation — which is exactly why games can be paused and resumed unambiguously.

Note: `MatchResult.teamAId`/`teamBId` are stored as plain strings, **not** Prisma relations (no foreign-key relation declared), so you cannot `include` them via Prisma — the code joins manually. Tightening these into real relations is a reasonable clean-up.

## B12. The game engine: every formula, exactly as coded

All of the following live in `src/routes/games.ts`. The constants are at the top of the file. **These are the numbers to tune if you want to rebalance the game.**

### Starting constants

```
START_TEAM_MONEY   = 50000     // each team's opening budget
START_FAN_NUMBER   = 1000      // each team's opening fans
MAX_FAN_NUMBER     = 1000000   // hard cap on fans
INITIAL_PLAYER_STATS = 40      // every starting/roster player's skill
4 teams, 6 rounds, 15 market players generated per round
```

### Initial rosters

Each team is given the **full list of 23 roster players** (`rosterNames` × `positions`), all with skill = 40. The **first 15 are starters**, the remaining 8 are bench. (Note: the written report says "eight-player rosters" — that is inaccurate; the code creates 23 players with 15 starters.) Players are theme flavour names (Tesseyre, Siciliano, …).

### Market generation (per round)

15 players are generated from `marketNames` (French internationals: Ramos, Dupont, Ntamack, …), named `"<Name> R<round>"`. For each:

```
stats = 40 + floor( random() * round * 10 )      // higher rounds expose stronger talent
price = round( stats² / 10 + round * 100 )        // quadratic in skill, linear in round
```

(The report writes the skill range as `40 + round × rand(1,10)`; the code is the form above, `40 + floor(random() × round × 10)`.)

### Sealed-bid auction resolution

For each market player, the highest bid that is `>= player.price` wins (ties broken by earliest submission). At resolution the winner's **live budget is re-checked**; if insufficient, that win is skipped. The won player is marked `sold`, added to the team as a non-starter.

### Marketing

Each of `pubScore` and `merchScore` is capped at 10, and each round a team may add **0, 1 or 2** to each track. Cost is computed step-by-step so the marginal cost rises:

```
marketingCost(round, currentScore, investments):
    cost = 0
    for step in 0 .. investments-1:
        cost += round * 7000 * (1 + min(10, currentScore + step) / 10)
    return round(cost)
```

So early investments are cheap and over-investing late is expensive. Cost is charged from budget at simulation time.

### Match score

For each team in a match:

```
avgStats   = average skill of its STARTERS                  (defaults to 40 if none)
luck       = deterministicLuck(teamId, round)               // in [0,1], see below
injuryPenalty = (luck*100 < injuryChance) ? 5 : 0           // low-luck → injury risk
adjStats   = max(0, avgStats - injuryPenalty)
luckWeight = 0.2 * (luckFactor / 50)                        // default luckFactor=50 → 0.2

team_score = 0.5 * (adjStats / 100)
           + 0.2 * (fans / 1_000_000)
           + 0.1 * ((pubScore + merchScore) / 20)
           + luck * luckWeight
```

The displayed match scores are `round(team_score * 100)`. Higher score wins (3 pts), tie 1 pt, loss 0. Over the six rounds a fixed round-robin (`roundRobinPairs`) pairs the four teams so each meets each other twice.

### Deterministic luck

```
deterministicLuck(teamId, round):
    seed = sum(charCodes of teamId) + round * 97
    return (sin(seed) + 1) / 2        // stable in [0,1] for a given (team, round)
```

Because it is seeded by team id + round, re-simulating a round yields identical results — this is the reproducibility guarantee the project relies on. (If you reset team ids, luck values change.)

### Fan and financial dynamics (after each match)

```
fanGainMultiplier       = fanGain / 20            (default 1)
financialGrowthMultiplier = financialGrowth / 8   (default 1)

fanGain  = round( fans * (0.05 + (pubScore + merchScore)/50) * fanGainMultiplier )
fanDelta = fanGain + { win:+5000, draw:+2000, loss:-1000 }
nextFans = clamp(0, 1_000_000, fans + fanDelta)

revenue   = round( round * 5000 * (nextFans / 5000) * financialGrowthMultiplier )
matchBonus = win ? round * 10000 : 0
moneyDelta = revenue + matchBonus
```

This is the intended feedback loop: results → fans → revenue → better players → results. The cap and the modest, non-multiplicative bonuses prevent the runaway "win once, become unbeatable" dynamic that early prototypes had.

### Where to tune what

- Want a more skill-driven, less random game? Lower `luckFactor` (per game, in Parameters) or reduce the `0.2` luck weight / raise the `0.5` skill weight in `calculateTeamScore`.
- Want richer teams? Raise `financialGrowth` (per game) or the `5000` revenue constant.
- Want a tighter market? Adjust the `stats`/`price` formulas in `ensureMarketPlayers`.

## B13. The frontend

### Routing (`App.tsx`)

```
/                       → Home (choose Teacher or Student)
/teacher                → TeacherDashboard (list/create/delete games)
/teacher/games/:gameId  → TeacherGamePage (5 tabs)
/student                → StudentJoinPageWithGuards (join → waiting → gameplay)
```

The whole app is wrapped in an `I18nProvider` and a floating `LanguageSelector` (EN/FR).

### Feature folders

Each feature owns its data-fetching, state and UI:

- **teacher-dashboard** — `useTeacherDashboard` hook loads games for the hard-coded owner `teacher-123`, supports create/delete.
- **teacher-game** — `useTeacherGame` hook loads one game and exposes assign/unassign, save-parameters, and round actions. Tabs: `TeamsTab` (drag-and-drop), `ParametersTab`, `RoundManagementTab`, `ReportTab`, `LeaderboardTab`.
- **student-game** — `useStudentGame` hook is the largest: it manages the join → waiting → dashboard screens, the five tabs, and **polls the backend** (every ~3s while waiting for assignment, and on an interval while playing) so the student view stays in sync as the teacher acts. Tabs: `TeamTab`, `MarketTab`, `MarketingTab`, `LeaderboardTab`, `ReportTab`.

Because there is no shared global store, the UI is kept fresh by **polling `GET /api/games/:id`**. That is simple and works for class sizes, but it is the obvious candidate for replacement by websockets/server-sent events if you want instant updates (see B18).

### i18n

`client/src/i18n/index.tsx` holds a `translations` record keyed by a `TranslationKey` union, for `"en"` and `"fr"`. Components call `t("some.key")`. The chosen language is stored in `localStorage`. **When you add UI text, add the key to both languages** or the type-checker will complain.

### Demo state in the browser

The student identity and joined-game are kept in `localStorage`:
- `pir-demo-student-id` — a generated `student-<uuid>` (created on first visit).
- `pir-demo-joined-game` — the game the student last joined.

These are demo conveniences and should be replaced by real session/identity once CAS is in.

## B14. Authentication: what exists and what is missing

**What exists:** a *demo role-selection* flow. On the home page you pick Teacher or Student. The teacher dashboard simply uses the constant owner id `teacher-123` (`features/teacher-dashboard/constants.ts`). A student gets a random id in `localStorage`. There is no password, no session, and no server-side check of who you are.

**What is missing (despite what the report implies):** there is **no CAS code in the repository.** `client/src/lib/auth.ts` is an **empty file**, and there are no CAS references anywhere in `src/` or `client/src/`. The report's statement that "the integration is ready in the application code and only requires CSN configuration" does not match the repo — treat CAS as **not started**. This is the single most important correction for the next team, and the top roadmap item.

## B15. Building and deploying for INSA (production)

The CSN (Centre des Services Numériques) provides a virtual server with PostgreSQL, requires access only from inside the INSA network or via VPN, and requires authentication through the institutional **CAS** module. To get there from the current state, expect to do the following (none of which is fully done yet):

1. **Switch the database to PostgreSQL.** Change the provider in `schema.prisma` to `postgresql`, set `DATABASE_URL` to the CSN Postgres instance, swap the better-sqlite3 adapter in `src/lib/prisma.ts` for the Postgres setup (or remove the driver adapter), and regenerate migrations (the existing migration SQL is SQLite-flavoured). Also retire or port the runtime `CREATE TABLE` helpers in `games.ts`, which assume SQLite.
2. **Implement CAS authentication.** Add a real login that maps a CAS identity to a `User` with the right role, replace the `teacher-123` constant and the localStorage student id, and add authorisation checks to the endpoints (currently anyone can call any route).
3. **Serve the built frontend.** `npm run build` produces a backend bundle (`dist/`) and a client bundle (`client/dist/`). The current `server.ts` serves **only the API** — it does not serve the client build. In production you must either have Express serve `client/dist` as static files (plus an SPA fallback to `index.html`), or front both with a reverse proxy (e.g. nginx). Decide and document this.
4. **Containerise (optional but recommended).** The report describes a Docker / docker-compose setup as a goal; **there is no Dockerfile or compose file in the repo yet.** Adding them (one service for the API, one for Postgres, optionally one for the static client) would make the "bring it back online with one command" goal real and is a great, self-contained task for a new team member.
5. **Network/VPN.** Deployment must respect the INSA-network-only constraint; coordinate with CSN.

## B16. Testing status (read this honestly)

- The backend `package.json` declares `"test": "vitest run"` and includes `vitest` and `supertest` as dependencies. **However, there are no test files in the repository** (no `*.test.ts` / `*.spec.ts` anywhere). Running `npm test` will simply find nothing to run. The report's description of "formal tests on the simulation engine and round-orchestration state machine" describes an *intention*, not committed code.
- `src/test_prisma.ts` is a throwaway manual script that prints users; it is not a test.
- **Highest-value testing to add first:** unit tests for the pure functions in `games.ts` — `playerPrice`, `marketingCost`, `deterministicLuck`, `calculateTeamScore`, the fan/finance update, and `roundRobinPairs` — because a fairness bug there has the worst educational consequences. Then an end-to-end test (supertest) that drives a full six-round game through the API.

## B17. Known limitations and gotchas

A candid list so you do not rediscover these the hard way:

1. **No real authentication or authorisation.** Every endpoint trusts the ids it is given. Anyone can create games, join, or call teacher endpoints. (B14.)
2. **CAS is not implemented at all**, despite the report's wording. `auth.ts` is empty. (B14.)
3. **The database is SQLite, not PostgreSQL.** Production DB work is unstarted. (B15.)
4. **No Docker/compose files** exist yet, contrary to the report. (B15.)
5. **The schema lives in two places** — `schema.prisma` *and* the runtime `CREATE TABLE`/`ALTER TABLE` helpers in `games.ts`. Change both or get drift. (B7.)
6. **All backend logic is in one ~1500-line file** (`games.ts`). The platform/rules separation is conceptual, not physical. Splitting it (e.g. `platform/` for lifecycle/persistence, `rugby/` for rules and formulas) is the refactor that makes the "swap the theme" promise real. (B8, B20.)
7. **`"next"` ignores game status and is idempotent only per round**, so repeated clicks fast-forward and simulate rounds with whatever (possibly empty) decisions exist. Add a guard. (B9.)
8. **Bids do not reserve money at submission time**, only at resolution; teams can over-commit and have bids silently skipped. Decide whether that is the intended UX. (B10.)
9. **`MatchResult` team references are loose strings, not Prisma relations** — manual joins required. (B11.)
10. **The frontend keeps in sync by polling**, not pushing. Fine for now; revisit for scale/instant feedback.
11. **The teacher owner id is hard-coded** (`teacher-123`); all teachers currently share one identity. (B13.)
12. **Report vs. code discrepancies** to trust the code on: roster size (23 players/15 starters, not 8), the exact market `stats` formula, and the auth/Postgres/Docker claims above.
13. **No CI, no linting gate on the backend, no `.env.example`.** Easy wins to add.

## B18. Roadmap: what future cohorts should build, in priority order

Tackle roughly top-to-bottom; the first three are what turn this from "a working demo" into "a tool a class can rely on".

**Tier 1 — make it real and deployable**
1. **CAS authentication + roles**, replacing demo role selection and the hard-coded ids; add authorisation to endpoints.
2. **PostgreSQL migration** (provider, adapter, regenerated migrations) and retire the runtime DDL.
3. **Production serving + deployment**: serve the client build, add Dockerfile/compose, deploy to the CSN server respecting the VPN constraint.

**Tier 2 — make it trustworthy**
4. **Automated tests**: unit-test the engine's pure functions; one full-game end-to-end test (B16).
5. **Refactor `games.ts`** into a platform module and a rugby-rules module to honour the separation the design promises (B20).
6. **Guard the round actions** (block `next`/`launch` from invalid states; confirm before fast-forwarding).

**Tier 3 — make it richer (the fun part the report flags)**
7. **Deeper player market**: positional attributes and multiple skills instead of a single `stats`; consider live auctions instead of sealed-bid.
8. **Risk events**: develop the `injuryChance` sketch into a real injuries/scandals sub-system with visible consequences.
9. **Match visualisation**: a short, animated/real-time match resolution instead of a pure formula reveal, to strengthen engagement.
10. **Real-time sync** (websockets/SSE) to replace polling.
11. **The original ambition**: because the engine is theme-agnostic, instantiate a *business* scenario on the same platform — bringing the project full circle to SIMGEST's brief.

## B19. How to add a feature (worked example)

The repo's existing README captures the philosophy well: build **back-to-front** in four steps. Here is a concrete example — *adding a "stadium capacity" global parameter that boosts revenue.*

1. **Data (Prisma).** Add `stadiumCapacity Int @default(50)` to the `GameParameter` model in `schema.prisma`. Run `npx prisma migrate dev` (and mirror the column in the runtime DDL in `games.ts` until that is retired). Add it to the `DEFAULT_PARAMETERS` constant and the `clampParameter` normalisation.
2. **Backend (Express).** It already flows through `PUT /:gameId/parameters` if you add it to `normalizeParameters`. Use it in the revenue formula inside `updateTeamAfterMatch`, e.g. multiply revenue by `(stadiumCapacity / 50)`.
3. **Frontend (React).** Add a labelled input to `teacher-game/components/ParametersTab.tsx`, a translation key in `i18n/index.tsx` (EN + FR), and wire it through the `useTeacherGame` save handler.
4. **Verify.** Create a game, change the parameter, run a round, confirm the revenue change appears in the Report.

The same loop applies to any feature: define the data, expose/consume it in the API, build the UI, connect with a `fetch` to `/api/...`.

## B20. How to re-theme the game away from rugby

This is the project's headline extensibility claim. Today the rugby logic is co-located in `games.ts`, so re-theming means editing that file (and ideally extracting it first). The pieces that are rugby-specific and would change:

- **Constants**: `rosterNames`, `positions`, `marketNames`, `INITIAL_PLAYER_STATS`, the starting money/fans.
- **Generation**: `ensureTeamRosters`, `ensureMarketPlayers`, `playerPrice`.
- **Rules/formulas**: `calculateTeamScore`, `marketingCost`, `updateTeamAfterMatch`, `roundRobinPairs`, the fan-bonus / points tables.

Everything else — users, roles, game instances, join codes, participants, team membership, the round-state machine, persistence, the report/leaderboard plumbing, the whole frontend shell — is platform and would stay. The clean way to do a new theme (e.g. a classic business simulation) is: **(1)** extract the rugby items above into a `rugby/rules.ts` module behind a small interface (generate players, price a player, score a team, resolve fan/finance), **(2)** implement a second module (`business/rules.ts`) against the same interface, **(3)** select the active rules module per game. That refactor (roadmap item 5) is the work that makes "swap the theme" a one-module change rather than a rewrite.

## B21. Glossary

- **PIR** — Projet d'Initiation à la Recherche, the INSA course this was built for.
- **SIMGEST** — the legacy proprietary business simulation this project aims to replace.
- **CAS** — Central Authentication Service, INSA's institutional single-sign-on (to be integrated).
- **CSN** — Centre des Services Numériques, INSA's IT service providing the production server, Postgres and CAS.
- **Game instance** — one playable game with a join code, four teams and six rounds.
- **Round lifecycle** — the CREATED → ACTIVE → (PAUSED) → simulate → next states (B9).
- **Sealed-bid auction** — bidding where teams cannot see each other's bids; highest valid bid wins at round close.
- **Deterministic luck** — a reproducible pseudo-random value per (team, round) ensuring identical inputs give identical results.
- **pubScore / merchScore** — a team's advertising and merchandising levels (0–10), grown by marketing investment.

---

## Acknowledgements & contacts

Built by Abdessalam Aithaqi, Armand Ghionda, George Papailiopoulos, Daniel De Almeida and Domagoj Jenjic, with the guidance of **Oumaima El Haddadi** (technical supervisor and client) and **Paul Scanlan** (pedagogical client), and the **CSN** of INSA Toulouse for hosting and infrastructure advice. The accompanying article (`AITHAQI_GHIONDA_DEALMEIDA_PAPAILIOPOULOS_JENJIC_PIR.pdf`) gives the research framing and literature context; **this document is the operational truth for running and continuing the project**, and where the two differ, trust this one (and the code).

*Handover prepared for the final wrap-up meeting, 28 May 2026.*
