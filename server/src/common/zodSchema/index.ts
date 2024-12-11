import { z } from "zod";

export const paramSchema = z.object({
  id: z.string().uuid(),
});

export const pageSchema = z.object({
  page: z.coerce.number().min(1),
  pageSize: z.coerce.number().min(1),
});
