import {
  pgTable,
  serial,
  varchar,
  timestamp,
  pgEnum,
  text,
  numeric,
  boolean,
  jsonb,
} from "drizzle-orm/pg-core";

// 定义许可证状态枚举
export const LicenseStatusEnum = pgEnum("license_status", [
  "PENDING",
  "APPROVED",
  "REJECTED",
]);

export const Users = pgTable("users", {
  // 自动生成的唯一标识符
  id: serial("id").primaryKey(),
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
  // 其他可在用户中心完善的信息字段，按需添加
  additionalInfo: jsonb("additional_info"),
  // 关联该用户创建的Agent表记录的id，是一个数组，用于方便查询该用户下的所有Agent
  agents: jsonb("agents"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const Agents = pgTable("agents", {
  // 自动生成的唯一标识符
  id: serial("id").primaryKey(),
  // 关联用户ID
  userId: serial("user_id")
    .references(() => Users.id)
    .notNull(),
  // Agent名称
  name: varchar("name", { length: 255 }).notNull(),
  // 提示词
  prompt: text("prompt").notNull(),
  // 评分维度
  ratingDimensions: jsonb("rating_dimensions").notNull(),
  // 头像
  avatar: varchar("avatar", { length: 255 }),
  // 简介
  description: text("description"),
  // 对话日志
  dialogueLogs: jsonb("dialogue_logs").default([]),
  // 训练历史
  trainingHistory: jsonb("training_history").default([]),
  // 平均评分
  averageRating: numeric("average_rating").default("0"),
  // 是否可用
  isActive: boolean("is_active").default(true),
  // 创建和更新时间
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const RatingDimensions = pgTable("rating_dimensions", {
  // 自动生成的唯一标识符
  id: serial("id").primaryKey(),
  // 关联的Agent ID
  agentId: serial("agent_id")
    .references(() => Agents.id)
    .notNull(),
  // 评分维度名称
  dimensionName: varchar("dimension_name", { length: 255 }).notNull(),
  // 评分维度描述
  description: text("description").notNull(),
  // 权重
  weight: numeric("weight").notNull(),
  // 创建和更新时间
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const Dialogues = pgTable("dialogues", {
  // 自动生成的唯一标识符
  id: serial("id").primaryKey(),
  // 关联的Agent ID
  agentId: serial("agent_id")
    .references(() => Agents.id)
    .notNull(),
  // 关联的用户ID
  userId: serial("user_id")
    .references(() => Users.id)
    .notNull(),
  // 对话记录
  dialogueLog: jsonb("dialogue_log").default([]).notNull(),
  // 对话开始时间
  startTime: timestamp("start_time").defaultNow().notNull(),
  // 对话结束时间
  endTime: timestamp("end_time"),
  // 会话ID
  sessionId: varchar("session_id", { length: 255 }).notNull(),
  // 创建和更新时间
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const TrainingRecords = pgTable("training_records", {
  // 自动生成的唯一标识符
  id: serial("id").primaryKey(),
  // 关联的Agent ID
  agentId: serial("agent_id")
    .references(() => Agents.id)
    .notNull(),
  // 训练开始时间
  trainingTime: timestamp("training_time").defaultNow().notNull(),
  // 训练结束时间
  trainingEndTime: timestamp("training_end_time"),
  // 训练数据来源
  trainingDataSource: text("training_data_source").notNull(),
  // 训练参数
  trainingParameters: jsonb("training_parameters").default({}).notNull(),
  // 训练结果描述
  trainingResult: text("training_result"),
  // 创建和更新时间
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const AgentRatings = pgTable("agent_ratings", {
  // 自动生成的唯一标识符
  id: serial("id").primaryKey(),
  // 关联的Agent ID
  agentId: serial("agent_id")
    .references(() => Agents.id)
    .notNull(),
  // 关联的用户ID
  userId: serial("user_id")
    .references(() => Users.id)
    .notNull(),
  // 各维度评分详情
  dimensionScores: jsonb("dimension_scores").default([]).notNull(),
  // 总评分
  totalScore: numeric("total_score").notNull(),
  // 评分时间
  ratingDate: timestamp("rating_date").defaultNow().notNull(),
  // 创建和更新时间
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
