# Rugby Game Manager - Developer Guide

Welcome to the decoupled architecture of the Rugby Game Manager! This project is split into two completely separate domains: a **Node.js/Express Backend** and a **Vite/React Frontend**. 

This guide explains the project structure and defines the exact workflow you should follow when adding new features, pages, or data logic.

---

## 🏗️ Project Structure

```text
/PIR 
├── package.json        <-- Express & Prisma dependencies (Backend)
├── prisma/             
│   └── schema.prisma   <-- Your Database Schema! Define tables here.
├── src/                
│   ├── server.ts       <-- Express Server initialization
│   └── routes/         <-- API route handlers (e.g., games.js, teams.js)
│
└── client/             <-- THE FRONTEND APPLICATION
    ├── package.json    <-- React & Tailwind dependencies
    ├── vite.config.ts  <-- Configured to proxy /api traffic to our backend
    └── src/            
        ├── index.css   <-- Tailwind v4 import
        ├── App.tsx     <-- React Root Component (Add Routing here later)
        ├── components/ <-- Reusable UI (Buttons, Cards, Modals)
        └── pages/      <-- Full page components (Dashboard, GameView)
```

---

## 🚀 How to Run the Project

Because the frontend and backend are decoupled, you need to run **two terminal tabs** during development:

1. **Start the Backend API:** 
   Open a terminal in the root `/PIR` directory and run:
   ```bash
   npx tsx src/server.ts
   ```
   *(Runs on http://localhost:3000)*

2. **Start the Frontend UI:** 
   Open a second terminal, navigate into the `/client` directory, and run:
   ```bash
   cd client
   npm run dev
   ```
   *(Runs on http://localhost:5173 - this is where you open your browser!)*

## INSA CAS Authentication

The app supports two authentication modes:

- `AUTH_MODE=demo` for local development. `/api/auth/login?role=TEACHER&next=/teacher` creates a demo teacher session, and `/api/auth/login?role=STUDENT&next=/student` creates a demo student session.
- `AUTH_MODE=cas` for INSA deployment. Users are redirected to INSA CAS, then returned to `/api/auth/cas/callback`.

Recommended server environment for the CSN host:

```bash
AUTH_MODE=cas
APP_BASE_URL=https://serious-game.insa-toulouse.fr
CAS_BASE_URL=https://cas.insa-toulouse.fr/cas
SESSION_SECRET=<long-random-secret>
TEACHER_IDS=<comma-separated-insa-logins-that-can-create-games>
DATABASE_URL=<deployment database url>
```

CAS identifies the user. The app decides whether they are a teacher by checking `TEACHER_IDS`; everyone else is treated as a student. Students still use the professor's join code after signing in.

---

## 🛠️ The 4-Step Feature Workflow

When building a new feature (for example, "Adding a Player Profile Page"), you should always build "Back-to-Front" by following this exact 4-step loop.

### Step 1: Define the Data Structure (Prisma)
Before you write any code or design any buttons, figure out what data you need to store. Open `prisma/schema.prisma` and define a new model.

```prisma
// prisma/schema.prisma
model Player {
  id     Int    @id @default(autoincrement())
  name   String
  teamId Int
}
```
*Run `npx prisma db push` to instantly generate the actual SQL tables.*

### Step 2: Build the Backend Route (Express)
Now that the database knows what a Player is, you need to expose that data so the frontend can retrieve it. Go to `src/server.ts` (or `src/routes/players.ts` if you organize your files) and create an endpoint.

```typescript
// src/server.ts
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

app.get('/api/players', async (req, res) => {
  // Fetch all players from PostgreSQL using Prisma
  const players = await prisma.player.findMany();
  // Express sends it back to the client as JSON
  res.json(players);
});
```

### Step 3: Build the Frontend UI (React + Tailwind v4)
Leave the backend alone now. Open `/client/src/components/` and build a shiny new React component. Use dummy data temporarily so you can focus entirely on styling with Tailwind classes.

```tsx
// client/src/components/PlayerList.tsx
export function PlayerList() {
  return (
    <div className="p-4 bg-gray-100 rounded-lg shadow-md">
       <h2 className="text-xl font-bold text-blue-600">Player Roster</h2>
       {/* List will go here */}
    </div>
  )
}
```

### Step 4: Wire them together (React Hooks)
Finally, connect your React frontend to your Express backend. You will use `useEffect` to trigger a `fetch()` request to `/api/players` the moment the page loads, and `useState` to update the screen once the data comes back.

Because we configured Vite with an API proxy, you don't need to specify `http://localhost:3000` in your fetch calls. Just call `/api/...` directly!

```tsx
// client/src/components/PlayerList.tsx
import { useState, useEffect } from 'react';

export function PlayerList() {
  // 1. Setup State to hold the backend data
  const [players, setPlayers] = useState([]);

  // 2. Fetch the data right when the component loads
  useEffect(() => {
    fetch('/api/players')
      .then(res => res.json())
      .then(data => setPlayers(data));
  }, []);

  // 3. Render the dynamic data
  return (
    <div className="p-4 bg-gray-100 rounded-lg shadow-md">
       <h2 className="text-xl font-bold text-blue-600">Player Roster</h2>
       
       <ul className="mt-4 space-y-2">
         {players.map(player => (
           <li key={player.id} className="p-2 bg-white border border-gray-300 rounded">
             {player.name}
           </li>
         ))}
       </ul>
       
    </div>
  )
}
```

## 🧠 Core Philosophy
* **React** handles what things look like and clicking interactions.
* **Express** handles complex game rules, math, and validation.
* **Prisma** exclusively handles talking to the PostgreSQL database. 

By strictly following these 4 steps every time you add a feature, your project will remain incredibly clean and scalable!
