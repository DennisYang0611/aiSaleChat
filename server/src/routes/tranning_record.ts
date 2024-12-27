import { Hono, Context } from "hono";
import { successRes } from "~/common/res";
import { TrainingRecords } from "~/db/schema";
import { db, eq } from "~/db";
import { zValidator } from "@hono/zod-validator";
import { pageSchema, paramSchema } from "~/common/zodSchema";
import { z } from "zod";

const router = new Hono();

// 添加训练记录
router.post("/api/agent/trainingRecord", async (c) => {
  const data = await c.req.json();
  const trainingRecord = await db
    .insert(TrainingRecords)
    .values(data)
    .returning();
  return c.json(successRes(trainingRecord[0]));
});

// 获取训练记录
router.get(
  "/api/agent/trainingRecord",
  zValidator("query", pageSchema),
  async (c: Context) => {
    const userId = c.get("userId");
    const trainingRecord = await db
      .select()
      .from(TrainingRecords)
      .where(eq(TrainingRecords.userId, userId.userId));
    return c.json(successRes(trainingRecord));
  }
);

// 获取单个训练记录
router.get(
  "/api/agent/trainingRecord/:id",
  zValidator("param", paramSchema),
  async (c) => {
    const id = c.req.param("id");
    const trainingRecord = await db
      .select()
      .from(TrainingRecords)
      .where(eq(TrainingRecords.id, id))
      .limit(1);
    return c.json(successRes(trainingRecord[0]));
  }
);

// 更新训练记录
router.put(
  "/api/agent/trainingRecord/:id",
  zValidator("param", paramSchema),
  async (c) => {
    const id = c.req.param("id");
    const data = await c.req.json();
    const trainingRecord = await db
      .update(TrainingRecords)
      .set(data)
      .where(eq(TrainingRecords.id, id));
    return c.json(successRes(trainingRecord));
  }
);

// 更新训练记录 message
router.put(
  "/api/agent/trainingRecord/:id/message",
  zValidator("param", paramSchema),
  zValidator(
    "json",
    z.object({
      messages: z.array(
        z.object({
          role: z.string(),
          content: z.string(),
        })
      ),
    })
  ),
  async (c) => {
    const id = c.req.param("id");
    const data = c.req.valid("json");
    const trainingRecord = await db
      .update(TrainingRecords)
      .set({ messages: data.messages })
      .where(eq(TrainingRecords.id, id));
    return c.json(successRes(trainingRecord));
  }
);

// 删除训练记录
router.delete(
  "/api/agent/trainingRecord/:id",
  zValidator("param", paramSchema),
  async (c) => {
    const id = c.req.param("id");
    const trainingRecord = await db
      .delete(TrainingRecords)
      .where(eq(TrainingRecords.id, id));
    return c.json(successRes(trainingRecord));
  }
);

export default router;
