import express from "express";
import cors from "cors";
import authRouter from "./routes/auth.js";
import gamesRouter from "./routes/games.js";

const app = express();
const port = process.env.PORT || 3000;

app.set("trust proxy", 1);
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running!" });
});

app.use("/api/auth", authRouter);
app.use("/api/games", gamesRouter);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
