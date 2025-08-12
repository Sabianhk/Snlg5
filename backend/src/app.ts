import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "@config/env";
import { apiLimiter } from "@middleware/rateLimiter";
import { errorHandler } from "@middleware/errorHandler";

import authRoutes from "@routes/auth";
import userRoutes from "@routes/user";
import gameRoutes from "@routes/game";
import leaderboardRoutes from "@routes/leaderboard";
import achievementsRoutes from "@routes/achievements";

export function createApp() {
  const app = express();

  app.use(cors({ origin: env.corsOrigin, credentials: true }));
  app.use(helmet());
  app.use(express.json({ limit: "1mb" }));
  app.use(morgan("dev"));
  app.use("/api", apiLimiter);

  app.get("/health", (_req, res) => res.json({ ok: true }));

  app.use("/api/auth", authRoutes);
  app.use("/api/user", userRoutes);
  app.use("/api/game", gameRoutes);
  app.use("/api/leaderboard", leaderboardRoutes);
  app.use("/api/achievements", achievementsRoutes);

  app.use(errorHandler);
  return app;
}