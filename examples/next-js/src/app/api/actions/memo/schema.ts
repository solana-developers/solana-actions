import { z } from "zod";
import { publicKeySchema } from "../../utils/validation";

export const MemoQuerySchema = z.object({
  message: z.string().min(1, "Message is required"),
});

export type MemoQuery = z.infer<typeof MemoQuerySchema>;

export const MemoBodySchema = z.object({
  account: publicKeySchema,
});

export type MemoBody = z.infer<typeof MemoBodySchema>;