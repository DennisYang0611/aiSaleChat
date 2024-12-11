import {
  pgTable,
  varchar,
  timestamp,
  pgEnum,
  text,
  boolean,
  jsonb,
  uuid,
} from "drizzle-orm/pg-core";

// 定义许可证状态枚举
export const LicenseStatusEnum = pgEnum("license_status", [
  "PENDING",
  "APPROVED",
  "REJECTED",
]);

export const Users = pgTable("users", {
  // 自动生成的唯一标识符
  id: uuid("id").primaryKey().defaultRandom(),
  // 用户名，必填项
  username: varchar("username", { length: 255 }).notNull(),
  // 用户邮箱，必填项，可用于登录验证等，要求唯一
  email: varchar("email", { length: 255 }).notNull().unique(),
  // 用户密码，存储加密后的密码，必填项
  password: varchar("password", { length: 255 }).notNull(),
  // 用户注册时间，自动记录注册时的时间戳
  registrationDate: timestamp("registration_date").defaultNow().notNull(),
  // 上次登录时间，每次登录时更新该字段
  lastLogin: timestamp("last_login").defaultNow().notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const Agents = pgTable("agents", {
  // 自动生成的唯一标识符
  id: uuid("id").primaryKey().defaultRandom(),
  // 创建人 ID
  creatorId: uuid("creator_id")
    .references(() => Users.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .notNull(),
  // Agent名称
  name: varchar("name", { length: 255 }).notNull(),
  // 提示词
  prompt: jsonb("prompt").notNull(),
  // 评分维度
  ratingDimensions: jsonb("rating_dimensions").notNull(),
  // 头像
  avatar: varchar("avatar", { length: 255 }),
  // 简介
  description: text("description"),

  // 是否可用
  isActive: boolean("is_active").default(true),
  // 创建和更新时间
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const TrainingRecords = pgTable("training_records", {
  // 自动生成的唯一标识符
  id: uuid("id").primaryKey().defaultRandom(),
  // 关联的Agent ID
  agentId: uuid("agent_id")
    .references(() => Agents.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .notNull(),
  // 训练开始时间
  trainingTime: timestamp("training_time").defaultNow().notNull(),
  // 训练结束时间
  trainingEndTime: timestamp("training_end_time"),
  // 训练数据来源
  trainingDataSource: text("training_data_source").notNull(),
  // 训练结果描述
  trainingResult: text("training_result"),

  // 评分
  ratings: jsonb("ratings").notNull(),

  // 添加训练状态字段
  status: varchar("status", { length: 50 }).default("pending").notNull(),
  // 创建和更新时间
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const Messages = pgTable("messages", {
  // 自动生成的唯一标识符
  id: uuid("id").primaryKey().defaultRandom(),
  // 关联的Agent ID
  agentId: uuid("agent_id")
    .references(() => Agents.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .notNull(),
  // 关联的训练记录 ID
  trainingRecordId: uuid("training_record_id")
    .references(() => TrainingRecords.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .notNull(),
  // 关联的用户ID
  userId: uuid("user_id")
    .references(() => Users.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .notNull(),
  // 对话记录
  content: jsonb("content").default([]).notNull(),

  // 创建和更新时间
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
