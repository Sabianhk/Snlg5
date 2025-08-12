import bcrypt from "bcryptjs";
import { prisma } from "@lib/prisma";
import { signAccessToken, signRefreshToken } from "@utils/jwt";

export async function registerUser(username: string, email: string, password: string) {
  const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { username }] } });
  if (existing) {
    throw { status: 409, message: "Username or email already in use" };
  }
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({ data: { username, email, passwordHash } });
  return user;
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw { status: 401, message: "Invalid credentials" };
  }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw { status: 401, message: "Invalid credentials" };
  }
  const accessToken = signAccessToken({ userId: user.id });
  const refreshToken = signRefreshToken({ userId: user.id });
  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  return { user, accessToken, refreshToken };
}