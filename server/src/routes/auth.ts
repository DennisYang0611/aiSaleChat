import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { failRes, successRes } from "~/common/res";
import bcrypt from "bcrypt";
import { sign } from "hono/jwt";
import { db, eq } from "~/db";
import { Users } from "~/db/schema";
import console from "console";

const router = new Hono();

const loginSchema = z.object({
  email: z.string().min(1, "用户名不能为空"),
  password: z.string().min(6, "密码不能少于6位"),
});

router.post("/api/auth/login", zValidator("json", loginSchema), async (c) => {
  const { email, password } = c.req.valid("json");

  const result = await db
    .select()
    .from(Users)
    .where(eq(Users.email, email))
    .limit(1);

  if (!result.length) {
    return c.json(failRes("用户不存在"));
  }

  const user = result[0];
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return c.json(failRes("密码错误"));
  }

  const token = await sign(user, process.env.JWT_SECRET!);

  const { password: _, ...userWithoutPassword } = user;

  return c.json({
    code: 0,
    data: {
      user: userWithoutPassword,
    },
    message: "登录成功",
  });
});

// 注册用户
const registerSchema = z.object({
  username: z.string().min(1, "用户名不能为空"),
  email: z.string().min(1, "邮箱不能为空"),
  password: z.string().min(6, "密码不能少于6位"),
});

router.post(
  "/api/auth/register",
  zValidator("json", registerSchema),
  async (c) => {
    const { username, email, password } = c.req.valid("json");

    const existingUser = await db
      .select()
      .from(Users)
      .where(eq(Users.email, email))
      .limit(1);

    if (existingUser.length) {
      return c.json(failRes("用户已存在"));
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.insert(Users).values({
      username,
      email,
      password: hashedPassword,
    });

    return c.json(successRes("注册成功"));
  }
);

export default router;
