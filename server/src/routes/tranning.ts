import { Hono } from "hono";
import { successRes } from "~/common/res";
import { TrainingRecords } from "~/db/schema";
import { db, eq } from "~/db";
import { zValidator } from "@hono/zod-validator";
import { pageSchema, paramSchema } from "~/common/zodSchema";

const router = new Hono();

// 添加训练记录
router.post("/api/agent/training", async (c) => {
  const data = await c.req.json();
  console.log(data);
  const training = await db.insert(TrainingRecords).values(data).returning();
  return c.json(successRes(training));
});

// 获取训练记录
router.get(
  "/api/agent/training",
  zValidator("query", pageSchema),
  async (c) => {
    const training = await db.select().from(TrainingRecords);
    return c.json(successRes(training));
  }
);

// 更新训练记录
router.patch(
  "/api/agent/training/:id",
  zValidator("param", paramSchema),
  async (c) => {
    const id = c.req.param("id");
    const data = await c.req.json();
    const training = await db
      .update(TrainingRecords)
      .set(data)
      .where(eq(TrainingRecords.id, id));
    return c.json(successRes(training));
  }
);

// 删除训练记录
router.delete(
  "/api/agent/training/:id",
  zValidator("param", paramSchema),
  async (c) => {
    const id = c.req.param("id");
    const training = await db
      .delete(TrainingRecords)
      .where(eq(TrainingRecords.id, id));
    return c.json(successRes(training));
  }
);

export default router;
