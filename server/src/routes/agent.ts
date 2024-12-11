import { Hono } from "hono";
import { failRes, listRes, successRes } from "~/common/res";
import { Agents } from "~/db/schema";
import { db, eq } from "~/db";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { pageSchema, paramSchema } from "~/common/zodSchema";

const router = new Hono();

router.get("/api/agent", zValidator("query", pageSchema), async (c) => {
  const { page, pageSize } = c.req.valid("query");
  const offset = (page - 1) * pageSize;

  const [agents, total] = await Promise.all([
    db.select().from(Agents).limit(pageSize).offset(offset),
    db.$count(Agents),
  ]);

  return c.json(listRes(agents, total, page, pageSize));
});

// 获取单个
router.get("/api/agent/:id", zValidator("param", paramSchema), async (c) => {
  const id = c.req.valid("param").id;
  const agent = await db.select().from(Agents).where(eq(Agents.id, id));
  if (!agent.length) {
    return c.json(failRes("未找到该Agent"));
  }
  return c.json(successRes(agent));
});

// 创建
router.post("/api/agent", async (c) => {
  const data = await c.req.json();

  const agent = await db.insert(Agents).values(data).returning();
  return c.json(successRes(agent));
});

// 更新
const schema = z.object({
  name: z.string().min(1, "名称不能为空"),
});
router.patch(
  "/api/agent/:id",
  zValidator("param", paramSchema),
  zValidator("json", schema),
  async (c) => {
    const { name } = c.req.valid("json");
    const id = c.req.valid("param").id;

    const agent = await db
      .update(Agents)
      .set({
        name,
      })
      .where(eq(Agents.id, id));
    if (!agent.length) {
      return c.json(failRes("未找到该Agent"));
    }
    return c.json(successRes(agent));
  }
);

// 删除
router.delete("/api/agent/:id", zValidator("param", paramSchema), async (c) => {
  const id = c.req.valid("param").id;
  await db.delete(Agents).where(eq(Agents.id, id));
  return c.json(successRes({}));
});

export default router;
