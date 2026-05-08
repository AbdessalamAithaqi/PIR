import express from "express";
import cors from "cors";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

import gamesRouter from "./routes/games.js";

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running!" });
});

app.use("/api/games", gamesRouter);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
