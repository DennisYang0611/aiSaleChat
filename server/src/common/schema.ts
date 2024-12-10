import { z } from "zod";

export const pageSchema = z.object({
  page: z
    .string()
    .transform((val) => Number(val))
    .default("1"),
  pageSize: z
    .string()
    .transform((val) => Number(val))
    .default("10"),
});
