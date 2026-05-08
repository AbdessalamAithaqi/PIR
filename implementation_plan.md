# Goal Description

The goal is to build a web-based, multiplayer serious game for INSA business classes simulating rugby team management. We will use your **existing full-stack setup** (Node.js + Express backend and Vite + React frontend) instead of starting over. 

We will disregard deployment for now and focus purely on getting the core functionality working locally. 

Projects of this nature usually start from the **data layer (Database Schema) upwards**. Before we can build UI or game logic, we need the database to be able to store Users, Game Instances, and Teams.

## User Review Required

> [!IMPORTANT]
> - Please review the proposed **First Implementation Step** below. Does starting with the Database Schema and Teacher "Create Game" flow align with your expectations?
> - Let me know if you want to use a specific UI library on the frontend (like `shadcn/ui` or standard Tailwind components).

## Open Questions

> [!WARNING]
> - For authentication in this decoupled setup, do you want to use a simple "mock login" (e.g., typing in a name and clicking "I am a Teacher" or "I am a Student") for now to speed up development?

## Proposed Changes (Adapted to Current Setup)

### Architecture
- **Backend (`/src`)**: Node.js + Express with TypeScript. We will use Prisma as the ORM to interact with a PostgreSQL database.
- **Frontend (`/client`)**: Vite + React with TypeScript and Tailwind CSS v4.

### The First Thing to Implement
The very first thing we need to build is the **Foundation and the Game Creation Flow**. Here is the step-by-step plan to start:

#### 1. Define the Database Schema (Prisma)
We will define the Sprint 1 entities in `prisma/schema.prisma`:
- **User**: Represents teachers and students (`id`, `name`, `role`).
- **GameInstance**: Represents a single tournament (`id`, `joinCode`, `name`, `ownerId`, `status`).
- **Team**: The 4 teams in a game (`id`, `name`, `gameId`).

#### 2. Backend: Game Management API
- Create an Express route `POST /api/games` to create a new game instance.
- Create an Express route `GET /api/games` to list games for the teacher.
- Implement the logic to automatically generate a unique 6-character `joinCode` when a game is created.

#### 3. Frontend: Teacher Dashboard Foundation
- Set up React Router in the `/client` folder.
- Build the "Teacher Overview Page" (as per your wireframes).
- Implement a simple "Create Game" button that calls the backend API and displays the newly created game and its `joinCode`.

### Subsequent Steps (Later)
Once the Game Creation flow is done, we will move on to:
- **Student Join Flow**: Frontend screen to enter the `joinCode` and Backend API to validate it.
- **Team Assignment**: Teacher drag-and-drop UI to assign waiting students to the 4 teams.

## Verification Plan

### Automated Tests
- We will write a quick backend test using Vitest (which is already in your `package.json`) to ensure the Game Creation API works and generates the correct data in Prisma.

### Manual Verification
- Run both the backend (`npm run dev`) and frontend (`npm run dev` in `/client`).
- Open the Teacher Overview page in the browser.
- Click "Create Game", verify a new game appears in the list with a valid join code.
- Check the database (using `npx prisma studio`) to confirm the data was saved properly.
