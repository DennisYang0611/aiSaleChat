// drizzle.config.ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  dbCredentials: {
    url: "postgresql://postgres:rkr6jhvl@salechat-postgresql.ns-sazklie5.svc:5432/salechat",
  },
});
