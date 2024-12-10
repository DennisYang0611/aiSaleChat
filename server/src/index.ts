import { serve } from "@hono/node-server";
import { Hono } from "hono";
import userRouter from "./routes/user";
import authRouter from "./routes/auth";

const app = new Hono();

app.route("/", userRouter);
app.route("/", authRouter);

const port = 3100;
console.log(`Server is running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
