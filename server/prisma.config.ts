/**
 * Prisma v7 Configuration File
 * 
 * Migration configuration for Prisma v7 which no longer supports
 * the 'url' property in schema.prisma. Database connection is now
 * configured through this file.
 * 
 * @see https://www.prisma.io/docs/orm/more/upgrade-guides/upgrading-versions/upgrading-to-prisma-7
 */

// MUST be imported first to load environment variables
import "dotenv/config";

import { defineConfig } from "prisma/config";

// Debug: Check if DATABASE_URL is loaded
console.log("[Prisma Config] DATABASE_URL:", process.env.DATABASE_URL);

if (!process.env.DATABASE_URL) {
  console.error("[Prisma Config] ERROR: DATABASE_URL environment variable is not set!");
  console.error("[Prisma Config] Please ensure .env file contains DATABASE_URL");
  throw new Error("Missing required environment variable: DATABASE_URL");
}

export default defineConfig({
  /**
   * Root level datasource configuration for Prisma v7
   */
  datasource: {
    url: process.env.DATABASE_URL!,
  },
  
  /**
   * Migration configuration
   */
  migrate: {},
});
