import { serve } from "@hono/node-server";
import { Hono } from "hono";
import userRouter from "./routes/user";
import authRouter from "./routes/auth";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { successRes } from "~/common/res";
const app = new Hono();

app.get("/", (c) => {
  return c.json(successRes("Hello World"));
});

app.use("/api/*", cors());
app.use("/api/*", logger());

app.route("/", userRouter);
app.route("/", authRouter);

const port = 3100;
console.log(`Server is running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
