import { isDatabaseConfigured } from "./db";
import { isStorageConfigured } from "./storage";

/** Which halves of the blog backend .env.local already configures. */
export type BlogSetup = { database: boolean; storage: boolean };

export const blogSetup = (): BlogSetup => ({ database: isDatabaseConfigured(), storage: isStorageConfigured() });

export const DATABASE_MISSING =
  "The blog database is not configured yet. Add DATABASE_URL (Neon) to .env.local (see .env.example).";

export const STORAGE_MISSING =
  "Image uploads are not configured yet. Add the R2_* settings (Cloudflare R2) to .env.local (see .env.example).";
