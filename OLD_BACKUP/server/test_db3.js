import "dotenv/config";
import { defineConfig } from "./prisma.config.js";
import { PrismaClient } from '@prisma/client';
console.log("Using Database URL:", process.env.DATABASE_URL);
