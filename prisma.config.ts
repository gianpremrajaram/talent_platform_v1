// prisma.config.ts
import { defineConfig } from "prisma/config";
import "dotenv/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    // 👇 seed command goes here, as a string
    seed: "tsx prisma/seed.ts",
  },
  engine: "classic",
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});
