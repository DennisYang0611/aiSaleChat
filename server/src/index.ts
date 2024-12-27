import { serve } from "@hono/node-server";
import { Hono } from "hono";
import userRouter from "./routes/user";
import authRouter from "./routes/auth";
import agentRouter from "./routes/agent";
import trainingRouter from "./routes/tranning_record";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { successRes } from "~/common/res";
import { userAuth } from "~/middleware/user_auth";
const app = new Hono();

app.get("/", (c) => {
  return c.json(successRes("Hello World"));
});

app.use("/api/*", userAuth);

app.use("/api/*", cors());
app.use("/api/*", logger());

app.route("/", userRouter);
app.route("/", authRouter);
app.route("/", trainingRouter);
app.route("/", agentRouter);
const port = 3100;
console.log(`Server is running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
