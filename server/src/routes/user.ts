import { Hono } from "hono";
import { successRes } from "~/common/res";
import { Users } from "~/db/schema";
import { db } from "~/db";

const router = new Hono();

router.get("/api/user", async (c) => {
  const user = await db.select().from(Users).limit(1);
  return c.json(successRes(user));
});

export default router;
