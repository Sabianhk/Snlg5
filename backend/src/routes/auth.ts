import { Router } from "express";
import { z } from "zod";
import { loginUser, registerUser } from "@services/authService";
import { signAccessToken, signRefreshToken, verifyToken } from "@utils/jwt";

const router = Router();

const registerSchema = z.object({
  username: z.string().min(3).max(24),
  email: z.string().email(),
  password: z.string().min(8),
});

router.post("/register", async (req, res, next) => {
  try {
    const { username, email, password } = registerSchema.parse(req.body);
    const user = await registerUser(username, email, password);
    res.status(201).json({ user: { id: user.id, username: user.username, email: user.email } });
  } catch (err) {
    next(err);
  }
});

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(8) });

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const { user, accessToken, refreshToken } = await loginUser(email, password);
    res.json({
      user: { id: user.id, username: user.username, email: user.email },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    next(err);
  }
});

const refreshSchema = z.object({ refreshToken: z.string() });

router.post("/refresh", async (req, res, next) => {
  try {
    const { refreshToken } = refreshSchema.parse(req.body);
    const { userId } = verifyToken(refreshToken);
    const accessToken = signAccessToken({ userId });
    const newRefresh = signRefreshToken({ userId });
    res.json({ accessToken, refreshToken: newRefresh });
  } catch (err) {
    next(err);
  }
});

router.post("/logout", async (_req, res) => {
  res.json({ message: "Logged out" });
});

export default router;