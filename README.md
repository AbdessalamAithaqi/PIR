# Rugby Game Manager - Developer Guide

This project uses a decoupled architecture:

- **Backend:** Node.js + Express + Prisma + SQLite
- **Frontend:** Vite + React + Tailwind

The backend and frontend are separate apps. During development, both must be running at the same time.

---

## Project Structure

```text
/PIR
├── package.json              <-- Backend dependencies and scripts
├── .env                      <-- Backend environment variables
├── dev.db                    <-- Local SQLite database
├── prisma/
│   └── schema.prisma         <-- Database schema
├── prisma.config.ts          <-- Prisma configuration
├── src/
│   ├── server.ts             <-- Express server entry point
│   ├── lib/
│   │   └── prisma.ts         <-- Prisma client setup
│   ├── routes/               <-- API route handlers
│   └── generated/prisma/     <-- Generated Prisma client
│
└── client/
    ├── package.json          <-- Frontend dependencies and scripts
    ├── vite.config.ts        <-- Vite config, proxies /api to backend
    └── src/
        ├── index.css         <-- Tailwind import
        ├── App.tsx           <-- React root component / routing
        ├── components/       <-- Reusable UI components
        └── pages/            <-- Full page components
```

---

## Required Node Version

The frontend uses recent versions of Vite, React Router, and Tailwind.

You need **Node 20.19+**.

Check your version:

```bash
node -v
```

If your version is too old, install Node 20 using `nvm`:

```bash
nvm install 20
nvm use 20
nvm alias default 20
```

Then check again:

```bash
node -v
```

---

## First-Time Setup

From the project root:

```bash
cd ~/Documents/INSA/PIR/PIR
```

Install backend dependencies:

```bash
npm install
```

Create the `.env` file if it does not already exist:

```bash
echo 'DATABASE_URL="file:./dev.db"' > .env
```

Generate the Prisma client:

```bash
npx prisma generate
```

Synchronize the SQLite database with the Prisma schema:

```bash
npx prisma db push
```

Then install frontend dependencies:

```bash
cd client
npm install
```

---

## How to Run the Project

You need **two terminals**.

### Terminal 1: Backend

From the project root:

```bash
cd ~/Documents/INSA/PIR/PIR
npm run dev
```

The backend should run on:

```text
http://localhost:3000
```

### Terminal 2: Frontend

From the frontend folder:

```bash
cd ~/Documents/INSA/PIR/PIR/client
npm run dev
```

The frontend should run on:

```text
http://localhost:5173
```

Open this in the browser:

```text
http://localhost:5173
```

---

## Common Errors

### 1. Vite says Node is too old

Error:

```text
Vite requires Node.js version 20.19+ or 22.12+
```

Fix:

```bash
nvm install 20
nvm use 20
```

Then reinstall frontend dependencies:

```bash
cd client
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

### 2. Frontend says “Failed to load games”

Terminal error:

```text
http proxy error: /api/games
Error: connect ECONNREFUSED 127.0.0.1:3000
```

This means the frontend is running, but the backend is not.

Fix: start the backend in another terminal:

```bash
cd ~/Documents/INSA/PIR/PIR
npm run dev
```

---

### 3. Backend cannot find Prisma client

Error:

```text
Cannot find module '../generated/prisma/client.js'
```

Fix:

```bash
cd ~/Documents/INSA/PIR/PIR
npx prisma generate
npm run dev
```

---

### 4. Prisma says datasource.url is required

Error:

```text
The datasource.url property is required
```

Fix:

```bash
cd ~/Documents/INSA/PIR/PIR
echo 'DATABASE_URL="file:./dev.db"' > .env
npx prisma db push
```

---

## Database Workflow

The database schema is defined in:

```text
prisma/schema.prisma
```

When you change the schema, run:

```bash
npx prisma generate
npx prisma db push
```

For this hackathon, we use:

```bash
npx prisma db push
```

instead of migrations because it is faster for quick development.

In a production project, we would use proper Prisma migrations.

---

## Feature Workflow

When adding a new feature, build it back-to-front.

### Step 1: Define the Data Structure

Edit:

```text
prisma/schema.prisma
```

Example:

```prisma
model Player {
  id         String @id @default(uuid())
  name       String
  position   String
  skillScore Int
}
```

Then run:

```bash
npx prisma generate
npx prisma db push
```

---

### Step 2: Build the Backend Route

Create or edit a route file in:

```text
src/routes/
```

Example:

```ts
app.get("/api/players", async (req, res) => {
  const players = await prisma.player.findMany();
  res.json(players);
});
```

Backend responsibilities:

```text
validation
database access
game rules
auction logic
match simulation
round closing
```

---

### Step 3: Build the Frontend UI with Mock Data

Create the page or component in:

```text
client/src/pages/
client/src/components/
```

Use temporary fake data first so the UI can be built without waiting for the backend.

Example:

```tsx
export function PlayerList() {
  const players = [
    { id: "1", name: "Player A", skillScore: 80 },
    { id: "2", name: "Player B", skillScore: 75 },
  ];

  return (
    <div className="p-4 rounded-lg shadow-md bg-white">
      <h2 className="text-xl font-bold">Player Roster</h2>

      <ul className="mt-4 space-y-2">
        {players.map((player) => (
          <li key={player.id} className="p-2 border rounded">
            {player.name} - {player.skillScore}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

### Step 4: Wire Frontend to Backend

Because Vite proxies `/api` to the backend, frontend fetch calls should use:

```ts
fetch("/api/...")
```

Do **not** write:

```ts
fetch("http://localhost:3000/api/...")
```

Example:

```tsx
import { useEffect, useState } from "react";

export function PlayerList() {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    fetch("/api/players")
      .then((res) => res.json())
      .then((data) => setPlayers(data));
  }, []);

  return (
    <div className="p-4 rounded-lg shadow-md bg-white">
      <h2 className="text-xl font-bold">Player Roster</h2>

      <ul className="mt-4 space-y-2">
        {players.map((player: any) => (
          <li key={player.id} className="p-2 border rounded">
            {player.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

## Core Philosophy

- **React** handles pages, components, styling, and user interaction.
- **Express** handles API routes, validation, and game logic.
- **Prisma** handles database access.
- **SQLite** is used for local hackathon development.
- **Vite** serves the frontend and proxies `/api` calls to the backend.