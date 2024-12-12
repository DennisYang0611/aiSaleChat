import { Hono } from "hono";
import { failRes, listRes, successRes } from "~/common/res";
import { Agents, UserAgents, Users } from "~/db/schema";
import { db, eq, inArray, count } from "~/db";
import { zValidator } from "@hono/zod-validator";
import { paramSchema, pageSchema } from "~/common/zodSchema";
import { z } from "zod";

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

// 获取用户所有的 Agent
router.get(
  "/api/user/agents",
  zValidator(
    "query",
    pageSchema.extend({
      userId: z.string().uuid(),
    })
  ),
  async (c) => {
    const { page, pageSize, userId } = c.req.valid("query");
    const [agent, total] = await Promise.all([
      db
        .select({
          agent: Agents,
        })
        .from(UserAgents)
        .innerJoin(Agents, eq(Agents.id, UserAgents.agentId))
        .where(eq(UserAgents.userId, userId))
        .limit(pageSize)
        .offset((page - 1) * pageSize)
        .then((rows) => rows.map((row) => row.agent)),
      db
        .select({ count: count() })
        .from(UserAgents)
        .where(eq(UserAgents.userId, userId))
        .then((result) => Number(result[0].count)),
    ]);
    return c.json(listRes(agent, total, page, pageSize));
  }
);

// 给当前用户关联agent
router.post("/api/user/agent", async (c) => {
  try {
    const data = await c.req.json();
    const userAgent = await db.insert(UserAgents).values(data).returning();
    return c.json(successRes(userAgent));
  } catch (error: any) {
    if (error.code === "23505") {
      return c.json(failRes("该用户已关联此Agent"));
    }
    throw error;
  }
});

export default router;
