import { z } from "zod";

export const MemoQuerySchema = z.object({
  message: z.string().min(1, "Message is required").max(256, "Message must be less than 256 characters"),
});

export type MemoQuery = z.infer<typeof MemoQuerySchema>;