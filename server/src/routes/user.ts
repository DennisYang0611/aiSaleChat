import { Hono } from "hono";
import { listRes, successRes } from "~/common/res";
import { Users } from "~/db/schema";
import { db, eq } from "~/db";
import { zValidator } from "@hono/zod-validator";
import { paramSchema, pageSchema } from "~/common/zodSchema";

const router = new Hono();

router.get("/api/user", zValidator("query", pageSchema), async (c) => {
  const { page, pageSize } = c.req.valid("query");
  const user = await db
    .select()
    .from(Users)
    .limit(pageSize)
    .offset((page - 1) * pageSize);
  const total = await db.$count(Users);
  return c.json(listRes(user, total, page, pageSize));
});

// 更新用户信息
router.patch("/api/user/:id", zValidator("param", paramSchema), async (c) => {
  const id = c.req.valid("param").id;
  const data = await c.req.json();
  const user = await db
    .update(Users)
    .set(data)
    .where(eq(Users.id, id))
    .returning();
  return c.json(successRes(user));
});

export default router;
