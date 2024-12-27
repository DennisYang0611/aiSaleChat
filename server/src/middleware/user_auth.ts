import { Context, Next } from "hono";
import { verify } from "hono/jwt";
import { Users } from "~/db/schema";
import { db, eq } from "~/db";

export async function userAuth(c: Context, next: Next) {
  // 不需要校验的接口
  const noAuthPaths = ["/api/auth/login", "/api/auth/register"];

  // 检查当前请求路径是否需要校验
  // const path = c.req.path;
  // if (noAuthPaths.includes(path)) {
  //   await next();
  //   return;
  // }

  // try {
  //   // 从请求头获取 token
  //   const token = c.req.header("Authorization")?.split(" ")[1];
  //   if (!token) {
  //     return c.json({ code: 401, message: "未授权" });
  //   }

  //   // 验证 token
  //   const payload = await verify(token, process.env.JWT_SECRET || "secret");
  //   if (!payload) {
  //     return c.json({ code: 401, message: "token 无效" });
  //   }

  //   // 获取用户信息
  //   const user = await db
  //     .select()
  //     .from(Users)
  //     .where(eq(Users.id, payload.id as string))
  //     .limit(1);

  //   if (!user || user.length === 0) {
  //     return c.json({ code: 401, message: "用户不存在" });
  //   }

  //   // 将用户信息放到 context 中
  //   c.set("userId", { userId: user[0].id });
  //   c.set("user", user[0]);

  //   await next();
  // } catch (error) {
  //   console.log(error);
  //   return c.json({ code: 401, message: "认证失败" });
  // }

  // 获取用户信息
  const user = await db
    .select()
    .from(Users)
    .where(eq(Users.id, "fe9d6b54-40d7-4d56-a3b1-50c21feeeb41"))
    .limit(1);

  if (!user || user.length === 0) {
    return c.json({ code: 401, message: "用户不存在" });
  }

  // 将用户信息放到 context 中
  c.set("userId", { userId: user[0].id });
  c.set("user", user[0]);

  await next();
}
