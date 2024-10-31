import { numberFromStringSchema } from "@/app/api/utils/validation";
import { z } from "zod";
export const LamportsSchema = z.object({
  blink: z.string(),
  protectAccount: z.string(),
  solSpend: numberFromStringSchema({ min: 0, max: 1 }).default("0.001"),
});
