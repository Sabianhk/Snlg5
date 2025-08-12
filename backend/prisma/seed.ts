import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  const achievements = [
    { name: "First Steps", description: "Play your first game", icon: "first_steps", requirement: "games>=1" },
    { name: "Bridge Master", description: "Climb 5 magic bridges in a game", icon: "bridge_master", requirement: "bridges>=5" },
    { name: "Portal Survivor", description: "Survive 3 portal traps in a game", icon: "portal_survivor", requirement: "traps>=3" },
  ];

  for (const ach of achievements) {
    await prisma.achievement.upsert({ where: { name: ach.name }, create: ach, update: ach });
  }

  const email = "demo@example.com";
  const username = "demo";
  const passwordHash = await bcrypt.hash("demopassword", 12);
  await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, username, passwordHash },
  });

  console.log("Seed complete");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});