import { Hono } from "hono";
import { failRes, successRes } from "~/common/res";
import { Agents } from "~/db/schema";
import { db, eq } from "~/db";
import { z } from "zod";
import { Context } from "hono";
import { zValidator } from "@hono/zod-validator";

const router = new Hono();

const paramSchema = z.object({
  id: z.coerce.number().min(1, "ID不能为空"),
});

router.get("/api/agent", async (c) => {
  const agents = await db.select().from(Agents).limit(1);
  return c.json(successRes(agents));
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
  const agent = await db
    .insert(Agents)
    .values(data)
    .returning({ id: Agents.id });
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
      .where(eq(Agents.id, id))
      .returning();
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
