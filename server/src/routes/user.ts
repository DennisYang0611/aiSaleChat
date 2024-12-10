import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { failRes, successRes } from "~/common/res";
import bcrypt from "bcrypt";
import { sign } from "hono/jwt";
import { Users } from "~/db/schema";
import { db, eq } from "~/db";

const router = new Hono();

router.get("/api/user", async (c) => {
  const user = await db.select().from(Users).limit(1);
  return c.json(successRes(user));
});

export default router;
